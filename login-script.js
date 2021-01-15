// FIREBASE CONFIG FOR EUDAIMONIA

const firebaseConfig = {
  apiKey: "AIzaSyA81iaieyP5BPXTZf9V1M_xYS-sJxRPGKc",
  authDomain: "eudaimonia-f99b5.firebaseapp.com",
  projectId: "eudaimonia-f99b5",
  storageBucket: "eudaimonia-f99b5.appspot.com",
  messagingSenderId: "280495522376",
  appId: "1:280495522376:web:bf97aca351d7a867128e7d"
};

// FIREBASE CONFIG FOR JOSEPH'S DATABASE
/*
const firebaseConfig = {
  apiKey: "AIzaSyBj7fmZRv_SCFXClGvWKN_QFr-_vxv_42w",
  authDomain: "user-auth-development.firebaseapp.com",
  databaseURL: "https://user-auth-development-default-rtdb.firebaseio.com",
  projectId: "user-auth-development",
  storageBucket: "user-auth-development.appspot.com",
  messagingSenderId: "496590033273",
  appId: "1:496590033273:web:c2f3ca11a7ddf2c6fa9fa8"
};*/


firebase.initializeApp(firebaseConfig);



// Initialize the FirebaseUI Widget using Firebase.
const ui = new firebaseui.auth.AuthUI(firebase.auth());

const uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function (authResult, redirectUrl) {
      // console.log('message sent');
      chrome.runtime.sendMessage({ message: 'sign_in' }, function (response) {
        if (response.message === 'success') {
          window.location.replace('./main.html'); // changed from welcome
          console.log("HERE");
        }
      });
      return false;
    },
    uiShown: function () {
      // Sign in with Google shwon
      console.log("UI Shown");
      // document.getElementById('sign_in_title').style.display = 'none';
      // document.getElementById('wrapper').style.pointerEvents = 'none';
    }
  },
  signInFlow: 'popup',
  // signInSuccessUrl: '<url-to-redirect-to-on-success>',
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    {
      provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      customParameters: {
        prompt: 'select_account'
      }
    }//,
    // {
    //   provider: firebase.auth.GithubAuthProvider.PROVIDER_ID,
    //   customParameters: {
    //     prompt: 'consent'
    //   }
    // },
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    // firebase.auth.EmailAuthProvider.PROVIDER_ID,
    // firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ],
  // Terms of service url.
  // tosUrl: '<your-tos-url>',
  // Privacy policy url.
  // privacyPolicyUrl: '<your-privacy-policy-url>'
};
ui.start('#sign_in_options', uiConfig);

/*
document.querySelector('#wrapper').addEventListener('click', () => {
  ui.start('#sign_in_options', uiConfig);
  // console.log('sent');
  // chrome.runtime.sendMessage({ command: "signinClicked" }, (response) => {
  //   console.log(response);
  // });
});

document.querySelector('#wrapper').addEventListener('mouseover', () => {
  // let sign_in = document.querySelector('#my_sign_in');
  // sign_in.classList.remove('sign_in_no_hover');
  // sign_in.classList.add('sign_in_hover');
});

document.querySelector('#wrapper').addEventListener('mouseleave', () => {
  // let sign_in = document.querySelector('#my_sign_in');
  // sign_in.classList.remove('sign_in_hover');
  // sign_in.classList.add('sign_in_no_hover');
});*/