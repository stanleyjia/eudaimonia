
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
const page1_values = [
  "Anxious &harr; Confident",
  "Depressed &harr; Happy",
  "Burnt out &harr; Energized",
  "Angry &harr; Calm",
  "Lonely &harr; Loved",
  "Distracted &harr; Focused"];

/*
const page2_values = {
  1: ["Depressed", "Insecure", "Upset", "Lonely", "Anxious"], // Awful
  2: ["Frustrated", "Bored", "Stressed", "Annoyed", "Tense"], // Bad
  3: ["Confused", "Distracted", "Melancholy", "Indifferent", "Troubled"], // Fine
  4: ["Happy", "Content", "Reflective", "Hopeful", "Calm"], // Good
  5: ["Motivated", "Energetic", "Confident", "Excited", "Relaxed"], // Great
};*/

const page2_values = {
  1: ["Anxious", "Tense", "Secure", "Confident"], // Anxious -> Confident
  2: ["Depressed", "Sad", "Hopeful", "Happy",], // Depressed -> Happy
  3: ["Burnt Out", "Tired", "Motivated", "Energized"], // Burnt out -> Hyped
  4: ["Angry", "Frustrated", "Indifferent", "Calm"], // Angry -> Calm
  5: ["Lonely", "Isolated", "Connected", "Loved"], // Lonely -> Loved
  6: ["Hyperactive", "Distracted", "Focused", "Zoned in"], // Hyperactive -> Zoned In
};



const mood_buttons = document.querySelectorAll("#mood-button");


function loadFirstPage() {
  document.getElementById("mood-table-title").innerText = "Type of Mood";
  document.getElementById("bottom-button").innerText = "Sign Out";
  var buttons = document.querySelectorAll("#mood-button");
  for (let i = 0; i < buttons.length; i++) {
    if (page1_values[i]) {
      buttons[i].innerHTML = page1_values[i];
      buttons[i].style.display = "block";

    } else {
      buttons[i].style.display = "none";
    }
  }
}

function loadSecondPage(page1_value) {
  document.getElementById("mood-table-title").innerText = "Describe Mood";
  document.getElementById("bottom-button").innerText = "Back";
  var buttons = document.querySelectorAll("#mood-button");
  for (let i = 0; i < buttons.length; i++) {
    if (page2_values[page1_value][i]) {
      buttons[i].innerText = page2_values[page1_value][i];
      buttons[i].style.display = "block";

    } else {
      buttons[i].style.display = "none";
    }
  }
}

for (let i = 0; i < mood_buttons.length; i++) {
  // console.log(mood_buttons[i].innerText);
  mood_buttons[i].addEventListener("click", function () {
    // console.log(mood_buttons[i].innerText);
    // console.log(mood_buttons[i].value);
    // page = page + 1;
    // if (page == 1) {
    //   page1_value_chosen = mood_buttons[i].value;
    //   mood1 = mood_buttons[i].innerText;
    //   loadSecondPage(page1_value_chosen);
    // }
    // if (page == 2) {
    //   page = 0;
    //   // window.close();
    //   loggedAnimation(mood_buttons[i]);
    //   chrome.runtime.sendMessage({
    //     message: 'mood_clicked',
    //     mood1: mood1,
    //     mood2: mood_buttons[i].innerText
    //   });
    // }
  });
}

function loggedAnimation(button) {
  console.log("start", button.offsetLeft, button.offsetTop);
  console.log("end", logCounter.offsetLeft, logCounter.offsetTop);
  var startX = button.offsetLeft;
  var startY = button.offsetTop;
  var diffX = (logCounter.offsetLeft - button.offsetLeft) / 10;
  var diffY = (logCounter.offsetTop - button.offsetTop) / 10;

  // setTimeout(function () { window.close(); }, 2000);
  var pos = 0;
  var id = setInterval(frame, 100);
  function frame() {
    // console.log("new frame");
    if (pos == 10) {
      clearInterval(id);
    } else {
      console.log(startX + diffX * pos, startY + diffY * pos);
      pos++;
      button.style.top = startY + diffY * pos + 'px';
      button.style.left = startX + diffX * pos + 'px';
    }
  }
}