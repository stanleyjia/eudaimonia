// console.log("friends loaded");


// // Go to dashboard
// document.querySelector('#dashboard').addEventListener('click', () => {
//   var newURL = "https://projecteudaimonia.net";
//   chrome.tabs.create({ url: newURL });
// });

// Sign out
document.querySelector('#sign-out').addEventListener('click', () => {
    chrome.runtime.sendMessage({ message: 'sign_out' }, function (response) {
      if (response.message === 'success') {
        window.location.replace('./login.html');
      }
    });
  });
  
  // Go to main page
  document.querySelector('#back').addEventListener('click', () => {
    window.location.replace('./main.html');
  });
  var friendsTableData = [];
  
  // Get friends data
  chrome.runtime.sendMessage({ message: "get_friends_data" }, function (response) {
    if (response.message === 'success') {
      friendsTableData = response.data;
      let data = Object.keys(friendsTableData[0]);
      generateFeed(friendsTableData);
    }
  });
  
  // Generate Feed
  function generateFeed(data) {
    console.log(data);
    for (let element of data) {

      // all the new divs
      let inside = document.getElementById("friends-table-div");
      let div = document.createElement("div");
      const currentDiv = document.getElementById("div1");
      currentDiv.appendChild(div);
      div.classList.add("feed");

      // hidden reaction div 
      let hidden_div = document.createElement("div");
      currentDiv.appendChild(hidden_div);
      hidden_div.style.display = 'none';
      hidden_div.classList.add("hidden-div");
      

      let like_button = document.createElement("button");
      let p2 = document.createElement("img");
      like_button.appendChild(p2);
      p2.src = "../img/heart.png";
      p2.classList.add("heart");
      like_button.classList.add("reactions");
      hidden_div.appendChild(like_button);

      let p3 = document.createElement("button");
      p3.innerHTML = "!!";
      p3.classList.add("reactions");
      hidden_div.appendChild(p3);

      let p4 = document.createElement("button");
      p4.innerHTML = "HYD?";
      p4.classList.add("reactions");
      hidden_div.appendChild(p4);

      let p5 = document.createElement("button");
      p5.innerHTML = "WGO?";
      p5.classList.add("reactions");
      p5.classList.add("last");
      hidden_div.appendChild(p5);

      // React button 
      let react = document.createElement("button");
      react.innerHTML = "React";
      react.classList.add("react-button");
      react.onclick = function () {
        if (hidden_div.style.display != "grid") {
          hidden_div.style.display = "grid";
        } else {
          hidden_div.style.display = "none";
        }
      }
      div.appendChild(react);

      for (var key in element) {
        let text = "";
        if (key == "Profile") {
          img = document.createElement("img");
          img.src = element[key]; 
          img.classList.add("profile");
          div.appendChild(img);
        } else if (key == "Name") {
          text = document.createTextNode(element[key]);
          p1 = document.createElement("p");
          p1.appendChild(text);
          p1.classList.add("name");
          div.appendChild(p1);
        } else if (key == "LastMoodLogged") {
          text = document.createTextNode("is feeling " + element[key] + ".");
          p1 = document.createElement("p");
          p1.appendChild(text);
          p1.classList.add("feeling");
          div.appendChild(p1);
        } else if (key == "User") {
          console.log(element[key]);
          text = document.createTextNode("@" + element[key]);
          p1 = document.createElement("p");
          p1.appendChild(text);
          p1.classList.add("username");
          div.appendChild(p1);
        } else if (key == "TimeStamp") {
          text = document.createTextNode(element[key]);
          p1 = document.createElement("p");
          p1.appendChild(text);
          p1.classList.add("time-stamp");
          div.appendChild(p1);
        }
        // } else if (key == "WebActivity") {
        //   text = document.createTextNode(element[key] + " ago");
        //   p1 = document.createElement("p");
        //   p1.appendChild(text);
        //   p1.classList.add("web");
        //   p1.style.display = "inline-block";
        // }
      }
    }
  }
  