
var db = firebase.database();

// Connect to emulator
// db.useEmulator("localhost", 8000);


// Indicator variables
var userExists = false;
let userSignedIn = false;
var currentUser = null;



var tabs;
var currentTab;
var activity = new Activity();

var timeIntervalList = [];
var moodsList = [];

var totalWebTime = {};
var totalMoodCount = {};


var promptForLog = false;
var promptForLogChanged = false;


var chromeTime = 0;
var notInChromeTime = 0;

var friends = [];
var requests = [];
var friendsMoodData = {};
var friendsTableData = [];
var socialFeedData = [];

// how much time using chrome before prompt to log mood (in seconds)
// const PROMPT_TIMER = 5; // 5 seconds
const PROMPT_TIMER = 1800; // 30 minutes (keep)


// how much time not using chrome before counting as inactive
// const INACTIVE_TIMER = 5; // 5 seconds
// const INACTIVE_TIMER = 180; // 3 minutes
const INACTIVE_TIMER = 300; // 5 minutes



// how often to update firebase database (timeIntervals and moods)
// const FIREBASE_UPDATE_FREQ = 10000; // 10 seconds
const FIREBASE_UPDATE_FREQ = 2000; // 2 seconds
// const UPDATE_FRIENDS_FREQ = 10000; // 1 second

function showPromptIcon(status) {
  // console.log("change icon");
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

async function updateFriends() {
  // console.log("updateFriends run");
  const friendStatuses = await getFriends(currentUser);
  // console.log(friendStatuses);
  var temp_friends = [];
  var temp_requests = [];
  var temp_moodData = {};
  var temp_webData = {};
  var friendMoodFeed = [];


  for (var friend_uid in friendStatuses) {
    // console.log(friend_uid, friendStatuses[friend_uid]);
    var friend_data = await getUserFromUID(friend_uid);
    // console.log(friend_data)
    

    if (friendStatuses[friend_uid] === 3) {
      temp_moodData[friend_uid] = await getFriendMoodData(friend_uid);
      temp_webData[friend_uid] = await getFriendWebTime(friend_uid);

      // mood feed
      var friendMoodsLogged = await getFriendMoodFeed(friend_uid, friend_data.username, friend_data.photoUrl);

      if (friendMoodsLogged.length != 0) {
        friendMoodFeed = friendMoodFeed.concat(friendMoodsLogged)
      }
      //

      temp_friends.push(friend_data);

    } else if (friendStatuses[friend_uid] === 2) {
      temp_requests.push(friend_data);
    }
  }
  // sorting the social feed by time
  // var unsortedFeed = friendMoodFeed;
  // console.log(unsortedFeed);

  friendMoodFeed.sort(function (a, b) {
    return b.time.localeCompare(a.time);
  })
  friendMoodFeed.sort(function (a, b) {
    return b.date.localeCompare(a.date);
  });
  console.log(friendMoodFeed);


  // console.log(friends);
  // console.log(friendsMoodData);

  function sortFriendsByLogged(a, b) {
    function moodCountForSort(uid) {
      if (uid in friendsMoodData) {
        let moodData = friendsMoodData[uid];
        return Object.keys(moodData).length;
      }
      return 0;
    }
    // console.log(moodCountForSort(a.uid), moodCountForSort(b.uid));
    return moodCountForSort(b.uid) - moodCountForSort(a.uid);
  }

  friends = temp_friends;
  requests = temp_requests;
  friendsMoodData = temp_moodData;
  friendsWebTime = temp_webData;

  // DEBUG with Imaginary Friend
  friends.push({
    name: "Chris Barber",
    profile: "../img/profile1.png",
    uid: "imaginary_friend_uid",
    email: "imaginary_friend@gmail.com",
    username: "imaginaryFriend101"
  });
  friends.push({
    name: "Stanley Jia",
    profile: "../img/profile1.png",
    uid: "imaginary_friend_uid2",
    email: "imaginary_friend2@gmail.com",
    username: "imaginaryFriend100"
  });
  friends.push({
    name: "Joseph Merkadeau",
    profile: "../img/profile1.png",
    uid: "imaginary_friend_uid2",
    email: "imaginary_friend2@gmail.com",
    username: "imaginaryFriend100"
  });
  friends.push({
    name: "Imaginary Friends",
    profile: "../img/profile1.png",
    uid: "imaginary_friend_uid2",
    email: "imaginary_friend2@gmail.com",
    username: "imaginaryFriend100"
  });

  friendsMoodData["imaginary_friend_uid"] = { "11:01:31": { mood: "Anxious" } };
  friendsWebTime["imaginary_friend_uid"] = { h: 1, m: 32, s: 24 };
  friendsMoodData["imaginary_friend_uid2"] = { "11:05:31": { mood: "Happy" } };
  friendsWebTime["imaginary_friend_uid2"] = { h: 1, m: 52, s: 59 };

  // console.log(friendsMoodData);
  // console.log(friends);
  friends.sort(sortFriendsByLogged);

  // console.log(friends);
  // console.log(friendsMoodData);
  // console.log(friendsWebTime);

  friendsTableData = [];
  friends.forEach(function (item, index) {
    // console.log(item, index);
    // console.log(item.uid);
    let moodData = friendsMoodData[item.uid];
    let lastMoodLogged = getLastMoodLogged(moodData);
    // console.log(lastMoodLogged);
    var moodsCount = Object.keys(moodData).length;
    let webData = friendsWebTime[item.uid];
    // console.log(webData);
    let webStr = webData.h + "h " + webData.m + "m";

    friendsTableData.push({
      Profile: item.profile,
      Name: item.name,
      User: item.username,
      Logged: moodsCount,
      LastMoodLogged: lastMoodLogged.mood,
      WebActivity: webStr
    });
  });

  // console.log(friendsTableData);


}

function updateLocalVariables(user) {
  // Update Intervals and Moods List
  // Realtime Database to local storage

  var today = getToday(); // 12/29/2000
  // get totalWebTime from firebase
  db.ref(`totalWebTime/${user.uid}/`).once("value", function (snapshot) {
    snapshot.forEach((child) => {
      // console.log(child.key, child.val());
      totalWebTime[child.key] = child.val();
    });
  });

  db.ref(`totalMoodCount/${user.uid}/`).once("value", function (snapshot) {
    snapshot.forEach((child) => {
      // console.log(child.key, child.val());
      totalMoodCount[child.key] = child.val();
    });
  });

  // get current time intervals and insert into timeIntervalList
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
    // console.log(timeIntervalList);
  });

  // Update Local Moods -- insert into Moods List
  db.ref(`moods/${user.uid}/${today}`).once("value", function (snapshot) {
    snapshot.forEach((child) => {
      // console.log(child.key, child.val());
      var time = child.key;
      var data = child.val();
      var newMood = new Mood(today, time, data.mood, data.cat, data.desc);
      moodsList.push(newMood);
    });
  });
}
// User logged in or logged out
firebase.auth().onAuthStateChanged(function (user) {
  // console.log('auth state changed');
  clearLocalData();
  if (user) {
    // console.log(`[onAuthStateChanged] user signed in: ${user.uid}`);
    currentUser = user;
    userSignedIn = true;

    checkUserExists(user);
    updateLocalVariables(user);
  }
  else {
    // console.log("[onAuthStateChanged] user not signed in");
    userSignedIn = false;
  }
});

// Check if installed or updated
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == 'install') {
    // newly installed
    // console.log("Extension Installed");

  }
  if (details.reason == 'update') {
    // newly updated
    // console.log("Extension Updated");
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

var currentMood = ""; // to keep track in between mood and category pages
var currentCat = ""; // to keep track in between mood and category pages
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
    moodClicked(request, sendResponse);
  }
  else if (request.message === 'category_clicked') {
    // console.log(request.desc);
    category_clicked(request, sendResponse);
  }
  else if (request.message === 'desc_submitted') {
    // console.log(request.desc);
    desc_submitted(request, sendResponse);
  }
  else if (request.message === 'get_moods_count') {
    // console.log("recieved count_moods request", moodsList.length);
    sendResponse({ message: 'success', count: moodsList.length });
  }
  else if (request.message === 'extension_opened') {
    // console.log("extension opened");
    updateFriends();
  }
  else if (request.message === 'get_friends_data') {
    sendResponse({ message: 'success', data: friendsTableData });
  }
  else if (request.message === 'get_social_feed_data') {
    sendResponse({message: 'success', data: socialFeedData})
  }
});

function moodClicked(request, sendResponse) {
  // console.log(`Mood Button clicked: ${request.mood}`);
  currentMood = request.mood;

  sendResponse({ message: 'success' });
}

function category_clicked(request, sendResponse) {
  // console.log(currentMood, request.cat);
  currentCat = request.cat;

  sendResponse({ message: 'success' });
}

function desc_submitted(request, sendResponse) {
  // console.log("Mood Submitted:", currentMood, "about", currentCat, "-", request.desc);
  var time = getTime();
  var mood_instance = new Mood(getToday(), time, currentMood, currentCat, request.desc);
  // check if mood was entered twice (same timestamp)
  var items = moodsList.filter(item => item.mood == mood_instance.mood && item.cat == mood_instance.cat && item.day == mood_instance.day && item.time == mood_instance.time);
  if (items.length == 0) {
    moodsList.push(mood_instance);
    incrementTotalMoodCount(mood_instance.mood);
    updateTotalMoodCount();
    updateMood(mood_instance);
  } else {
    // console.log("[mood clicked] mood already logged");no
  }
  // Reset prompt
  chromeTime = 0;
  notInChromeTime = 0;
  promptForLog = false;
  showPromptIcon(promptForLog);
  sendResponse({ message: 'success' });
}


function updateMood(moodObj) {
  var dateStr = getToday();
  var updates = {};
  var moodData = {
    "mood": moodObj.mood,
    "category": moodObj.cat,
    "description": moodObj.desc,
  };
  var timestamp = moodObj.time;
  updates[timestamp] = moodData;
  db.ref(`moods/${currentUser.uid}/${dateStr}/`).update(updates);
  // console.log('[updateMood] called');
}
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

function updateTotalWebTime(totalWebTime) {
  db.ref(`totalWebTime/${currentUser.uid}/`).update(totalWebTime);
}

function incrementTotalMoodCount(mood) {
  if (mood in totalMoodCount) {
    totalMoodCount[mood] += 1;
  } else {
    totalMoodCount[mood] = 1;
  }
  // console.log(totalMoodCount);
}

function updateTotalMoodCount() {
  // console.log(totalMoodCount);
  db.ref(`totalMoodCount/${currentUser.uid}/`).update(totalMoodCount);
}


// totalMoodCount[child.key] = child.val();

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
    //   // console.log(moodsList);
    var dateStr = getToday();
    moodsList = moodsList.filter(mood => mood.day == dateStr);
    //   storeMoodsList(currentUser);
  }
  if (totalWebTime != undefined && isEmpty(totalWebTime) == false) {
    updateTotalWebTime(totalWebTime);
  }
}
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
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
  // console.log(totalWebTime);
  // console.log(moodsList);

  chrome.windows.getAll(function (windows) {
    // console.log(windows.length);
    if (windows.length != 0) {
      getLastFocused();
    }
  });
}

function getLastFocused() {
  // console.log("getLastFocused Run");
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
            // if idle for time (in seconds) stop current interval (300 = 5 minutes, 600 = 10 minutes)
            const IDLE_TIMER = 600;
            chrome.idle.queryState(IDLE_TIMER, function (state) {
              // console.log(state);
              if (state === 'active') {
                if (currentTab !== tab.url) {
                  // Set time interval for new current tab
                  // console.log("set time interval for new current tab");
                  activity.setCurrentActiveTab(tab.url);
                  // activeTab.incSummaryTime();
                }
                incrementTotalWebTime(tab.url);
              } else {
                // inactive
                checkDOM(state, activeUrl, tab, activeTab);
              }
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
function incrementTotalWebTime(domain) {
  // console.log("incremental total web time");
  var encodedDomain = encodeURL(domain);
  if (encodedDomain in totalWebTime) {
    totalWebTime[encodedDomain] += 1;
  } else {
    totalWebTime[encodedDomain] = 1;
  }
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
    // console.log("Idle for 30 seconds");
    // console.log("RESET ACTIVE TIMER");
    // console.log("HERE");
    chromeTime = 0;
    notInChromeTime = 0;
    promptForLog = false;
    promptForLogChanged = true;

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


function intervalUpdateTime() {
  // Run bgCheck every second
  setInterval(bgCheck, 1000);
}

// update firebase database
function intervalUpdateStorage() {
  setInterval(updateFirebaseDatabase, FIREBASE_UPDATE_FREQ);
}

intervalUpdateTime();
intervalUpdateStorage();
