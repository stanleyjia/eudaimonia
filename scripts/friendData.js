
var database = firebase.database();



const today = new Date();
const month = today.getMonth() + 1;
const day = today.getDate();
const year = today.getFullYear();
const date = month + '-' + day + '-' + year;

// Getting multiple dates for social feed
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yMonth = yesterday.getMonth() + 1;
const yDay = yesterday.getDate();
const yYear = yesterday.getFullYear();
const yDate = yMonth + '-' + yDay + '-' + yYear;

const dayBeforeYesterday = new Date();
dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2)
const dMonth = dayBeforeYesterday.getMonth() + 1;
const dDay = dayBeforeYesterday.getDate();
const dYear = dayBeforeYesterday.getFullYear();
const dDate = dMonth + '-' + dDay + '-' + dYear;

const timeToInteger = (time) => {
  var t = time.split(':');
  for (var i = 0; i < t.length; i++) {
    t[i] = parseInt(t[i]);
  }
  const timeAsInt = ((t[0] * 3600) + (t[1] * 60) + t[2]);
  return (timeAsInt);
};

function secondsToTime(secs) {
  var hours = Math.floor(secs / (60 * 60));

  var divisor_for_minutes = secs % (60 * 60);
  var minutes = Math.floor(divisor_for_minutes / 60);

  var divisor_for_seconds = divisor_for_minutes % 60;
  var seconds = Math.ceil(divisor_for_seconds);

  var obj = {
    "h": hours,
    "m": minutes,
    "s": seconds
  };
  return obj;
}

async function getFriends(user) {
  const uid = user.uid;
  const ref = database.ref(`friends/${uid}`);
  var returnVal = {};
  await ref.once('value', (snapshot) => {
    if (snapshot.exists()) {
      // console.log("in friends table");
      // console.log(snapshot.val());
      returnVal = snapshot.val();
      // return (1);

    } else {
      // console.log("not in friends table yet");
      // return {};
    }
  });
  return (returnVal);
}

async function getUserFromUID(uid) {
  const ref = database.ref(`users/${uid}`);
  var returnVal = {};
  await ref.once('value', (snapshot) => {
    if (snapshot.exists()) {
      // console.log(`user ${uid} found`);
      returnVal = snapshot.val();
    } else {
      console.log('username doesnt exist yet');
    }
  });
  return returnVal;
}

async function getFriendMoodData(uid) {
  const ref = database.ref(`moods/${uid}/`);
  var returnVal = {};
  await ref.once('value', (snapshot) => {
    if (snapshot.exists()) {
      // console.log(`friend ${uid} found`);
      var moodData = snapshot.val();
      if (date in moodData) {
        // console.log("date found in moodData");
        // console.log(moodData[date]);
        returnVal = moodData[date];
      } else {
        // console.log("date not found in moodData");
      }
      // console.log(returnVal);
    } else {
      // console.log('friend mood data doesnt exist yet');
    }
  });
  return returnVal;
}

async function getFriendMoodFeed(friend_uid, username, name, photoUrl) {
  const ref = database.ref(`moods/${friend_uid}/`);
  var returnVal = [];
  await ref.once('value', (snapshot) => {
    if (snapshot.exists()) {
      var moodData = snapshot.val();
      if (date in moodData) {
        // console.log(moodData[date])
        // returnVal.push(moodData[date]);
        for (moodLogged in moodData[date]){
          returnVal.push({
            'username': username,
            'name': name,
            'date': date,
            'time': moodLogged,
            'mood': moodData[date][moodLogged].mood,
            'category': moodData[date][moodLogged].category,
            'description': moodData[date][moodLogged].description,
            'uid': friend_uid,
            'photoUrl': photoUrl
          })
        }
      }
      if (yDate in moodData) {
        // returnVal.push(moodData[yDate]);
        for (moodLogged in moodData[yDate]){
          returnVal.push({
            'username': username,
            'name': name,
            'date': yDate,
            'time': moodLogged,
            'mood': moodData[yDate][moodLogged].mood,
            'category': moodData[yDate][moodLogged].category,
            'description': moodData[yDate][moodLogged].description,
            'uid': friend_uid,
            'photoUrl': photoUrl
          })
        }
      }
      if (dDate in moodData) {
        // returnVal.push(moodData[dDate]);
        for (moodLogged in moodData[dDate]){
          returnVal.push({
            'username': username,
            'name': name,
            'date': dDate,
            'time': moodLogged,
            'mood': moodData[dDate][moodLogged].mood,
            'category': moodData[dDate][moodLogged].category,
            'description': moodData[dDate][moodLogged].description,
            'uid': friend_uid,
            'photoUrl': photoUrl
          })
        }
      }
    }
  });
  return returnVal;
}


function calculateTotalWebTime(webData) {
  var totalWebTime = 0;
  // console.log(webData);
  for (const url in webData) {
    const intervals = webData[url];
    for (const startTime in intervals) {
      const endTime = intervals[startTime];
      // console.log(startTime, endTime);
      var interval = timeToInteger(endTime) - timeToInteger(startTime);
      if (interval === 0) {
        interval = 1;
      }
      totalWebTime += interval;
      // console.log(interval);
    }
  }
  // console.log(totalWebTime);
  return totalWebTime;
}

async function getFriendWebTime(uid) {
  const ref = database.ref(`web/${uid}/`);
  var returnVal = {
    "h": 0,
    "m": 0,
    "s": 0
  };
  await ref.once('value', (snapshot) => {
    if (snapshot.exists()) {
      // console.log(`friend ${uid} found`);
      var webData = snapshot.val();
      if (date in webData) {
        let todayData = webData[date];
        // console.log(todayData);
        const totalWebTimeSec = calculateTotalWebTime(todayData);
        const totalWebTime = secondsToTime(totalWebTimeSec);
        // console.log(totalWebTimeSec);

        // console.log(totalWebTime);
        returnVal = totalWebTime;
        //   // return todayData
      }
      // console.log(returnVal);

    } else {
      // console.log('friend mood data doesnt exist yet');
    }
  });
  return returnVal;
}
function getLastMoodLogged(moodData) {
  // console.log(moodData);
  // moodData.sort();
  // console.log(getTime());
  var currentTime = getTime();
  var currentTimeInSeconds = timeToInteger(currentTime);
  // console.log(currentTimeInSeconds);
  if (Object.keys(moodData).length > 0) {
    var sorted = [];
    for (var key in moodData) {
      sorted[sorted.length] = key;
    }
    sorted.sort();
    var lastTimestamp = sorted.slice(-1)[0];
    // console.log(sorted);
    var lastTimeStampinSec = timeToInteger(lastTimestamp);
    // console.log(lastTimeStampinSec);
    // console.log(currentTimeInSeconds - lastTimeStampinSec);
    // console.log(lastTimestamp, moodData[lastTimestamp]);
    var timeSince = secondsToTime(currentTimeInSeconds - lastTimeStampinSec);
    // console.log(timeSince);
    return { mood: moodData[lastTimestamp].mood, timeSince: timeSince, timeStamp: lastTimestamp};
  }
  return { mood: "n/a", timeSince: null , timeStamp: "n/a"};
}

function getTime() {
  var date = new Date();
  var stringDate = date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0') + ':' + date.getSeconds().toString().padStart(2, '0');
  return stringDate;
}