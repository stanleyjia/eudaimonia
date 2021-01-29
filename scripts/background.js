
var db = firebase.database();

// Indicator variables
var userExists = false;
let userSignedIn = false;
var currentUser = null;



var tabs;
var currentTab;
var activity = new Activity();

var timeIntervalList = [];
var moodsList = [];


var promptForLog = false;
var promptForLogChanged = false;


var chromeTime = 0;
var notInChromeTime = 0;

// how much time using chrome before prompt to log mood (in seconds)
// const PROMPT_TIMER = 5; // 5 seconds
const PROMPT_TIMER = 1500; // 25 minutes


// how much time not using chrome before counting as inactive
// const INACTIVE_TIMER = 5; // 5 seconds
const INACTIVE_TIMER = 180; // 3 minutes


// how often to update firebase database (timeIntervals and moods)
// const FIREBASE_UPDATE_FREQ = 10000; // 10 seconds
const FIREBASE_UPDATE_FREQ = 1000; // 1 seconds




function showPromptIcon(status) {
  console.log("change icon");
  if (status) {
    chrome.browserAction.setIcon({ path: '../img/logo/logo_notif48.png' });
  } else {
    chrome.browserAction.setIcon({ path: '../img/logo/logo48.png' });
  }
}

function clearLocalData() {
  timeIntervalList = [];
  moodsList = [];
  tabs = [];
}

function updateLocalVariables(user) {
  // Update Intervals and Moods List
  // Realtime Database to local storage

  // get current time intervals and insert into timeIntervalList
  var today = getToday(); // 12/29/2000
  db.ref(`web/${user.uid}/${today}`).once("value", function (snapshot) {
    snapshot.forEach((child) => {
      // console.log(child.key, child.val());
      var newInterval = new TimeInterval(today, decodeURL(child.key));
      var data = child.val();
      for (let innerKey in data) {
        // console.log(innerKey, data[innerKey]);
        newInterval.intervals.push(innerKey + '-' + data[innerKey]);
      }
      timeIntervalList.push(newInterval);
    });
    console.log(timeIntervalList);
  });


  // Update Local Moods -- insert into Moods List
  db.ref(`moods/${user.uid}/${today}`).once("value", function (snapshot) {
    snapshot.forEach((child) => {
      // console.log(child.key, child.val());
      var data = child.val();
      var newMood = new Mood(today, child.key, data.mood);
      moodsList.push(newMood);
    });
  });
}
// User logged in or logged out
firebase.auth().onAuthStateChanged(function (user) {
  // console.log('auth state changed');
  clearLocalData();
  if (user) {
    console.log(`[onAuthStateChanged] user signed in: ${user.uid}`);
    currentUser = user;
    userSignedIn = true;

    checkUserExists(user);
    updateLocalVariables(user);
  }
  else {
    console.log("[onAuthStateChanged] user not signed in");
    userSignedIn = false;
  }
});

// Check if installed or updated
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == 'install') {
    // newly installed
    console.log("Extension Installed");

  }
  if (details.reason == 'update') {
    // newly updated
    console.log("Extension Updated");
  }
});

chrome.tabs.onActivated.addListener(function (info) {
  chrome.tabs.get(info.tabId, function (tab) {
    activity.addTab(tab);
  });
});

chrome.webNavigation.onCompleted.addListener(function (details) {
  chrome.tabs.get(details.tabId, function (tab) {
    activity.updateFavicon(tab);
  });
});

// recieve messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // console.log(request.message);
  if (request.message === 'is_user_signed_in') {
    sendResponse({
      message: 'success',
      payload: userSignedIn
    });
  } else if (request.message === 'sign_out') {
    userSignedIn = false;
    firebase.auth().signOut().then(() => {
      // Sign-out successful.
      sendResponse({ message: 'success' });
    }).catch((error) => {
      // An error happened.
      sendResponse({ message: 'error' });
    });
  }
  else if (request.message === 'sign_in') {
    // console.log("sign in message received");
    userSignedIn = true;
    sendResponse({ message: 'success' });
  }
  else if (request.message === 'mood_clicked') {
    // console.log(`Mood Button clicked: ${request.mood1}, ${request.mood2} `);
    var time = getTime();
    var mood_instance = new Mood(getToday(), time, request.mood);
    // check if mood was entered twice (same timestamp)
    var items = moodsList.filter(item => item.mood == mood_instance.mood && item.day == mood_instance.day && item.time == mood_instance.time);
    if (items.length == 0) {
      moodsList.push(mood_instance);
    } else {
      console.log("[mood clicked] mood already logged");
    }
    // Reset prompt
    chromeTime = 0;
    notInChromeTime = 0;
    promptForLog = false;
    showPromptIcon(promptForLog);


    sendResponse({ message: 'success' });
  }
  else if (request.message === 'get_moods_count') {
    // console.log("recieved count_moods request", moodsList.length);
    sendResponse({ message: 'success', count: moodsList.length });
  }
  return true;
});


function storeMoodsList(user) {
  var dateStr = getToday();
  var updates = {};
  moodsList = moodsList.filter(mood => mood.day == dateStr);
  for (i = 0; i < moodsList.length; i++) {
    var this_mood = moodsList[i];
    var timestamp = this_mood.time;
    var moodData = {
      "mood": this_mood.mood
    };
    updates[timestamp] = moodData;
  }
  db.ref(`moods/${user.uid}/${dateStr}/`).update(updates);
}


function updateFirebaseDatabase() {
  // console.log("update firebase");
  // console.log(moodsList);
  if (userSignedIn == false) {
    return;
  }
  if (timeIntervalList != undefined && timeIntervalList.length > 0) {
    storeTimeIntervals(currentUser);
  }

  if (moodsList != undefined && moodsList.length > 0) {
    // console.log(moodsList);
    storeMoodsList(currentUser);
  }
}


function bgCheck() {
  // runs each second
  if (userSignedIn == false) {
    return;
  }
  if (promptForLogChanged) {
    showPromptIcon(promptForLog);
    promptForLogChanged = false;
  }

  if (chromeTime >= PROMPT_TIMER) {
    // showPromptIcon(promptForLog);
    // console.log("SHOW PROMPT");
    if (promptForLogChanged == false) {
      promptForLogChanged = true;
    }
    promptForLog = true;
    chromeTime = 0;
  }

  // console.log(moodsList);

  chrome.windows.getAll(function (windows) {
    // console.log(windows.length);
    if (windows.length != 0) {
      getLastFocused();
    }
  });
}

function getLastFocused() {
  chrome.windows.getLastFocused({ populate: true }, function (currentWindow) {
    // if currentWindow is not a chrome settings page
    if (currentWindow != undefined) {
      // console.log("HERE 1");
      if (currentWindow.focused) {
        // console.log(promptForLog);
        if (promptForLog == false) {
          notInChromeTime = 0;
          chromeTime += 1;
          // console.log(`Chrome time: ${chromeTime} `);
        }
        // get active tab in focused window
        var activeTab = currentWindow.tabs.find(t => t.active === true);
        if (activeTab != undefined && activity.isValidPage(activeTab)) {
          // console.log(activeTab.url);
          var activeUrl = activity.extractHostname(activeTab.url);
          // console.log(activeUrl);
          var tab = activity.getTab(activeUrl);
          // console.log(tab);
          if (tab === undefined) {
            // if no tab has been found for activity
            // Add tab to activity
            activity.addTab(activeTab);
          }
          if (tab !== undefined) {
            // if idle for time (in seconds) stop current interval (300 = 5 minutes)
            chrome.idle.queryState(300, function (state) {
              // console.log(state);
              if (state === 'active') {
                if (currentTab !== tab.url) {
                  // Set time interval for new current tab
                  // console.log("set time interval for new current tab");
                  activity.setCurrentActiveTab(tab.url);
                }
              } else checkDOM(state, activeUrl, tab, activeTab);
            });
          }
        }
      } else {
        // not in chrome
        if (promptForLog == false) {
          notInChromeTime += 1;
          // console.log(`not using chrome: ${notInChromeTime}`);
          if (notInChromeTime >= INACTIVE_TIMER) {
            // console.log("RESET ACTIVE TIMER");
            chromeTime = 0;
            notInChromeTime = 0;
          }
        }
        activity.closeIntervalForCurrentTab();
      }
    }
  });
}


// Check if on Youtube or Netflix
function checkDOM(state, activeUrl, tab, activeTab) {
  // console.log("checkDom running");
  if (state === 'idle' && isDomainEquals(activeUrl, "youtube.com")) {
    // trackForYT(mainTRacker, activeUrl, tab, activeTab);
  } else if (state === 'idle' && isDomainEquals(activeUrl, "netflix.com")) {
    // trackForNetflix(mainTRacker, activeUrl, tab, activeTab);
  } else {
    // Idle for 30 seconds
    activity.closeIntervalForCurrentTab();
  }
}

function trackForYT(callback, activeUrl, tab, activeTab) {
  console.log(`permission for youtube ${isHasPermissionForYouTube}`);
  if (isHasPermissionForYouTube) {
    executeScriptYoutube(callback, activeUrl, tab, activeTab);
  } else {
    checkPermissionsForYT(executeScriptYoutube, activity.closeIntervalForCurrentTab, callback, activeUrl, tab, activeTab);
  }
}

function trackForNetflix(callback, activeUrl, tab, activeTab) {
  if (isHasPermissioForNetflix) {
    executeScriptNetflix(callback, activeUrl, tab, activeTab);
  } else {
    checkPermissionsForNetflix(executeScriptNetflix, activity.closeIntervalForCurrentTab, callback, activeUrl, tab, activeTab);
  }
}

function executeScriptYoutube(callback, activeUrl, tab, activeTab) {
  console.log("running on youtube");
  chrome.tabs.executeScript({ code: "var videoElement = document.getElementsByTagName('video')[0]; (videoElement !== undefined && videoElement.currentTime > 0 && !videoElement.paused && !videoElement.ended && videoElement.readyState > 2);" }, (results) => {
    if (results !== undefined && results[0] !== undefined && results[0] === true)
      callback(activeUrl, tab, activeTab);
    else activity.closeIntervalForCurrentTab();
  });
}

function executeScriptNetflix(callback, activeUrl, tab, activeTab) {

  chrome.tabs.executeScript({ code: "var videoElement = document.getElementsByTagName('video')[0]; (videoElement !== undefined && videoElement.currentTime > 0 && !videoElement.paused && !videoElement.ended && videoElement.readyState > 2);" }, (results) => {
    if (results !== undefined && results[0] !== undefined && results[0] === true) {
      callback(activeUrl, tab, activeTab);
    } else {
      activity.closeIntervalForCurrentTab();
    }
  });
}


function updateTime() {
  // Run bgCheck every second
  setInterval(bgCheck, 1000);
}

// update firebase database
function updateStorage() {
  setInterval(updateFirebaseDatabase, FIREBASE_UPDATE_FREQ);
}

updateTime();
updateStorage();
