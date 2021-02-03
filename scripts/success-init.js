// var logCounter = document.getElementById("log-counter-2");
var logCount = 0;
chrome.runtime.sendMessage({ message: 'get_moods_count' }, function (response) {
  if (response.message === 'success') {
    // console.log(response.count);
    logCount = response.count;
    // console.log(logCount);

    setLogCounter(logCount);

  }
});
const DELAY_BEFORE_CHANGE_COUNTER = 500;
const DELAY_BEFORE_CLOSE_WINDOW = 500;

// setTimeout(function () { window.close(); }, 1000);
function closeWindowAfterWait() {
  setTimeout(function () { window.close(); }, DELAY_BEFORE_CLOSE_WINDOW);
}
function setLogCounter(logCount) {
  // console.log("setLogCounter Run");
  var logCounter = document.getElementById("log-counter-2");
  logCounter.innerText = logCount - 1;
  if (logCount == 1) {
    var outroText = document.getElementById("outro-text");
    outroText.innerText = `mood today!`;
  }
  setTimeout(function () {
    logCounter.innerText = logCount;
    if (logCount == 1) {
      var outroText = document.getElementById("outro-text");
      outroText.innerText = `mood today!`;
    }
    closeWindowAfterWait();
  }, DELAY_BEFORE_CHANGE_COUNTER);

}

// document.addEventListener('DOMContentLoaded', (event) => {
//   console.log("Content loaded");
//   console.log(logCount);
//   setLogCounter(logCount);
// }, false);

// document.addEventListener('Load', (event) => {
//   console.log("Content loaded");
//   setLogCounter(logCount);
// }, false);