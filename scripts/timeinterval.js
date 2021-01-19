class TimeInterval {
  constructor(day, domain, intervals) {
    // intervals is either list of previous intervals or empty list
    this.domain = domain;
    if (intervals != undefined)
      this.intervals = intervals;
    else this.intervals = [];
    this.day = day;
  }

  getTime() {
    var date = new Date();
    var stringDate = date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0') + ':' + date.getSeconds().toString().padStart(2, '0');
    return stringDate;
  }

  addInterval() {
    var stringDate = getTime();
    this.intervals.push(stringDate + '-' + stringDate);
    // Set end time to current time as well
    // console.log(`addInterval called for ${this.domain}`);
  }

  closeInterval() {
    // Replace end time with current time
    // console.log(`closeInterval called for ${this.domain}`);
    var stringDate = getTime();
    var currentInterval = this.intervals[this.intervals.length - 1];
    if (currentInterval != undefined) {
      // console.log(`currentInterval: ${currentInterval}`);
      if (currentInterval.split('-')[0] == currentInterval.split('-')[1]) {
        // console.log('before pop');
        // console.log(this.intervals);
        this.intervals.pop();
        // console.log('after pop');
        // console.log(this.intervals);
        this.intervals.push(currentInterval.split('-')[0] + '-' + stringDate);
      }
    }
  }
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