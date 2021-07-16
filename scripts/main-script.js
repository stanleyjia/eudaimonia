
// console.log("main script run");



/**
 * Temporary workaround for secondary monitors on MacOS where redraws don't happen
 * @See https://bugs.chromium.org/p/chromium/issues/detail?id=971701
 */
if (
  // From testing the following conditions seem to indicate that the popup was opened on a secondary monitor
  window.screenLeft < 0 ||
  window.screenTop < 0 ||
  window.screenLeft > window.screen.width ||
  window.screenTop > window.screen.height
) {
  chrome.runtime.getPlatformInfo(function (info) {
    if (info.os === 'mac') {
      const fontFaceSheet = new CSSStyleSheet()
      fontFaceSheet.insertRule(`
        @keyframes redraw {
          0% {
            opacity: 1;
          }
          100% {
            opacity: .99;
          }
        }
      `);
      fontFaceSheet.insertRule(`
        html {
          animation: redraw 1s linear infinite;
        }
      `);
      document.adoptedStyleSheets = [
        ...document.adoptedStyleSheets,
        fontFaceSheet,
      ];
    }
  });
}




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

// document.querySelector('#friends').addEventListener('click', () => {
//   // console.log("friends clicked");
//   window.location.replace('./friends.html');

//   // var newURL = "https://projecteudaimonia.net";
//   // chrome.tabs.create({ url: newURL });
// });

document.querySelector('#feed').addEventListener('click', () => {
  // console.log("friends clicked");
  window.location.replace('./feed.html');

  // var newURL = "https://projecteudaimonia.net";
  // chrome.tabs.create({ url: newURL });
});

const mood_buttons = document.querySelectorAll(".blue-button");


// var plusOne = document.getElementById("plus-one");
for (let i = 0; i < mood_buttons.length; i++) {
  // console.log(mood_buttons[i].innerText);
  mood_buttons[i].addEventListener("click", function () {
    // window.close();
    chrome.runtime.sendMessage({
      message: 'mood_clicked',
      mood: mood_buttons[i].innerText
    });
    // window.location.replace('../html/success.html');
    window.location.replace('../html/category.html');

  });
}
