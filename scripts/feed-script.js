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
      console.log(response.data);
      friendsTableData = response.data;
      let data = Object.keys(friendsTableData[0]);
      generateFeed(friendsTableData);
    }
  });
  
  
  let mountains = [
    { name: "Monte Falco", height: 1658, place: "Parco Foreste Casentinesi" },
    { name: "Monte Falterona", height: 1654, place: "Parco Foreste Casentinesi" },
    { name: "Poggio Scali", height: 1520, place: "Parco Foreste Casentinesi" },
    { name: "Pratomagno", height: 1592, place: "Parco Foreste Casentinesi" },
    { name: "Monte Amiata", height: 1738, place: "Siena" }
  ];
  
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
      div.appendChild(hidden_div);
      hidden_div.style.display = 'none';
      hidden_div.classList = "hidden-div";

      let p = document.createElement("p");
      p.innerHTML = "like";
      hidden_div.appendChild(p);

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
          // if (element[key].length() > 10) {

          // }
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
  