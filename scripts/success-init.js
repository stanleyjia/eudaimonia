// var logCounter = document.getElementById("log-counter-2");
var count = 0;
chrome.runtime.sendMessage({ message: 'get_moods_count' }, function (response) {
  if (response.message === 'success') {
    console.log(response.count);
    count = response.count;

    var logCounter = document.getElementById("log-counter-2");
    logCounter.innerText = count;

  }
});

setTimeout(function () { window.close(); }, 1000);

function setLogCounter(count) {
  console.log("setLogCounter Run");
  var logCounter = document.getElementById("log-counter-2");
  logCounter.innerText = count;
}

document.addEventListener('DOMContentLoaded', (event) => {
  console.log("Content loaded");
  setLogCounter(count);
}, false);