
var logCounter = document.getElementById("log-counter");
chrome.runtime.sendMessage({ message: 'get_moods_count' }, function (response) {
  if (response.message === 'success') {
    console.log(response.count);
    logCounter.innerText = "Logged Today: " + response.count;
  }
});




// If sign - out button clicked, redirect to login page
document.querySelector('#bottom-button').addEventListener('click', () => {
  if (page == 0) {
    chrome.runtime.sendMessage({ message: 'sign_out' }, function (response) {
      if (response.message === 'success') {
        window.location.replace('./login.html');
      }
    });
  } else if (page == 1) {
    loadFirstPage();
    page = 0;
  }
});

var page = 0;
var page1_value_chosen = null;
var mood1 = "";
const page1_values = ["Awful", "Bad", "Fine", "Good", "Great"];

const page2_values = {
  1: ["Depressed", "Insecure", "Upset", "Lonely", "Anxious"], // Awful
  2: ["Frustrated", "Bored", "Stressed", "Annoyed", "Tense"], // Bad
  3: ["Confused", "Distracted", "Melancholy", "Indifferent", "Troubled"], // Fine
  4: ["Happy", "Content", "Reflective", "Hopeful", "Calm"], // Good
  5: ["Motivated", "Energetic", "Confident", "Excited", "Relaxed"], // Great
};


const mood_buttons = document.querySelectorAll("#mood-button");


function loadFirstPage() {
  document.getElementById("mood-table-title").innerText = "Current Mood";
  document.getElementById("bottom-button").innerText = "Sign Out";
  var buttons = document.querySelectorAll("#mood-button");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].innerText = page1_values[i];
  }
}

function loadSecondPage(page1_value) {
  document.getElementById("mood-table-title").innerText = "Describe Further";
  document.getElementById("bottom-button").innerText = "Back";
  var buttons = document.querySelectorAll("#mood-button");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].innerText = page2_values[page1_value][i];
  }
}

for (let i = 0; i < mood_buttons.length; i++) {
  // console.log(mood_buttons[i].innerText);
  mood_buttons[i].addEventListener("click", function () {
    // console.log(mood_buttons[i].innerText);
    // console.log(mood_buttons[i].value);
    page = page + 1;
    if (page == 1) {
      page1_value_chosen = mood_buttons[i].value;
      mood1 = mood_buttons[i].innerText;
      loadSecondPage(page1_value_chosen);
    }
    if (page == 2) {
      page = 0;
      window.close();
      chrome.runtime.sendMessage({
        message: 'mood_clicked',
        mood1: mood1,
        mood2: mood_buttons[i].innerText
      });
    }
  });
}