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
    let table = document.querySelector("#friends-table");
    let data = Object.keys(friendsTableData[0]);
    generateTableHead(table, data);
    generateTable(table, friendsTableData);
  }
});


let mountains = [
  { name: "Monte Falco", height: 1658, place: "Parco Foreste Casentinesi" },
  { name: "Monte Falterona", height: 1654, place: "Parco Foreste Casentinesi" },
  { name: "Poggio Scali", height: 1520, place: "Parco Foreste Casentinesi" },
  { name: "Pratomagno", height: 1592, place: "Parco Foreste Casentinesi" },
  { name: "Monte Amiata", height: 1738, place: "Siena" }
];

// Generate Friends Table Head
function generateTableHead(table, data) {
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let key of data) {
    let th = document.createElement("th");
    th.className = "table-header";
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
}
// Generate Friends Table
function generateTable(table, data) {
  for (let element of data) {
    let row = table.insertRow();
    for (var key in element) {
      let cell = row.insertCell();
      let text = document.createTextNode(element[key]);
      cell.className = "table-text";
      cell.appendChild(text);
    }
  }
}
