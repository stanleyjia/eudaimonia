
console.log("main script run");


var logCounter = document.getElementById("log-counter");
chrome.runtime.sendMessage({ message: 'get_moods_count' }, function (response) {
  if (response.message === 'success') {
    console.log(response.count);
    logCounter.innerText = "Logged Today: " + response.count;
  }
});


chrome.runtime.sendMessage({ message: 'extension_opened' });


document.querySelector('#dashboard').addEventListener('click', () => {
  var newURL = "https://projecteudaimonia.net";
  chrome.tabs.create({ url: newURL });
});

document.querySelector('#friends').addEventListener('click', () => {
  // console.log("friends clicked");
  window.location.replace('./friends.html');

  // var newURL = "https://projecteudaimonia.net";
  // chrome.tabs.create({ url: newURL });
});

document.querySelector('#feed').addEventListener('click', () => {
  // console.log("friends clicked");
  window.location.replace('./feed.html');

  // var newURL = "https://projecteudaimonia.net";
  // chrome.tabs.create({ url: newURL });
});

const mood_buttons = document.querySelectorAll(".blue-button");


var plusOne = document.getElementById("plus-one");
for (let i = 0; i < mood_buttons.length; i++) {
  // console.log(mood_buttons[i].innerText);
  mood_buttons[i].addEventListener("click", function () {
    // loggedAnimation(mood_buttons[i]);
    // window.close();
    chrome.runtime.sendMessage({
      message: 'mood_clicked',
      mood: mood_buttons[i].innerText
    });
    window.location.replace('../html/success.html');
  });
}

// function loggedAnimation(button) {
//   console.log("start", button.offsetLeft, button.offsetTop);
//   console.log("end", logCounter.offsetLeft, logCounter.offsetTop);
//   var startX = button.offsetLeft;
//   var startY = button.offsetTop;
//   var frameCount = 100;
//   var diffX = (logCounter.offsetLeft - button.offsetLeft) / frameCount;
//   var diffY = (logCounter.offsetTop - button.offsetTop) / frameCount;

//   plusOne.classList.add('horizTranslate');

//   // setTimeout(function () { window.close(); }, 2000);
//   var pos = 0;
//   // var id = setInterval(frame, 200);
//   function frame() {
//     console.log("frame", pos);
//     if (pos > frameCount) {
//       clearInterval(id);
//     } else {
//       // console.log(startX + diffX * pos, startY + diffY * pos);
//       pos++;
//       plusOne.style.top = startY + diffY * pos + 'px';
//       plusOne.style.left = startX + diffX * pos + 'px';
//     }
//   }
// }