

DEBUG_PRINT = true;

// FIREBASE CONFIG FOR EUDAIMONIA

const firebaseConfig = {
  apiKey: "AIzaSyA81iaieyP5BPXTZf9V1M_xYS-sJxRPGKc",
  authDomain: "eudaimonia-f99b5.firebaseapp.com",
  projectId: "eudaimonia-f99b5",
  storageBucket: "eudaimonia-f99b5.appspot.com",
  messagingSenderId: "280495522376",
  appId: "1:280495522376:web:bf97aca351d7a867128e7d"
};

// FIREBASE CONFIG FOR JOSEPH'S DATABASE
/*
const firebaseConfig = {
  apiKey: "AIzaSyBj7fmZRv_SCFXClGvWKN_QFr-_vxv_42w",
  authDomain: "user-auth-development.firebaseapp.com",
  databaseURL: "https://user-auth-development-default-rtdb.firebaseio.com",
  projectId: "user-auth-development",
  storageBucket: "user-auth-development.appspot.com",
  messagingSenderId: "496590033273",
  appId: "1:496590033273:web:c2f3ca11a7ddf2c6fa9fa8"
};*/


firebase.initializeApp(firebaseConfig);
var db = firebase.database();

// Indicator variables
var userExists = false;
var dayExists = false;


let user_signed_in = false;
var userUID = "";
var currentUser = null;

var tabs;
var timeIntervalList = [];
var currentTab;
var activity = new Activity();

var moodsList = [];

var promptForLog = true;
var promptForLogChanged = false;

function showPromptIcon(status) {
  console.log("change icon");
  if (status) {
    chrome.browserAction.setIcon({ path: '../img/square-32.png' });
  } else {
    chrome.browserAction.setIcon({ path: '../img/obj-32.png' });
  }
}

function checkWhetherPromptUser() {

}



firebase.auth().onAuthStateChanged(function (user) {
  // console.log('auth state changed');
  if (user) {
    console.log(`[onAuthStateChanged] user signed in: ${user.uid}`);
    // console.log(user.uid);
    timeIntervalList = []; // reset timeIntervalList
    currentUser = user;
    userUID = user.uid;
    user_signed_in = true;
    // checkDocumentExistsForUser(user);
    checkUserExists(user);

    // Update Local Intervals
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
        console.log(child.key, child.val());
        var data = child.val();
        var newMood = new Mood(today, child.key, data.mood1, data.mood2);
        moodsList.push(newMood);
      });
      // console.log(moodsList);
    });



  }
  else {
    console.log("[onAuthStateChanged] user not signed in");
    user_signed_in = false;
  }
});


function checkUserExists(user) {
  db.ref(`users/${user.uid}`).once("value", snapshot => {
    if (snapshot.exists()) {
      console.log("[checkUserExists] user exists");
      userExists = true;
    } else {
      console.log("[checkUserExists] user doesn't exist");
      createUser(user);
    }
  });
}

function createUser(user) {
  db.ref(`users/${user.uid}`).set({
    name: user.displayName,
    email: user.email,
    photoUrl: user.photoURL,
    emailVerified: user.emailVerified,
    uid: user.uid
  });
  userExists = true;
  console.log("[createUser] user created");
}

function getToday() {
  return new Date().toLocaleDateString("en-US").split('/').join('-');
}

// Check if installed or updated
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == 'install') {
    // newly installed
    console.log("Extension Installed");

  }
  if (details.reason == 'update') {
    // newly updated
    console.log("Extension Updated");
    // user_signed_in = false;
  }
});


// change sign in status from content scripts
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // console.log(request.message);
  if (request.message === 'is_user_signed_in') {
    sendResponse({
      message: 'success',
      payload: user_signed_in
    });
  } else if (request.message === 'sign_out') {
    user_signed_in = false;
    firebase.auth().signOut().then(() => {
      // Sign-out successful.
      sendResponse({ message: 'success' });
    }).catch((error) => {
      // An error happened.
      sendResponse({ message: 'error' });
    });
  }
  else if (request.message === 'sign_in') {
    console.log("sign in message received");
    user_signed_in = true;
    sendResponse({ message: 'success' });
  }
  else if (request.message === 'mood_clicked') {
    // console.log(`Mood Button clicked: ${request.mood1}, ${request.mood2} `);
    var today = new Date();
    var time = getTime();
    var mood_instance = new Mood(getToday(), time, request.mood1, request.mood2);
    // check if mood was entered twice (same timestamp)
    var items = moodsList.filter(item => item.mood == mood_instance.mood && item.day == mood_instance.day && item.time == mood_instance.time);
    if (items.length == 0) {
      moodsList.push(mood_instance);
    } else {
      console.log("[mood clicked] mood already logged");
    }
    // Reset prompt
    promptForLog = false;
    promptForLogChanged = true;


    sendResponse({ message: 'success' });
  }
  else if (request.message === 'get_moods_count') {
    // console.log("recieved count_moods request", moodsList.length);
    sendResponse({ message: 'success', count: moodsList.length });
  }
  return true;
});



function updateTime() {
  // Run bgCheck every second
  setInterval(bgCheck, 1000);
}

// update storage (firebase)
function updateStorage() {
  setInterval(backgroundUpdateStorage, 3000);
}

function encodeURL(url) {
  url = encodeURIComponent(url);
  url = url.replace(/\./g, '%2E');
  return url;
}

function decodeURL(url) {
  replacePeriod = url.replace('%2E', '.');
  return decodeURIComponent(replacePeriod);
}

function getTime() {
  var date = new Date();
  var stringDate = date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0') + ':' + date.getSeconds().toString().padStart(2, '0');
  return stringDate;
}
function storeTimeIntervals(user) {
  // timeIntervalList
  // var this_date = timeIntervalList[0].day;
  var today = getToday();
  var updates = {};
  timeIntervalList = timeIntervalList.filter(interval => interval.day == today);
  for (i = 0; i < timeIntervalList.length; i++) {
    var timeInterval = timeIntervalList[i];
    if (timeInterval.day != today) {
      console.log("Error: multiple days in timeIntervalList!!");
    }
    var encodedDomain = encodeURL(timeInterval.domain);
    // var dateStr = timeInterval.day.split('/').join('-');
    var intervalData = {};
    for (j = 0; j < timeInterval.intervals.length; j++) {
      var interval = timeInterval.intervals[j];
      var start = interval.split('-')[0];
      var end = interval.split('-')[1];
      intervalData[start] = end;
    }
    updates[encodedDomain] = intervalData;
  }
  db.ref(`web/${user.uid}/${today}/`).update(updates);
}

function storeMoodsList(user) {
  var dateStr = getToday();
  var updates = {};
  moodsList = moodsList.filter(mood => mood.day == dateStr);
  for (i = 0; i < moodsList.length; i++) {
    var this_mood = moodsList[i];
    var timestamp = this_mood.time;
    var moodData = {
      "mood1": this_mood.mood1,
      "mood2": this_mood.mood2
    };
    updates[timestamp] = moodData;
  }
  db.ref(`moods/${user.uid}/${dateStr}/`).update(updates);
}


function backgroundUpdateStorage() {
  if (user_signed_in == false) {
    return;
  }
  if (timeIntervalList != undefined && timeIntervalList.length > 0) {
    // console.log('updating storage');
    storeTimeIntervals(currentUser);
  }

  if (moodsList != undefined && moodsList.length > 0) {
    storeMoodsList(currentUser);
  }
  // storage.saveValue(STORAGE_TIMEINTERVAL_LIST, timeIntervalList);
}


function bgCheck() {
  // runs each second
  if (!user_signed_in) {
    return;
  }
  if (promptForLogChanged) {
    showPromptIcon(promptForLog);
    promptForLogChanged = false;
  }
  // if (user_signed_in && dayExists == false) {
  //   checkDayExists(currentUser);
  // }
  // console.log(moodsList);
  // console.log("bgCheck Running");

  // console.log("checking background");
  chrome.windows.getLastFocused({ populate: true }, function (currentWindow) {
    // if currentWindow is not a chrome settings page
    if (currentWindow != undefined) {
      if (currentWindow.focused) {
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
            if (currentTab !== tab.url) {
              // Set time interval for new current tab
              activity.setCurrentActiveTab(tab.url);
            }
            // check if its been idle for 30 seconds
            chrome.idle.queryState(30000, function (state) {
              if (state === 'active') {
                mainTRacker(activeUrl, tab, activeTab);
              } else checkDOM(state, activeUrl, tab, activeTab);
            });
          }
        }
      } else activity.closeIntervalForCurrentTab();
    }
  });


}


function mainTRacker(activeUrl, tab, activeTab) {

  tab.incSummaryTime();
  // chrome.browserAction.setBadgeBackgroundColor({ color: "#ff2830" });
  var today = getToday();
  var summary = tab.days.find(s => s.date === today).summary;
  // chrome.browserAction.setBadgeText({
  //   tabId: activeTab.id,
  //   text: String(convertSummaryTimeToBadgeString(summary))
  // });

  console.log(timeIntervalList);
  // console.log(tab.getTodayTime());
}

// Check if on Youtube or Netflix
function checkDOM(state, activeUrl, tab, activeTab) {
  if (state === 'idle' && isDomainEquals(activeUrl, "youtube.com")) {
    trackForYT(mainTRacker, activeUrl, tab, activeTab);
  } else if (state === 'idle' && isDomainEquals(activeUrl, "netflix.com")) {
    trackForNetflix(mainTRacker, actifirebatab, activeTab);
  } else activity.closeIntervalForCurrentTab();
}

function trackForYT(callback, activeUrl, tab, activeTab) {
  if (isHasPermissioForYouTube) {
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



updateTime();
updateStorage();