// console.log("main init run");

// If user not signed in, redirect to login page
function init() {
  chrome.runtime.sendMessage({ message: "is_user_signed_in" }, function (response) {
    if (response.message === 'success' && response.payload == false) {
      window.location.replace('../html/login.html');
    }
  });
}

init();
