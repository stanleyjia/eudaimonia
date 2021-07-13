
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
          animation: redraw 2s linear infinite;
        }
      `);
      document.adoptedStyleSheets = [
        ...document.adoptedStyleSheets,
        fontFaceSheet,
      ];
    }
  });
}



// const DELAY_BEFORE_CHANGE_COUNTER = 500;
const DELAY_BEFORE_CLOSE_WINDOW = 1500;


function submitOnEnter(event) {
  if (event.which === 13) {
    event.target.form.dispatchEvent(new Event("submit", { cancelable: true }));
    event.preventDefault(); // Prevents the addition of a new line in the text field (not needed in a lot of cases)
  }
}


var textBoxUsed = false;

document.addEventListener('DOMContentLoaded', (event) => {
  // Content Loaded
  var bar = document.getElementById("myBar");
  // Check if text box used
  document.getElementById("desc").addEventListener("input", (event1) => {
    textBoxUsed = true;
    clearInterval(anim);
    // #77d675
    bar.style.width = '100%';
    bar.style.backgroundColor = '#77d675';
    document.getElementById("title").innerText = "Press ENTER to Submit";
    document.getElementById("title").style.fontSize = "1.35em";

  });
  // Check if enter pressed
  document.getElementById("desc").addEventListener("keypress", submitOnEnter);
  // Check if submitted
  document.getElementById("form").addEventListener("submit", (event1) => {
    // Form submitted
    event1.preventDefault();
    // window.close();
    chrome.runtime.sendMessage({
      message: 'desc_submitted',
      desc: document.getElementById("desc").value
    });
    window.location.replace('../html/success.html');

  });


  // Start Progress Bar

  const animLength = 1.5;
  var percent = 0;
  function startAnim() {
    function frame() {
      if (counter >= animLength * 100) {
        clearInterval(id);
        i = 0;
      } else {
        counter++;
        percent = (counter / animLength);
        bar.style.width = (100 - percent) + "%";
      }
    }
    var counter = 1;
    var id = setInterval(frame, 10);
    return id;
  }
  var anim = startAnim();
}, false);


// Close window if no text
setTimeout(function () {
  if (textBoxUsed == false) {
    // No Description
    // window.close();
    chrome.runtime.sendMessage({
      message: 'desc_submitted',
      desc: document.getElementById("desc").value
    });
    window.location.replace('../html/success.html');
  }
}, DELAY_BEFORE_CLOSE_WINDOW);


{/* <textarea id="desc" type="text"
          placeholder="A couple words..."
          maxlength=140
          autofocus=true></textarea> */}
