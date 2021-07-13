
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




document.querySelector('#back').addEventListener('click', () => {
  window.location.replace('./main.html');
});

// document.querySelector('#submit').addEventListener('click', () => {

//   // document.getElementById("desc").value;
//   window.location.replace('../html/success.html');
//   chrome.runtime.sendMessage({
//     message: 'desc_submitted',
//     desc: document.getElementById("desc").value
//   });
//   // window.close();
// });


const category_btns = document.querySelectorAll(".category-button");


for (let i = 0; i < category_btns.length; i++) {
  // console.log(category_btns[i].innerText);
  category_btns[i].addEventListener("click", function () {
    // window.close();
    // chrome.runtime.sendMessage({
    //   message: 'mood_clicked',
    //   mood: category_btns[i].innerText
    // });
    chrome.runtime.sendMessage({
      message: 'category_clicked',
      cat: category_btns[i].innerText
    });
    window.location.replace('../html/describe.html');


  });
}
