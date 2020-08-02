// index.js structure:
// 1. global variable declarations, initialisation functions
// 2. generic functions
// 3. home form js
// 4. view tab form js
// 5. create tab js

// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ---------------------------- GLOBAL VAR DECLARATIONS, INIT FUNCTIONS -------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
"use strict";
var editedTab = false;
var editedTabId = "";
var tabInfo;
var signedIn = false;
var rememberMe = true;

// on load, check user is saved, and populate list content
window.onload = async (event) => {
  if (localStorage.length > 0) {
    signedIn = true;
    isSignedIn();
  } else {
    document.getElementById("loginboxsignin").style.visibility = "visible";
  }
  // get tablature content, and fill in with event listeners
  tabInfo = await getTabs("all");
  populateTable(tabInfo);
  addFilterListeners(tabInfo);
};

// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// -------------------------------------- HOME SECTION CODE -------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //

// ----------------------------------------------------------------------------------------------- //
// Sign in function ------------------------------------------------------------------------------ //
// ----------------------------------------------------------------------------------------------- //
async function login() {
  let errMsg = document.getElementById("login-err");
  let username = document.getElementById("signin-user").value;
  let password = document.getElementById("signin-pass").value;
  errMsg.innerHTML = "checking credentials...";

  const fetchOptions = {
    credentials: "same-origin",
    method: "GET",
  };

  let url =
    "/api/login" +
    "?username=" +
    encodeURIComponent(username) +
    "&password=" +
    encodeURIComponent(password);

  console.log("attempting to fetch /api/login...");
  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    console.log("Fetch response for /api/login has failed.");

    errMsg.innerHTML = "incorrect username or password";

    return;
  } else {
    console.log("Successful /api/login call.");
    let data = await response.json();

    // sort out remember me button
    let isChecked = document.getElementById("check").checked;
    if (isChecked == false) {
      sessionStorage.setItem("token", data.accessToken);
      sessionStorage.setItem("user", data.username);
    } else {
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", data.username);
    }
    signedIn = true;
    isSignedIn();
  }
}

// ----------------------------------------------------------------------------------------------- //
// Sign out function ----------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function signOut() {
  if (localStorage.length > 0) {
    localStorage.clear();
  }

  // if tab list view was on "my tabs", switch back to all tabs
  if (document.getElementById("switch-view").value == "show all tabs") {
    switchView();
  }

  // replace the signedin div with signin div
  let signInDiv = document.getElementById("loginboxsignin");
  let signedInDiv = document.getElementById("loginboxsignedin");
  signedInDiv.style.display = "none";
  signInDiv.style.display = "block";
  signInDiv.style.visibility = "visible";

  signedIn = false;
}
// ----------------------------------------------------------------------------------------------- //
// Function to change content of left hand side -------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
function isSignedIn() {
  let signInDiv = document.getElementById("loginboxsignin");
  let signedInDiv = document.getElementById("loginboxsignedin");
  let welcome = document.getElementById("welcome");
  signInDiv.style.display = "none";
  signedInDiv.style.display = "block";

  // clear the inputs in the loginbox
  document.getElementById("signin-user").value = "";
  document.getElementById("signin-pass").value = "";
  document.getElementById("login-err").innerHTML = "&nbsp;";

  // if local storage empty, use session storage, else use local storage
  if (sessionStorage.length < 1) {
    welcome.innerHTML = "hello, " + localStorage.getItem("user");
  } else {
    welcome.innerHTML = "hello, " + sessionStorage.getItem("user");
  }
}

// ----------------------------------------------------------------------------------------------- //
// Create an account validation functions -------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function usernameInChange() {
  // ensure that only letters, numbers, _ and - are entered
  let usernameIn = document.getElementById("usernameIn");
  let errMsg = document.getElementById("create-err-msg");

  let regex = /^\w+$/;
  // if username is invalid
  if (usernameIn.value == "") {
    usernameIn.style.backgroundColor = "white";
    errMsg.innerHTML = "";
    return false;
  } else if (!regex.test(usernameIn.value)) {
    errMsg.innerHTML =
      "please only use letters, numbers and underscores in username";
    usernameIn.style.backgroundColor = "rgb(255, 105, 97)";
    return false;
  } else {
    errMsg.innerHTML = "checking username availability...";

    // add a spinning loading span to the end of the input, clear background colour
    usernameIn.style.backgroundColor = "white";
    let wrapper = document.getElementById("usernameWrap");
    let spinner = document.createElement("span");
    spinner.classList.add("loadingspinner");
    wrapper.appendChild(spinner);

    // temporarily gray out the register button, don't allow it to be clicked
    let registerbutton = document.getElementById("register");
    registerbutton.disabled = true;

    // check to see if username already exists
    const fetchOptions = {
      credentials: "same-origin",
      method: "GET",
    };

    let url =
      "/api/checkusername" +
      "?username=" +
      encodeURIComponent(usernameIn.value);

    console.log("attempting to fetch /api/checkusername...");
    const response = await fetch(url, fetchOptions);
    let value = await response.json();
    console.log(value.result);
    if (!response.ok) {
      // handle the error
      console.log("fetch response for /api/checkusername has failed.");
    } else {
      console.log("successful /api/checkusername call.");
      if (value.result == true) {
        // username already exists
        usernameIn.style.backgroundColor = "rgb(255, 105, 97)";
        spinner.classList.remove("loadingspinner");
        wrapper.removeChild(spinner);
        errMsg.innerHTML = "username already exists";
        registerbutton.disabled = false;
        return false;
      } else {
        usernameIn.style.backgroundColor = "rgb(119, 221, 119)";
        spinner.classList.remove("loadingspinner");
        wrapper.removeChild(spinner);
        errMsg.innerHTML = "";
        registerbutton.disabled = false;
        return true;
      }
    }
  }
}
function noWhitespace(event) {
  if (event.which == 32) {
    event.preventDefault();
    return false;
  }
}

function passwordChange1() {
  // ensure password length is larger than 5
  let passwordIn = document.getElementById("passwordIn");
  let passwordIn2 = document.getElementById("passwordIn2");

  let errMsg = document.getElementById("create-err-msg");

  if (passwordIn.value == "") {
    passwordIn.style.backgroundColor = "white";
    errMsg.innerHTML = "";
    return false;
  } else if (passwordIn.value.length < 5) {
    passwordIn.style.backgroundColor = "rgb(255, 105, 97)";
    errMsg.innerHTML = "please create a longer password";
    return false;
  } else {
    passwordIn.style.backgroundColor = "rgb(119, 221, 119)";
    errMsg.innerHTML = "";
    passwordChange2();
    return true;
  }
}

function passwordChange2() {
  // ensure this value is the same as passwordIn1
  let passwordIn1 = document.getElementById("passwordIn");
  let passwordIn2 = document.getElementById("passwordIn2");
  let errMsg = document.getElementById("create-err-msg");

  if (passwordIn2.value == "") {
    passwordIn2.style.backgroundColor = "white";
    errMsg.innerHTML = "";
    return false;
  } else if (passwordIn2.value !== passwordIn1.value) {
    passwordIn2.style.backgroundColor = "rgb(255, 105, 97)";
    errMsg.innerHTML = "passwords do not match";
    return false;
  } else {
    passwordIn2.style.backgroundColor = "rgb(119, 221, 119)";
    errMsg.innerHTML = "";
    return true;
  }
}

async function emailIn() {
  // validate email
  let emailIn = document.getElementById("emailIn");
  let errMsg = document.getElementById("create-err-msg");

  if (emailIn.value == "") {
    emailIn.style.backgroundColor = "white";
    errMsg.innerHTML = "";
    return false;
  } else if (isEmail(emailIn.value) == true) {
    errMsg.innerHTML = "checking email...";

    // add a spinning loading span to the end of the input, clear background colour
    emailIn.style.backgroundColor = "white";
    let wrapper = document.getElementById("emailWrap");
    let spinner = document.createElement("span");
    spinner.classList.add("loadingspinner");
    wrapper.appendChild(spinner);

    // temporarily gray out the register button, don't allow it to be clicked
    let registerbutton = document.getElementById("register");
    registerbutton.disabled = true;

    // check if email is already registered
    const fetchOptions = {
      credentials: "same-origin",
      method: "GET",
    };

    let url = "/api/checkemail" + "?email=" + encodeURIComponent(emailIn.value);

    console.log("attempting to fetch /api/checkemail...");
    const response = await fetch(url, fetchOptions);
    let value = await response.json();
    console.log(value.result);
    if (!response.ok) {
      // handle the error
      console.log("fetch response for /api/checkemail has failed.");
    } else {
      console.log("successful /api/checkemail call.");
      if (value.result == true) {
        // email already exists
        emailIn.style.backgroundColor = "rgb(255, 105, 97)";
        spinner.classList.remove("loadingspinner");
        wrapper.removeChild(spinner);
        errMsg.innerHTML = "email is already registered";
        registerbutton.disabled = false;
        return false;
      } else {
        emailIn.style.backgroundColor = "rgb(119, 221, 119)";
        spinner.classList.remove("loadingspinner");
        wrapper.removeChild(spinner);
        errMsg.innerHTML = "";
        registerbutton.disabled = false;
        return true;
      }
    }
  } else {
    emailIn.style.backgroundColor = "rgb(255, 105, 97)";
    errMsg.innerHTML = "please enter a valid email address";
    return false;
  }
}

function isEmail(email) {
  let regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  if (!regex.test(email)) {
    return false;
  } else {
    return true;
  }
}

// ----------------------------------------------------------------------------------------------- //
// Register account button clicked --------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function registerAccount() {
  // first, ensure the 4 fields are validated. if not, highlight/bounce error message;
  let errMsg = document.getElementById("create-err-msg");
  // get 3 values, assign to vars
  let usernamehtml = document.getElementById("usernameIn");
  let passwordhtml = document.getElementById("passwordIn");
  let password2html = document.getElementById("passwordIn2");
  let emailhtml = document.getElementById("emailIn");

  let usernameValidated;
  if (usernamehtml.style.backgroundColor == "rgb(119, 221, 119)") {
    usernameValidated = true;
  } else {
    usernameValidated = false;
  }

  let emailValidated;
  if (emailhtml.style.backgroundColor == "rgb(119, 221, 119)") {
    emailValidated = true;
  } else {
    emailValidated = false;
  }

  let pass1validated = passwordChange1();
  let pass2validated = passwordChange2();

  console.log(
    usernameValidated,
    pass1validated,
    pass2validated,
    emailValidated
  );

  if (usernameValidated && pass1validated && pass2validated && emailValidated) {
    // all valid
    errMsg.innerHTML = "creating your account...";

    let username = usernamehtml.value;
    let password = passwordhtml.value;
    let email = emailhtml.value;

    // parse information to a server function
    const fetchOptions = {
      credentials: "same-origin",
      method: "POST",
    };

    let url =
      "/api/register" +
      "?username=" +
      encodeURIComponent(username) +
      "&password=" +
      encodeURIComponent(password) +
      "&email=" +
      encodeURIComponent(email);

    console.log("attempting to fetch /api/register...");
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      // handle the error
      console.log("fetch response for /api/register has failed.");
      return;
    } else {
      console.log("successful /api/register call.");

      // user has been created! clear input fields

      setTimeout(() => {
        // put the username and password into the login forms
        document.getElementById("signin-user").value = username;
        document.getElementById("signin-pass").value = password;
        let createmodal = document.getElementById("create-account-modal");
        createmodal.style.opacity = "0";
        createmodal.style.zIndex = "-1";

        // blink the created account modal, and pre-fill the login fields?
        let alertmodal = document.getElementById("alert-modal");
        alertmodal.style.opacity = "1";
        alertmodal.style.zIndex = "10";

        setTimeout(() => {
          alertmodal.style.opacity = "0";
          alertmodal.style.zIndex = "-1";

          usernamehtml.value = "";
          passwordhtml.value = "";
          password2html.value = "";
          emailhtml.value = "";

          usernamehtml.style.backgroundColor = "white";
          passwordhtml.style.backgroundColor = "white";
          password2html.style.backgroundColor = "white";
          emailhtml.style.backgroundColor = "white";
        }, 1500);
      }, 2000);
    }
  } else {
    errMsg.innerHTML = "please fill in form correctly, or wait for validation";
  }
}

// ----------------------------------------------------------------------------------------------- //
// Function to view my tablatures or all tablatures ---------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function switchView() {
  let viewBtn = document.getElementById("switch-view");
  let viewValue = viewBtn.value;

  // reset search bar
  let searchbar = document.getElementById("searchbar");
  searchbar.value = "";

  // reset genre
  let genreselectdiv = document.getElementById("custom-genre-select");
  let genreselectdiv2 = genreselectdiv.getElementsByClassName(
    "select-items"
  )[0];
  let genreselectchildren = genreselectdiv2.childNodes;
  for (let i = 0; i < genreselectchildren.length; i++) {
    genreselectchildren[i].removeAttribute("class");
    genreselectchildren[0].setAttribute("class", "same-as-selected");
  }
  document.getElementsByClassName("select-selected")[1].innerHTML =
    "all genres";
  document.getElementById("search-select").selectedIndex = 0;

  // reset sort
  let sortbydiv = document.getElementById("sort-by-select");
  let sortbydiv2 = sortbydiv.getElementsByClassName("select-items")[0];
  let sortbychildren = sortbydiv2.childNodes;
  for (let j = 0; j < sortbychildren.length; j++) {
    sortbychildren[i].removeAttribute("class");
    sortbychildren[0].setAttribute("class", "same-as-selected");
  }
  document.getElementsByClassName("select-selected")[0].innerHTML =
    "most recent";
  document.getElementById("sort-by-select").selectedIndex = 0;

  if (viewValue == "show my tabs") {
    viewBtn.value = "show all tabs";

    // add loading to content area until things loaded
    // remove all children of content
    let contentArea = document.getElementById("view-contents-id");
    while (contentArea.hasChildNodes()) {
      contentArea.removeChild(contentArea.firstChild);
    }
    let loader = document.createElement("div");
    loader.setAttribute("class", "loader");
    contentArea.appendChild(loader);

    // get users jwt
    let token;
    if (sessionStorage.length < 1) {
      token = localStorage.getItem("token");
    } else {
      token = sessionStorage.getItem("token");
    }

    const fetchOptions = {
      credentials: "same-origin",
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    };

    let url = "/api/getMyTabsMetadata";
    console.log("attemping to fetch /api/getMyTabsMetadata");

    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      console.log("failed response for /api/getMyTabMetadata");
      return;
    } else {
      console.log("succesful /api/getMyTabsMetadata call");
      let data = await response.json();
      populateTable(data);
      addFilterListeners(data);

      // we want to let user know they can now edit their tab on their "view" page
      // let contentDiv = document.getElementById("view-contents-id");

      // let message = document.createElement("p");
      // message.setAttribute("class", "editmessage");
      // message.innerHTML =
      //   "note: you can edit or delete your tablatures by clicking on them, then onto the respective buttons";
      // contentDiv.insertBefore(message, contentDiv.firstChild);
    }
  } else {
    viewBtn.value = "show my tabs";

    // add loading to content area until things loaded
    // remove all children of content
    let contentArea = document.getElementById("view-contents-id");
    while (contentArea.hasChildNodes()) {
      contentArea.removeChild(contentArea.firstChild);
    }
    let loader = document.createElement("div");
    loader.setAttribute("class", "loader");
    contentArea.appendChild(loader);

    tabInfo = await getTabs("all");
    populateTable(tabInfo);
    addFilterListeners(tabInfo);
  }
}

// ----------------------------------------------------------------------------------------------- //
// Function to populate tab results table -------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
function populateTable(tabInfo) {
  // Initially sorted from A -> Z by song name, sort before inserting into table
  // tabInfo.sort(sortBy("song_name"));

  // First, create/clear the unordered list, add attributes, append to parent class
  let contentArea = document.getElementById("view-contents-id");
  while (contentArea.hasChildNodes()) {
    contentArea.removeChild(contentArea.firstChild);
  }
  let listWrapper = document.createElement("ul");
  listWrapper.setAttribute("class", "results-list");
  listWrapper.setAttribute("id", "results-list-id");
  contentArea.appendChild(listWrapper);

  // Now, create li for each result, append information accordingly
  for (let i = 0; i < tabInfo.length; i++) {
    let listElem = document.createElement("ul");
    // Give id to each list element
    listElem.setAttribute("id", tabInfo[i]._id, 0);
    listElem.setAttribute("class", "results-list-elem");
    // create a list element for each section of the UL
    let listElemText0 = document.createElement("li");
    listElemText0.setAttribute("class", "li-song-artist");
    listElemText0.innerHTML =
      "<b>" +
      tabInfo[i].song_name +
      // "</b>" +
      " - " +
      // "<b>" +
      tabInfo[i].artist_name +
      "</b>";
    listElemText0.style.paddingRight = "1vw";

    let listElemText1 = document.createElement("li");
    listElemText1.innerHTML = "<i>" + tabInfo[i].genre + "</i>";
    listElemText1.setAttribute("class", "li-genre");

    let listElemText2 = document.createElement("li");
    listElemText2.innerHTML = "<i>" + "user: " + tabInfo[i].username + "</i>";
    listElemText2.setAttribute("class", "li-username");

    let listElemSymbol = document.createElement("li");
    let symbol = document.createElement("i");
    listElemSymbol.setAttribute("class", "li-symbol");

    symbol.setAttribute("class", "fa fa-plus");

    symbol.setAttribute("aria-hidden", "true");
    listElemSymbol.appendChild(symbol);

    // Create onclick event for each li element, to open the tablatures
    listElem.setAttribute("onclick", "openTab(this.id)");

    // Append p and button to their li
    listElem.appendChild(listElemText0);
    listElem.appendChild(listElemSymbol);
    listElem.appendChild(listElemText2);
    listElem.appendChild(listElemText1);
    listWrapper.appendChild(listElem);
  }

  // if there is no content, output message
  let resultsList = document.getElementById("results-list-id");
  if (resultsList.hasChildNodes() == false) {
    let errMsg = document.createElement("p");
    errMsg.setAttribute("id", "errMsgId");
    errMsg.innerHTML = "no results";
    resultsList.appendChild(errMsg);
  }
}

// ----------------------------------------------------------------------------------------------- //
// Function for search/filter options ------------------------------------------------------------ //
// ----------------------------------------------------------------------------------------------- //
function addFilterListeners(whatTabInfo) {
  let useTabInfo = whatTabInfo;
  // add event listeners for filters/search
  // event listeners for filtering by genre
  let genreselectdiv = document.getElementById("custom-genre-select");
  let genreselectdiv2 = genreselectdiv.getElementsByClassName(
    "select-items"
  )[0];
  let genreselectchildren = genreselectdiv2.childNodes;
  for (let i = 0; i < genreselectchildren.length; i++) {
    genreselectchildren[i].addEventListener("click", function () {
      let tabInfo1;
      let tabInfo2;
      let tabInfo3;
      if (genreselectchildren[i].innerHTML !== "all genres") {
        tabInfo1 = useTabInfo.filter(function (el) {
          return (
            el.genre == capitaliseEachWord(genreselectchildren[i].innerHTML)
          );
        });
      } else {
        tabInfo1 = useTabInfo;
      }

      // check sort by
      if (
        sortbydiv.getElementsByClassName("select-selected")[0].innerHTML !==
        "most recent"
      ) {
        tabInfo2 = sortList(
          tabInfo1,
          sortbydiv.getElementsByClassName("select-selected")[0].innerHTML
        );
      } else {
        tabInfo2 = tabInfo1;
      }

      if (searchbar.value.length > 0) {
        // if search bar already has content
        tabInfo3 = tabInfo1.filter(function (el) {
          return el.song_name
            .concat(" " + el.artist_name)
            .toLowerCase()
            .includes(searchbar.value.toLowerCase());
        });
      } else {
        // if search is empty
        tabInfo3 = tabInfo2;
      }
      populateTable(tabInfo3);
    });
  }

  // event listener for sort by dropdown
  let sortbydiv = document.getElementById("sort-by-select");
  let sortbydiv2 = sortbydiv.getElementsByClassName("select-items")[0];
  let sortbychildren = sortbydiv2.childNodes;
  for (let j = 0; j < sortbychildren.length; j++) {
    sortbychildren[j].addEventListener("click", function () {
      let tabInfo1;
      let tabInfo2;
      if (
        // if a genre has already been filtered
        genreselectdiv.getElementsByClassName("select-selected")[0]
          .innerHTML !== "all genres"
      ) {
        tabInfo1 = whatTabInfo.filter(function (el) {
          return (
            el.genre ==
            capitaliseEachWord(
              genreselectdiv.getElementsByClassName("select-selected")[0]
                .innerHTML
            )
          );
        });
      } else {
        // if no genre has been filtered
        tabInfo1 = whatTabInfo;
      }

      if (searchbar.value.length > 0) {
        // if search bar already has content
        tabInfo2 = tabInfo1.filter(function (el) {
          return el.song_name
            .concat(" " + el.artist_name)
            .toLowerCase()
            .includes(searchbar.value.toLowerCase());
        });
      } else {
        // if search is empty
        tabInfo2 = tabInfo1;
      }
      let finalTabInfo = sortList(tabInfo2, sortbychildren[j].innerHTML);
      populateTable(finalTabInfo);
    });
  }

  // event listeners for searching with searchbar, artist or song name
  // remove animate css from list elements when this value is > 0
  let searchbar = document.getElementById("searchbar");
  searchbar.addEventListener("keyup", function () {
    // don't allow a space to be typed in first
    let tabInfo1;
    let tabInfo2;

    // check if a genre has been selected
    if (
      genreselectdiv.getElementsByClassName("select-selected")[0].innerHTML !==
      "all genres"
    ) {
      tabInfo1 = whatTabInfo.filter(function (el) {
        return (
          el.genre ==
          capitaliseEachWord(
            genreselectdiv.getElementsByClassName("select-selected")[0]
              .innerHTML
          )
        );
      });
      // genre has not been selected, no changes to tabinfo needed
    } else {
      tabInfo1 = whatTabInfo;
    }

    if (
      sortbydiv.getElementsByClassName("select-selected")[0].innerHTML !==
      "most recent"
    ) {
      tabInfo2 = sortList(
        tabInfo1,
        sortbydiv.getElementsByClassName("select-selected")[0].innerHTML
      );
    } else {
      tabInfo2 = tabInfo1;
    }

    // filter by name or artist
    let newTabInfo = [];
    // method 1
    newTabInfo = tabInfo2.filter(function (el) {
      return el.song_name
        .concat(" " + el.artist_name)
        .toLowerCase()
        .includes(searchbar.value.toLowerCase());
    });
    populateTable(newTabInfo);
  });
}

// ----------------------------------------------------------------------------------------------- //
// Generic functions for search/filter ----------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
function capitaliseEachWord(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isEmptyOrSpaces(str) {
  return str === null || str.match(/^ *$/) !== null;
}

// ----------------------------------------------------------------------------------------------- //
// Function for sorting tab list ======----------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
function sortList(tabInfoIn, typeIn) {
  switch (typeIn) {
    case "most recent":
      tabInfoIn.sort(function (a, b) {
        // code
        if (a._id > b._id) {
          return -1;
        }
        if (a._id < b._id) {
          return 1;
        }
        return 0;
      });
      return tabInfoIn;
    case "name a-z":
      tabInfoIn.sort(function (a, b) {
        if (a.song_name < b.song_name) {
          return -1;
        }
        if (a.song_name > b.song_name) {
          return 1;
        }
        return 0;
      });
      return tabInfoIn;
    case "name z-a":
      tabInfoIn.sort(function (a, b) {
        if (a.song_name < b.song_name) {
          return 1;
        }
        if (a.song_name > b.song_name) {
          return -1;
        }
        return 0;
      });
      return tabInfoIn;
    case "artist a-z":
      tabInfoIn.sort(function (a, b) {
        if (a.artist_name < b.artist_name) {
          return -1;
        }
        if (a.artist_name > b.artist_name) {
          return 1;
        }
        return 0;
      });
      return tabInfoIn;
    case "artist z-a":
      tabInfoIn.sort(function (a, b) {
        if (a.artist_name < b.artist_name) {
          return 1;
        }
        if (a.artist_name > b.artist_name) {
          return -1;
        }
        return 0;
      });
      return tabInfoIn;
  }
}

// ----------------------------------------------------------------------------------------------- //
// Open register account modal ------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
function createAccount() {
  let createmodal = document.getElementById("create-account-modal");
  createmodal.style.opacity = "1";
  createmodal.style.zIndex = "10";

  let closespan = document.getElementById("help-span-2");
  closespan.onclick = function () {
    createmodal.style.opacity = "0";
    createmodal.style.zIndex = "-1";
  };
}

// ----------------------------------------------------------------------------------------------- //
// To close the currently viewing tab ------------------------------------------------------------ //
// ----------------------------------------------------------------------------------------------- //
function closeTab() {
  let tabcontainer = document.getElementById("tab-container-id");
  let maincontainer = document.getElementById("main-container-id");
  let contentcontainer = document.getElementById("tab-content-id");
  maincontainer.style.display = "grid";
  tabcontainer.style.display = "none";

  // clear previous entries
  document.getElementById("tab-info-1").innerHTML = "";
  document.getElementById("tab-info-2").innerHTML = "";
  while (contentcontainer.hasChildNodes()) {
    contentcontainer.removeChild(contentcontainer.firstChild);
  }
}

// ----------------------------------------------------------------------------------------------- //
// To open a tab from tab list ------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function openTab(id) {
  editedTab = false;
  editedTabId = "";
  // remove possible buttons on display to avoid duplication
  let buttonDiv = document.getElementsByClassName("close-tab-btn")[0];
  while (buttonDiv.hasChildNodes()) {
    buttonDiv.removeChild(buttonDiv.firstChild);
  }

  // function will switch to tabcont. and fill in information
  let tabcontainer = document.getElementById("tab-container-id");
  let maincontainer = document.getElementById("main-container-id");
  maincontainer.style.display = "none";
  tabcontainer.style.display = "grid";

  // redisplay loader if it doesn't exist
  let loaderContainer = document.getElementById("tab-content-id");
  let loader = document.createElement("div");
  loader.setAttribute("class", "loader");
  loaderContainer.appendChild(loader);

  // fill metadata content
  const fetchOptions = {
    credentials: "same-origin",
    method: "GET",
  };
  let url = "/api/getTabContent" + "?id=" + encodeURIComponent(id);
  console.log("attempting to fetch /api/getTabContent");
  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    console.log("Fetch response for /api/getTabContent has failed.");
    return;
  }
  console.log("Successful /api/getTabContent call.");
  let res = await response.json();

  // we now have the information, fill up content
  document.getElementById("tab-info-1").innerHTML =
    "<b>" +
    res[0].song_name +
    "</b>" +
    " by " +
    "<b>" +
    res[0].artist_name +
    "</b>";

  document.getElementById("tab-info-2").innerHTML =
    "<i>" + res[0].genre + "</i>";

  let staves = res[0].stave_types.split(",");
  let substaves = res[0].stave_subtypes.split(",");
  let stavecontent = res[0].stave_content.split(",");
  let user = res[0].username;

  let contentcontainer = document.getElementById("tab-content-id");

  while (contentcontainer.hasChildNodes()) {
    contentcontainer.removeChild(contentcontainer.firstChild);
  }
  // re-add loader

  for (let i = 0; i < staves.length; i++) {
    //create stave inner div
    let staveDiv = document.createElement("div");
    staveDiv.setAttribute("class", "contentDiv");

    let h3 = document.createElement("h3");
    h3.innerHTML = "stave " + (i + 1) + ": " + staves[i];
    staveDiv.append(h3);

    // for each stave, create textarea and p element
    for (let j = 0; j < substaves.length; j++) {
      // let label = document.createElement("p");
      // label.innerHTML = substaves[j];

      let textarea = document.createElement("textarea");
      textarea.setAttribute("rows", "6");
      textarea.setAttribute("cols", "100");
      textarea.setAttribute("wrap", "on");
      textarea.readOnly = "true";
      textarea.style.fontFamily = "monospace";
      textarea.value = "\n\n\n\n\n";

      if (substaves[j].charAt(0) == i + 1) {
        // staveDiv.append(label);

        let textAreaLines = textarea.value.split("\n");
        let content = stavecontent[j].split("\n");

        for (let k = 0; k < content.length; k++) {
          textAreaLines[k] += content[k];
        }

        textarea.value = textAreaLines.join("\n");
        staveDiv.append(textarea);
        contentcontainer.append(staveDiv);
      }
    }
  }

  let appendDiv = document.getElementsByClassName("close-tab-btn")[0];

  // NEXT, CHECK IF CURRENT USER IS USER WHO CREATED THE TAB AND ADD SOME EXTRA OPTIONS FOR THEM
  if (localStorage.getItem("user") == user) {
    let editBtn = document.createElement("button");
    editBtn.setAttribute("class", "btn-large");
    editBtn.innerHTML = "edit tab";

    let deleteBtn = document.createElement("button");
    deleteBtn.setAttribute("class", "btn-large");
    deleteBtn.innerHTML = "delete tab";

    appendDiv.appendChild(editBtn);
    appendDiv.appendChild(deleteBtn);

    // add event listeners for these two buttons
    let curId = res[0]._id;
    deleteBtn.addEventListener("click", function () {
      deleteTab(curId);
    });

    editBtn.addEventListener("click", function () {
      editTab(res);
    });
  }
  let backBtn = document.createElement("button");
  backBtn.setAttribute("class", "btn-large");
  backBtn.innerHTML = "go back";
  backBtn.onclick = closeTab;
  appendDiv.appendChild(backBtn);
}

async function deleteTab(id) {
  console.log("deleting", id);
  // display are you sure modal
  let confrimModal = document.getElementById("confirm-modal");
  confrimModal.style.opacity = "1";
  confrimModal.style.zIndex = "10";

  document.getElementById("confirm-no").addEventListener("click", function () {
    // no clicked
    confrimModal.style.opacity = "0";
    confrimModal.style.zIndex = "-1";
  });
  document
    .getElementById("confirm-yes")
    .addEventListener("click", async function () {
      // yes clicked, add message, remove buttons
      document.getElementById("confirm-title").innerHTML = "deleting...";
      document.getElementById("confirm-title").style.marginTop = "1vw";
      document.getElementById("confirm-yes").remove();
      document.getElementById("confirm-no").remove();

      // make server call to delete tab
      let token;
      if (sessionStorage.length < 1) {
        token = localStorage.getItem("token");
      } else {
        token = sessionStorage.getItem("token");
      }

      const fetchOptions = {
        credentials: "same-origin",
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      };

      let url = "/api/deleteTab" + "?id=" + encodeURIComponent(id);

      console.log("attempting to fetch /api/deleteTab...");
      const response = await fetch(url, fetchOptions);
      if (!response.ok) {
        console.log("fetch response for /api/deleteTab has failed.");
        document.getElementById("confirm-title").innerHTML =
          "deletion has failed";
        // return;
      } else {
        console.log("succesful /api/deleteTab call.");
      }

      // wait for 2 seconds for title to be read, then go back to prev page.
      document.getElementById("confirm-title").innerHTML = "deleting tab...";
      setTimeout(() => {
        confrimModal.style.opacity = "0";
        confrimModal.style.zIndex = "-1";

        closeTab();
        location.reload();
      }, 2000);
    });
}

async function editTab(data) {
  console.log(data);

  // first, close the current container and display the create tab container
  let tabcontainer = document.getElementById("tab-container-id");
  let createcontainer = document.getElementById("create-container-id");
  tabcontainer.style.display = "none";
  createcontainer.style.display = "grid";

  document.getElementById("loginbox").style.display = "none";
  document.getElementById("logintext").style.borderLeft = "none";
  document.getElementById("griddiv").style.display = "block";

  // fill in content
  let staves = data[0].stave_types.split(",");
  let substaves = data[0].stave_subtypes.split(",");
  let rawContent = data[0].stave_content.split(",");

  let staveDropdown = document.getElementById("selectStave");
  let tabContent = document.getElementById("tabcontent");

  // clear tab creation area
  while (tabContent.firstChild) {
    tabcontent.removeChild(tabcontent.firstChild);
  }

  // substave loop

  // we need a new loop here split by subdiv first digit which will contain code below

  // now, we want to split substave array into an array of arrays of each number
  let substaveObj = {};
  substaves.forEach(
    (e, i) => (
      (i = parseInt(e, 10)),
      substaveObj[i] ? substaveObj[i].push(e) : (substaveObj[i] = [e])
    )
  );
  substaveObj;
  console.log(substaveObj);
  console.log("raw content", rawContent);
  let currentContent;

  for (let x = 0; x < Object.values(substaveObj).length; x++) {
    // LOOP THROUGH SUBSTAVE OBJECT ARRAY
    // edit this to be compatible with new tab style

    // - For each stave group in data
    //      - run createStave
    //      - fill in with information
    //      - OR... Just fill it out now

    let div = document.createElement("div");
    div.setAttribute("id", x + 1);
    div.setAttribute("class", "stave");

    let h3 = document.createElement("h3");
    h3.innerHTML = "Stave " + (x + 1) + ": " + staves[x];
    h3.setAttribute("id", x + 1 + staves[x]);
    div.append(h3);

    let subdiv = document.createElement("div");
    subdiv.setAttribute("id", "div_stave" + (x + 1));
    subdiv.setAttribute("name", "stavecontainer");
    subdiv.setAttribute("class", "stavecontainerclass");

    for (let y = 0; y < Object.values(substaveObj)[x].length; y++) {
      console.log("run number x", x, "run number y", y);
      let alteredId = Object.values(substaveObj)[x][y].replace(".", "_");
      // LOOP THROUGH EACH ARRAY OF OBJECT
      let staveOption = document.createElement("option");
      staveOption.value = alteredId;
      staveOption.innerHTML = "Stave " + Object.values(substaveObj)[x][y];
      staveDropdown.append(staveOption);

      // create p and textarea

      console.log(Object.values(substaveObj)[x][y]);

      let textArea = document.createElement("textarea");
      let label = document.createElement("p");
      label.setAttribute("id", Object.values(substaveObj)[x][y]);
      label.innerHTML = Object.values(substaveObj)[x][y];

      textArea.setAttribute("id", "stave" + alteredId);
      textArea.setAttribute("name", "stave");
      textArea.setAttribute("rows", "6");
      textArea.setAttribute("cols", "100");
      textArea.setAttribute("wrap", "off");
      textArea.value = "\n\n\n\n\n";

      // run through raw content. remove first element, set as current textarea value
      currentContent = rawContent[0];
      rawContent.shift();

      let textAreaLines = textArea.value.split("\n");
      let content = currentContent.split("\n");

      for (let z = 0; z < content.length; z++) {
        textAreaLines[z] = content[z];
      }
      textArea.value = textAreaLines.join("\n");

      subdiv.append(label);
      subdiv.append(textArea);
    }
    div.append(subdiv);
    tabContent.append(div);
  }

  // select last option of stave dropdown
  staveDropdown.selectedIndex = staveDropdown.options.length - 1;

  fretBoard();
  chordFretboard();

  let songName = data[0].song_name;
  let artistName = data[0].artist_name;
  let genre = data[0].genre;

  editedTab = true;
  editedTabId = data[0]._id;

  // when save button is clicked, append data above into entries, change save innerhtml to update
  document.getElementById("song-name").value = songName;
  document.getElementById("song-artist").value = artistName;
  document.getElementById("song-genre").value = genre;
  document.getElementById("upload-btn").innerHTML = "update tablature";
}

// ----------------------------------------------------------------------------------------------- //
// Initalise form when create tab button clicked ------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
function createTabNew() {
  // if the user is not signed in, yes/no continue box
  if (document.getElementById("loginboxsignin").style.display !== "none") {
    let validateModal = document.getElementById("createtab-modal");
    validateModal.style.opacity = "1";
    validateModal.style.zIndex = "10";
    document.getElementById("cont-yes").addEventListener("click", function () {
      validateModal.style.opacity = "0";
      validateModal.style.zIndex = "-1";

      let tabcontainer = document.getElementById("tab-container-id");
      let maincontainer = document.getElementById("main-container-id");
      let createcontainer = document.getElementById("create-container-id");
      maincontainer.style.display = "none";
      tabcontainer.style.display = "none";
      createcontainer.style.display = "grid";

      // if the screen width is too fucking small
      document.getElementById("loginbox").style.display = "none";
      document.getElementById("logintext").style.borderLeft = "none";
      document.getElementById("griddiv").style.display = "block";

      // clear staves if they exist

      fretBoard();
      chordFretboard();
    });
    document.getElementById("cont-no").addEventListener("click", function () {
      validateModal.style.opacity = "0";
      validateModal.style.zIndex = "-1";
      return;
    });
  } else {
    let tabcontainer = document.getElementById("tab-container-id");
    let maincontainer = document.getElementById("main-container-id");
    let createcontainer = document.getElementById("create-container-id");
    maincontainer.style.display = "none";
    tabcontainer.style.display = "none";
    createcontainer.style.display = "grid";

    // if the screen width is too fucking small
    document.getElementById("loginbox").style.display = "none";
    document.getElementById("logintext").style.borderLeft = "none";
    document.getElementById("griddiv").style.display = "block";

    // clear staves if they exist

    fretBoard();
    chordFretboard();
  }
}

// ----------------------------------------------------------------------------------------------- //
// Go back out of create tab form ---------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
function goBack() {
  let createcontainer = document.getElementById("create-container-id");
  let maincontainer = document.getElementById("main-container-id");
  // first, display a modal with yes/no question. add event listeners to those buttons within this function.
  // check if page is empty, if so, go back without modal
  let tempmessage = document.getElementById("tempmessage");
  if (tempmessage != undefined) {
    createcontainer.style.display = "none";
    document.getElementById("loginbox").style.display = "block";
    document.getElementById("logintext").style.borderLeft = "2px solid black";
    document.getElementById("griddiv").style.display = "grid";
    maincontainer.style.display = "grid";
  } else {
    // display are you sure message
    let backmodal = document.getElementById("back-modal");
    let backmodalcontent = document.getElementById("back-modal-content-id");
    backmodal.style.opacity = "1";
    backmodal.style.zIndex = "10";
    document.getElementById("back-no").addEventListener("click", function () {
      // no clicked
      backmodal.style.opacity = "0";
      backmodal.style.zIndex = "-1";
    });
    document.getElementById("back-yes").addEventListener("click", function () {
      // yes clicked, go to previous page
      backmodal.style.opacity = "0";
      backmodal.style.zIndex = "-1";

      setTimeout(() => {
        createcontainer.style.display = "none";
        document.getElementById("loginbox").style.display = "block";
        document.getElementById("logintext").style.borderLeft =
          "2px solid black";
        document.getElementById("griddiv").style.display = "grid";
        maincontainer.style.display = "grid";
        // clear content
        while (tabcontent.firstChild) {
          tabcontent.removeChild(tabcontent.firstChild);
        }
        // REMOVE STAVES FROM DROPDOWN MENU
        let staveDropdown = document.getElementById("selectStave");
        let dropdownLength = staveDropdown.options.length;
        for (let i = 0; i < dropdownLength; i++) {
          staveDropdown.remove(i);
          staveDropdown.remove(staveDropdown.selectedIndex);
        }
        // add text back to no stave area
        let tempmessage = document.createElement("p");
        tempmessage.innerHTML =
          "No content... Please create a stave with the button above";
        tempmessage.setAttribute("id", "tempmessage");
        tabcontent.append(tempmessage);
      }, 200);
    });
  }
}

// ----------------------------------------------------------------------------------------------- //
// Open and close help modal --------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
function helpBtn() {
  let helpmodal = document.getElementById("help-modal");
  helpmodal.style.opacity = "1";
  helpmodal.style.zIndex = "10";
  window.onclick = function (event) {
    if (event.target == helpmodal) {
      helpmodal.style.opacity = "0";
      helpmodal.style.zIndex = "-1";
    }
  };
  let closespan = document.getElementById("help-span");
  closespan.onclick = function () {
    helpmodal.style.opacity = "0";
    helpmodal.style.zIndex = "-1";
  };
}
function closeHelpBtn() {
  let helpmodal = document.getElementById("help-modal");
  helpmodal.style.opacity = "0";
  helpmodal.style.zIndex = "-1";
}

// ----------------------------------------------------------------------------------------------- //
// Open save tablature modal --------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
function saveTab() {
  // clear any error messages
  document.getElementById("exportMsg").innerHTML = "";

  let saveModal = document.getElementById("save-modal");
  // first, check if at least 1 stave exists, with at least 1 column of entries
  let selectedStaveMenu = document.getElementById("selectStave");
  if (selectedStaveMenu.options.length <= 0) {
    // add error message display here -------------------------------------------------------
    return;
  }

  saveModal.style.opacity = "1";
  saveModal.style.zIndex = "10";

  // then, check if the user is signed in ------------------------------------------
  if (signedIn == false) {
    document.getElementById("upload-btn").setAttribute("disabled", true);
  }

  let closespan = document.getElementById("save-span");
  closespan.onclick = function () {
    saveModal.style.opacity = "0";
    saveModal.style.zIndex = "-1";
  };
}

// ----------------------------------------------------------------------------------------------- //
// Function to go to main.html form -------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// async function createTabBtn() {
//   // Call server function 'createTabBtn'
//   let apiLink = "/api/createTabBtn";
//   await getPage(apiLink);

//   editedTab = false;
//   editedTabId = "";
//   ``;

//   populateMain();
// }

// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ------------------------------------- NAVIGATION BAR CODE ------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //

// ----------------------------------------------------------------------------------------------- //
// Function to sign out of the menu.html form ---------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// async function signOut2() {
//   if (confirm("All content will be lost, continue with sign out?")) {
//     // Call server function 'logout'
//     let apiLink = "/api/logout";
//     await getPage(apiLink);

//     window.location.reload();

//     // Removes ID Token from local storage, ensures Google account logs out properly.
//     localStorage.removeItem("id_token");
//     localStorage.removeItem("googleUser");
//   } else {
//     return;
//   }
// }

// ----------------------------------------------------------------------------------------------- //
// Function to save a tablature ------------------------------------------------------------------ //
// ----------------------------------------------------------------------------------------------- //
async function saveTabToDb() {
  // first, check if at least 1 stave exists, with at least 1 column of entries
  let selectedStaveMenu = document.getElementById("selectStave");
  if (selectedStaveMenu.options.length <= 0) {
    alert("Nothing to save!");
    return;
  }

  let songName = document.getElementById("song-name").value;
  let artistName = document.getElementById("song-artist").value;
  let genreMenu = document.getElementById("song-genre");
  let songGenre = genreMenu.options[genreMenu.selectedIndex].value;
  if (editedTab == false) {
    // most of the code will go here...
    // first, check inputs and assign variables

    // song name and artist name validation
    if (songName.length <= 0) {
      alert("Please enter a valid song name.");
      return;
    } else if (artistName.length <= 0) {
      alert("Please enter a valid artist name.");
    }

    // Now, save the stave contents into variables
    let types = [];
    let type;
    let subtypes = [];
    let staves = [];
    let tabContent = document.getElementById("tabcontent");
    let allStaves = tabContent.getElementsByClassName("stave");

    for (let i = 0; i < allStaves.length; i++) {
      // get stave type from h3's id, and add to 'type' array
      type = allStaves[i].getElementsByTagName("h3")[0].id;
      type = type.substring(1);
      types.push(type);

      // now, get stave textarea, and add to 'stave' array
      let textAreaContainer = allStaves[i].getElementsByClassName(
        "stavecontainerclass"
      )[0];
      let ps = textAreaContainer.querySelectorAll("p");
      let textareas = textAreaContainer.querySelectorAll("textarea");
      for (let j = 0; j < ps.length; j++) {
        // type = allStaves[i].getElementsByTagName("h3")[0].id;
        // type = type.substring(1);
        // types.push(type);
        subtypes.push(ps[j].innerHTML);
        staves.push(textareas[j].value);
      }
    }

    // make initial server call requests...

    let token;
    if (sessionStorage.length < 1) {
      token = localStorage.getItem("token");
    } else {
      token = sessionStorage.getItem("token");
    }

    const fetchOptions = {
      credentials: "same-origin",
      method: "POST",
      headers: { Authorization: "Bearer " + token },
    };

    let url =
      "/api/saveTab" +
      "?song_name=" +
      encodeURIComponent(songName) +
      "&artist_name=" +
      encodeURIComponent(artistName) +
      "&genre=" +
      encodeURIComponent(songGenre) +
      "&stave_types=" +
      encodeURIComponent([types]) +
      "&stave_subtypes=" +
      encodeURIComponent([subtypes]) +
      "&stave_content=" +
      encodeURIComponent([staves]);

    console.log("Attempting to fetch /api/saveTab...");
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      // handle the error
      console.log("Fetch response for /api/saveTab has failed.");
      return;
    } else {
      console.log("Successful /api/saveTab call.");
    }
    // clear modal entries and close modal
    songName = "";
    artistName = "";

    // clear tab creation area
    while (tabContent.firstChild) {
      tabcontent.removeChild(tabcontent.firstChild);
    }

    // REMOVE STAVES FROM DROPDOWN MENU
    let staveDropdown = document.getElementById("selectStave");
    let dropdownLength = staveDropdown.options.length;
    for (let i = 0; i < dropdownLength; i++) {
      staveDropdown.remove(i);
      staveDropdown.remove(staveDropdown.selectedIndex);
    }

    // add text back to no stave area
    let tempmessage = document.createElement("p");
    tempmessage.innerHTML =
      "No content... Please create a stave with the button above";
    tempmessage.setAttribute("id", "tempmessage");
    tabcontent.append(tempmessage);

    let errMsg = document.getElementById("exportMsg");
    errMsg.innerHTML = "uploading to database...";

    setTimeout(() => {
      // now, close the save tab modal
      let saveModal = document.getElementById("save-modal");
      saveModal.style.opacity = "0";
      saveModal.style.zIndex = "-1";

      // go back to main page, and refresh content
      let createcontainer = document.getElementById("create-container-id");
      let maincontainer = document.getElementById("main-container-id");
      while (contentcontainer.hasChildNodes()) {
        contentcontainer.removeChild(contentcontainer.firstChild);
      }

      // trigger page refresh
      createcontainer.style.display = "none";
      document.getElementById("loginbox").style.display = "block";
      document.getElementById("logintext").style.borderLeft = "2px solid black";
      document.getElementById("griddiv").style.display = "grid";

      location.reload();
    }, 2000);
  } else {
    // Call new server function -> new database function -> replace old _id file with new one
    let types = [];
    let type;
    let subtypes = [];
    let staves = [];
    let tabContent = document.getElementById("tabcontent");
    let allStaves = tabContent.getElementsByClassName("stave");

    console.log(allStaves);

    for (let i = 0; i < allStaves.length; i++) {
      console.log(allStaves[i]);

      // get stave type from h3's id, and add to 'type' array
      type = allStaves[i].getElementsByTagName("h3")[0].id;
      type = type.substring(1);
      types.push(type);

      // now, get stave textarea, and add to 'stave' array
      let textAreaContainer = allStaves[i].getElementsByClassName(
        "stavecontainerclass"
      )[0];
      let ps = textAreaContainer.querySelectorAll("p");
      let textareas = textAreaContainer.querySelectorAll("textarea");
      for (let j = 0; j < ps.length; j++) {
        // type = allStaves[i].getElementsByTagName("h3")[0].id;
        // type = type.substring(1);
        // types.push(type);
        subtypes.push(ps[j].innerHTML);
        staves.push(textareas[j].value);
      }
    }

    let token;
    if (sessionStorage.length < 1) {
      token = localStorage.getItem("token");
    } else {
      token = sessionStorage.getItem("token");
    }
    const fetchOptions = {
      credentials: "same-origin",
      method: "POST",
      headers: { Authorization: "Bearer " + token },
    };

    let url =
      "/api/updateTab" +
      "?_id=" +
      encodeURIComponent(editedTabId) +
      "&song_name=" +
      encodeURIComponent(songName) +
      "&artist_name=" +
      encodeURIComponent(artistName) +
      "&genre=" +
      encodeURIComponent(songGenre) +
      "&stave_types=" +
      encodeURIComponent([types]) +
      "&stave_subtypes=" +
      encodeURIComponent([subtypes]) +
      "&stave_content=" +
      encodeURIComponent([staves]);

    console.log("Attempting to fetch /api/updateTab...");
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      console.log("Fetch response for /api/updateTab has failed.");
      return;
    } else {
      console.log("Successful /api/updateTab call.");
    }
    // clear modal entries and close modal
    songName = "";
    artistName = "";

    // clear tab creation area
    while (tabContent.firstChild) {
      tabcontent.removeChild(tabcontent.firstChild);
    }

    // REMOVE STAVES FROM DROPDOWN MENU
    let staveDropdown = document.getElementById("selectStave");
    let dropdownLength = staveDropdown.options.length;
    for (let i = 0; i < dropdownLength; i++) {
      staveDropdown.remove(i);
      staveDropdown.remove(staveDropdown.selectedIndex);
    }

    // add text back to no stave area
    let tempmessage = document.createElement("p");
    tempmessage.innerHTML =
      "No content... Please create a stave with the button above";
    tempmessage.setAttribute("id", "tempmessage");
    tabcontent.append(tempmessage);

    let errMsg = document.getElementById("exportMsg");
    errMsg.innerHTML = "updating tablature...";

    setTimeout(() => {
      // now, close the save tab modal
      let saveModal = document.getElementById("save-modal");
      saveModal.style.opacity = "0";
      saveModal.style.zIndex = "-1";

      // go back to view page, and refresh content
      let createcontainer = document.getElementById("create-container-id");
      let contentcontainer = document.getElementById("tab-content-id");

      document.getElementById("tab-info-1").innerHTML = "";
      document.getElementById("tab-info-2").innerHTML = "";
      while (contentcontainer.hasChildNodes()) {
        contentcontainer.removeChild(contentcontainer.firstChild);
      }

      // trigger page refresh
      createcontainer.style.display = "none";
      document.getElementById("loginbox").style.display = "block";
      document.getElementById("logintext").style.borderLeft = "2px solid black";
      document.getElementById("griddiv").style.display = "grid";

      openTab(editedTabId);
      // location.reload();
    }, 2000);
  }
}

// function to download the tablature as a .txt
function downloadTab() {
  let songName = document.getElementById("song-name").value;
  let artistName = document.getElementById("song-artist").value;
  let genreMenu = document.getElementById("song-genre");
  let songGenre = genreMenu.options[genreMenu.selectedIndex].value;
  let errMsg = document.getElementById("exportMsg");
  let tabContent = document.getElementById("tabcontent");
  let allStaves = tabContent.getElementsByClassName("stave");

  if (songName.length < 1) {
    errMsg.innerHTML = "please complete information on the left";
    return;
  } else if (artistName.length < 1) {
    errMsg.innerHTML = "please complete information on the left";
    return;
  } else {
    errMsg.innerHTML = "";
  }

  let content = [];
  for (let i = 0; i < allStaves.length; i++) {
    let subcontent = [];
    let staves = [];
    let type = allStaves[i].getElementsByTagName("h3")[0].innerHTML;
    subcontent.push(type + "\n\n");

    let textAreaContainer = allStaves[i].getElementsByClassName(
      "stavecontainerclass"
    )[0];
    let textareas = textAreaContainer.querySelectorAll("textarea");
    for (let j = 0; j < textareas.length; j++) {
      staves.push(textareas[j].value + "\n\n");
    }
    subcontent.push(staves + "\n");
    content.push([subcontent]);
  }

  let contentFin = content.join(",").replace(/,/g, "").split();

  let blob = new Blob(
    [
      "song name: " +
        songName +
        "\nartist name: " +
        artistName +
        "\ngenre: " +
        songGenre +
        "\n\n" +
        [contentFin],
    ],
    {
      type: "text/plain",
    }
  );

  let anchor = document.createElement("a");
  anchor.download = songName + "_tab.txt";
  anchor.href = window.URL.createObjectURL(blob);
  anchor.target = "_blank";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  document.getElementById("exportMsg").innerHTML = "tablature downloaded";
}

// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ------------------------------------- MAIN FRETBOARD CODE ------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //

var symbolInserted = false;
var symbolString;
var symbolFret;
var oldOption;

function checkStave() {
  // get stave that has been selected, if its length is 95 >, alert error, do not change.
  let selectedStaveMenu = document.getElementById("selectStave");
  let selectedStave = selectedStaveMenu[selectedStaveMenu.selectedIndex].value;
  let textarea = document.getElementById("stave" + selectedStave);
  if (textarea.value.length > 565) {
    alert("this is too full, not gonna change it.");
    selectedStaveMenu.value = oldOption;
  } else {
    oldOption = selectedStaveMenu.value;
  }
}

// ----------------------------------------------------------------------------------------------- //
// Function to continuously check length of textarea, if met, create new one --------------------- //
// ----------------------------------------------------------------------------------------------- //
function textareaChange(chars) {
  let selectedStaveMenu = document.getElementById("selectStave");
  let selectedStave = selectedStaveMenu[selectedStaveMenu.selectedIndex].value;
  let rawdivid = selectedStave.substr(0, selectedStave.length - 2);
  let staveid = "stave" + selectedStave;
  let stavedivid = staveid.substr(0, staveid.length - 2);
  if (chars.length > 93) {
    // create a new textarea, append it to the container
    // change the value of select stave dropdown to new area
    // to get count, get number of child elements of the container, then add 1, or use global var
    createTextarea(stavedivid, staveSectionCount + 1);

    let staveDropdown = document.getElementById("selectStave");
    let staveOption = document.createElement("option");
    staveOption.setAttribute("data-stave", rawdivid);
    staveOption.value = rawdivid + "_" + (staveSectionCount + 1);
    staveOption.innerHTML = "Stave " + rawdivid + "." + (staveSectionCount + 1);

    staveDropdown.append(staveOption);
    staveDropdown.value = rawdivid + "_" + (staveSectionCount + 1);
    staveSectionCount += 1;

    // update oldOption value
    oldOption = staveDropdown.value;
  }
}

// ----------------------------------------------------------------------------------------------- //
// Function for main fretboard, allows frets to be added to tablature ---------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function fretBoard() {
  let frets = document.getElementsByClassName("fret");

  // Event handler for clicking a fret:
  let fretClicked = function () {
    let string = this.getAttribute("data-string");
    let fret = this.getAttribute("data-fret");
    let selectedStaveMenu = document.getElementById("selectStave");

    // play audio
    let note = this.getAttribute("data-note");

    let audio = new Audio("js/audio/" + note + ".mp3");
    audio.play();

    // If no staves yet created, output error message.
    if (selectedStaveMenu.options.length <= 0) {
      return;
    }

    let selectedStave =
      selectedStaveMenu[selectedStaveMenu.selectedIndex].value;
    let staveid = "stave" + selectedStave;
    let textArea = document.getElementById(staveid);
    let textAreaLines = textArea.value.split("\n");

    // For each line in the textarea (line 0 to line 5)
    // concatenate (+) either "--" or "stringnumber", depending on strng value
    // Also adjust value of tab spacing
    let staveSpacing = document.getElementById("tabSpacing");
    let selectedSpacing = parseInt(
      staveSpacing.options[staveSpacing.selectedIndex].value
    );

    // Check if a symbol has been selected
    let activeBtn = document.getElementsByClassName("activeBtn");
    let symbol;
    if (activeBtn.length < 1) {
      symbol = "none";
    } else {
      symbol = activeBtn[0].innerHTML;
      // Now, remove button from active class list.
      activeBtn[0].classList.remove("activeBtn");
    }

    for (let i = 0; i < textAreaLines.length; i++) {
      if (symbolInserted == true && symbolString > -1 && symbolFret > -1) {
        // handle rules with symbols to ensure they are used correctly
        if (string != symbolString) {
          alert("invalid fret");
          return;
        } else {
          symbolInserted = false;
          symbolString = -1;
          symbolFret = -1;
        }
      }

      if (i != string) {
        // First, handle symbols
        switch (symbol) {
          case "h":
            symbolInserted = true;
            if (fret > 9) {
              textAreaLines[i] += "---";
            } else {
              textAreaLines[i] += "--";
            }
            break;
          case "b":
            symbolInserted = true;
            if (fret > 9) {
              textAreaLines[i] += "---";
            } else {
              textAreaLines[i] += "--";
            }
            break;
          case "p":
            symbolInserted = true;
            if (fret > 9) {
              textAreaLines[i] += "---";
            } else {
              textAreaLines[i] += "--";
            }
            break;
          case "/":
            symbolInserted = true;
            if (fret > 9) {
              textAreaLines[i] += "---";
            } else {
              textAreaLines[i] += "--";
            }
            break;
          case "\\":
            symbolInserted = true;
            if (fret > 9) {
              textAreaLines[i] += "---";
            } else {
              textAreaLines[i] += "--";
            }
            break;
          case "~":
            symbolInserted = true;
            if (fret > 9) {
              textAreaLines[i] += "---";
            } else {
              textAreaLines[i] += "--";
            }
            break;
          default:
            // If no symbols are selected
            symbolInserted = false;
            symbolString = -1;
            symbolFret = -1;
            if (fret > 9) {
              switch (selectedSpacing) {
                case 1:
                  textAreaLines[i] += "---";
                  break;
                case 2:
                  textAreaLines[i] += "----";
                  break;
                case 3:
                  textAreaLines[i] += "-----";
                  break;
                case 4:
                  textAreaLines[i] += "------";
                  break;
                case 5:
                  textAreaLines[i] += "-------";
                  break;
              }
            } else {
              switch (selectedSpacing) {
                case 1:
                  textAreaLines[i] += "--";
                  break;
                case 2:
                  textAreaLines[i] += "---";
                  break;
                case 3:
                  textAreaLines[i] += "----";
                  break;
                case 4:
                  textAreaLines[i] += "-----";
                  break;
                case 5:
                  textAreaLines[i] += "------";
                  break;
              }
            }
        }
      } else {
        // First, handle any symbol
        switch (symbol) {
          case "h":
            symbolInserted = true;
            symbolString = string;
            symbolFret = fret;
            textAreaLines[i] += fret + "h";
            break;
          case "b":
            symbolInserted = true;
            symbolString = string;
            symbolFret = fret;
            textAreaLines[i] += fret + "b";
            break;
          case "p":
            symbolInserted = true;
            symbolString = string;
            symbolFret = fret;
            textAreaLines[i] += fret + "p";
            break;
          case "/":
            symbolInserted = true;
            symbolString = string;
            symbolFret = fret;
            textAreaLines[i] += fret + "/";
            break;
          case "\\":
            symbolInserted = true;
            symbolString = string;
            symbolFret = fret;
            textAreaLines[i] += fret + "\\";
            break;
          case "~":
            symbolInserted = false;
            symbolString = string;
            symbolFret = fret;
            textAreaLines[i] += fret + "~";
            break;
          default:
            // If no symbol exists:
            switch (selectedSpacing) {
              case 1:
                textAreaLines[i] += fret + "-";
                break;
              case 2:
                textAreaLines[i] += fret + "--";
                break;
              case 3:
                textAreaLines[i] += fret + "---";
                break;
              case 4:
                textAreaLines[i] += fret + "----";
                break;
              case 5:
                textAreaLines[i] += fret + "-----";
                break;
            }
        }
      }
    }
    textareaChange(textAreaLines[0]);
    textArea.value = textAreaLines.join("\n");
  };

  // Add event listener for frets on fretboard
  for (let i = 0; i < frets.length; i++) {
    frets[i].addEventListener("click", fretClicked, false);
  }

  // Add event listeners for buttons
  let btns = document.getElementsByClassName("optionBtn");
  for (let i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function () {
      let current = document.getElementsByClassName("activeBtn");
      if (current.length > 0) {
        current[0].classList.remove("activeBtn");
      }
      this.classList.add("activeBtn");
    });
  }

  // Add event listener for clearing tab option button selection
  let clearBtn = document.getElementById("clearOptions");
  clearBtn.addEventListener("click", function () {
    for (let i = 0; i < btns.length; i++) {
      let current = document.getElementsByClassName("activeBtn");
      if (current.length > 0) {
        current[0].classList.remove("activeBtn");
      }
    }
  });
}

// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// --------------------------------------- STAVE FUNCTIONS --------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //

// ----------------------------------------------------------------------------------------------- //
// Function to insert empty stave into tablature box --------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
var staveSectionCount;
function addStave() {
  staveSectionCount = 0;
  let tempmessage = document.getElementById("tempmessage");
  if (tempmessage != undefined) {
    tempmessage.parentNode.removeChild(tempmessage);
  }

  let tabcontent = document.getElementById("tabcontent");
  let staves = document.getElementsByClassName("stave");

  // Get selected stave type
  let staveType = document.getElementById("selectStaveType");
  let type = staveType.options[staveType.selectedIndex].value;

  // get previous stave id
  console.log(staves, staves.length);
  let id = 0;
  if (tabcontent.getElementsByTagName("div").length < 1) {
    id = staves.length + 1;
  } else {
    // get previous stave id
    let prevStave = staves[staves.length - 1];
    console.log(prevStave);
    id = parseInt(prevStave.id) + 1;
  }

  // const id = staves.length + 1;
  const staveid = "stave" + id;

  // Append a new stave - h3, textarea //
  let div = document.createElement("div");
  div.setAttribute("id", id);
  div.setAttribute("class", "stave");
  tabcontent.append(div);

  let h3 = document.createElement("h3");
  h3.innerHTML = "Stave " + id + ": " + type;
  h3.setAttribute("id", id + type);
  div.append(h3);

  let delSpan = document.createElement("button");
  delSpan.innerHTML = "delete";
  div.append(delSpan);

  delSpan.addEventListener("click", function () {
    deleteStave2(id);
  });

  // create a div to contain all of a staves textareas:
  let textareacontainer = document.createElement("div");
  textareacontainer.setAttribute("id", "div_" + staveid);
  textareacontainer.setAttribute("name", "stavecontainer");
  textareacontainer.setAttribute("class", "stavecontainerclass");
  div.append(textareacontainer);

  createTextarea(staveid, staveSectionCount);

  // Add new stave to dropdown option box //
  let staveDropdown = document.getElementById("selectStave");
  let staveOption = document.createElement("option");
  staveOption.setAttribute("data-stave", id);
  staveOption.value = id + "_" + staveSectionCount;
  staveOption.innerHTML = "Stave " + id + "." + staveSectionCount;

  staveDropdown.append(staveOption);
  staveDropdown.value = id + "_" + staveSectionCount;
  oldOption = staveDropdown.value;

  // document.getElementById("tuningDropdown1").disabled = true;
  // str1.disabled = true;
  // str2.disabled = true;
  // str3.disabled = true;
  // str4.disabled = true;
  // str5.disabled = true;
  // str6.disabled = true;
}

// ----------------------------------------------------------------------------------------------- //
// Function to create a textarea for stave ------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
function createTextarea(id, sectionCount) {
  let textarea = document.createElement("textarea");
  let label = document.createElement("p");

  let lastChar = id.substr(id.length - 1);

  label.innerHTML = lastChar + "." + sectionCount;
  label.setAttribute("id", lastChar + "." + sectionCount);

  textarea.setAttribute("id", id + "_" + sectionCount);
  textarea.setAttribute("name", "stave");
  textarea.setAttribute("rows", "6");
  textarea.setAttribute("cols", "100");
  // textarea.setAttribute("wrap", "off");

  let textAppend = "";
  // get tuning from select dropdowns
  let str1 = document.getElementById("tuningDropdown1");
  let str2 = document.getElementById("tuningDropdown2");
  let str3 = document.getElementById("tuningDropdown3");
  let str4 = document.getElementById("tuningDropdown4");
  let str5 = document.getElementById("tuningDropdown5");
  let str6 = document.getElementById("tuningDropdown6");

  textAppend +=
    str1.value +
    " |--\n" +
    str2.value +
    " |--\n" +
    str3.value +
    " |--\n" +
    str4.value +
    " |--\n" +
    str5.value +
    " |--\n" +
    str6.value +
    " |--";

  textarea.value = textAppend;
  let container = document.getElementById("div_" + id);
  container.append(label);
  container.append(textarea);
}

// ----------------------------------------------------------------------------------------------- //
// Function to delete the selected stave --------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
function deleteStave2(id) {
  let strId = id.toString();
  let tabcontent = document.getElementById("tabcontent");
  let deleteme = document.getElementById(id);
  tabcontent.removeChild(deleteme);

  // Remove Stave from dropdown menu - use id
  // delete all dropdown options with
  let staveDropdown = document.getElementById("selectStave");
  console.log(staveDropdown);
  for (let i = 0; i < staveDropdown.length; i++) {
    if (staveDropdown[i].dataset.stave == id) {
      staveDropdown.remove(i);
      i--;
    }
  }

  let selectedStaveMenu = document.getElementById("selectStave");
  if (selectedStaveMenu.options.length <= 0) {
    let tempmessage = document.createElement("p");
    tempmessage.innerHTML =
      "No content... Please create a stave with the button above";
    tempmessage.setAttribute("id", "tempmessage");
    tabcontent.append(tempmessage);
  }
}

// ----------------------------------------------------------------------------------------------- //
// Function to insert blank spaces into selected tablature --------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
function insertBlanks() {
  // Variable to store amount of spaces to insert
  let dropdown = document.getElementById("insertSpace");
  let amount = parseInt(dropdown.options[dropdown.selectedIndex].value);

  // Check stave exists
  let selectedStaveMenu = document.getElementById("selectStave");
  if (selectedStaveMenu.options.length <= 0) {
    alert("Please create a stave to edit!");
    return;
  }
  let selectedStave = selectedStaveMenu[selectedStaveMenu.selectedIndex].value;
  let staveid = "stave" + selectedStave;

  // Variable for rows in selected text area
  let textArea = document.getElementById(staveid);
  let textAreaLines = textArea.value.split("\n");
  let insert = "-";

  for (let i = 0; i < textAreaLines.length; i++) {
    textAreaLines[i] += insert.repeat(amount);
  }
  textareaChange(textAreaLines[0]);
  textArea.value = textAreaLines.join("\n");
}

// ----------------------------------------------------------------------------------------------- //
// Function to change tuning values for chord creation area -------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
function updateTuning(el) {
  // apply the change to the mini fretboard for chord creation
  switch (el.id) {
    case "tuningDropdown1":
      document.getElementById("tuningLabel1").innerHTML = el.value;
      break;
    case "tuningDropdown2":
      document.getElementById("tuningLabel2").innerHTML = el.value;
      break;
    case "tuningDropdown3":
      document.getElementById("tuningLabel3").innerHTML = el.value;
      break;
    case "tuningDropdown4":
      document.getElementById("tuningLabel4").innerHTML = el.value;
      break;
    case "tuningDropdown5":
      document.getElementById("tuningLabel5").innerHTML = el.value;
      break;
    case "tuningDropdown6":
      document.getElementById("tuningLabel6").innerHTML = el.value;
      break;
  }
}

// AUDIO FUNCTIONS FOR TABLATURE
async function playAudio() {
  let cancel = false;
  // this function will play the audio of all staves created
  // first, a 'do for each' for each stave
  //      then, a do for each for each of the 6 lines, changing
  //      start position to first number (after E4  |--)
  //
  //      read each line simultaneously, and play appropriate notes for the tablature

  // add stop button event listener
  // document
  //   .getElementById("audio-stop")
  //   .addEventListener("click", function () {});

  let tabcontent = document.getElementById("tabcontent");
  let allStaves = tabcontent.childNodes;
  let textAreas = document.getElementsByTagName("textarea");

  if (textAreas.length >= 1) {
    for (let i = 0; i < textAreas.length; i++) {
      let textAreaLines = textAreas[i].value.split("\n");
      let current_fret = [-1, -1, "0"];
      let staveTypeRaw = tabcontent.getElementsByTagName("h3")[i].innerHTML;
      let staveType = staveTypeRaw.substring(9);
      console.log(staveTypeRaw + " type: " + staveType);

      if (staveType == "Lead Guitar") {
        for (let k = 6; k < textAreaLines[0].length; k += 2) {
          for (let j = 0; j < textAreaLines.length; j++) {
            let data_string = "" + j + "";
            if (textAreaLines[j][k] >= 0) {
              let data_fret;
              console.log(j, k, textAreaLines[j][k], textAreaLines[j][k + 1]);
              if (textAreaLines[j][k + 1] >= 0) {
                data_fret = textAreaLines[j][k] + textAreaLines[j][k + 1];
                console.log(data_fret);
                let div = document.querySelectorAll(
                  "[data-string=" +
                    CSS.escape(data_string) +
                    "][data-fret=" +
                    CSS.escape(data_fret) +
                    "]"
                )[0];
                await new Audio("js/audio/" + div.dataset.note + ".mp3").play();
              } else {
                data_fret = textAreaLines[j][k];
                console.log(data_fret);
                let div = document.querySelectorAll(
                  "[data-string=" +
                    CSS.escape(data_string) +
                    "][data-fret=" +
                    CSS.escape(data_fret) +
                    "]"
                )[0];
                await new Audio("js/audio/" + div.dataset.note + ".mp3").play();
                k = k - 1;
              }
            }
          }
          // empty gap for blank rows
          // 300 -> 100bpm
          sleep(300);
        }
      } else {
        // Stave type is not lead - rhythm
        for (let k = 6; k < textAreaLines[0].length; k++) {
          for (let j = 0; j < textAreaLines.length; j++) {
            let data_string = "" + j + "";
            if (textAreaLines[j][k] >= 0) {
              let data_fret;
              data_fret = textAreaLines[j][k];
              let div = document.querySelectorAll(
                "[data-string=" +
                  CSS.escape(data_string) +
                  "][data-fret=" +
                  CSS.escape(data_fret) +
                  "]"
              )[0];
              await new Audio("js/audio/" + div.dataset.note + ".mp3").play();
            }
          }
          // 300 -> 100bpm
          sleep(300);
        }
      }
    }
  }
}

// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ---------------------------- CHORD CREATION AND SELECTION FUNCTIONS --------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //

// List of presaved chords to be used in selectChord function:
var chordList = [
  { id: 0, chord: "A", frets: "0--/2--/2--/2--/0--/x--" },
  { id: 1, chord: "C", frets: "0--/1--/0--/2--/3--/x--" },
  { id: 2, chord: "D", frets: "2--/1--/2--/0--/x--/x--" },
  { id: 3, chord: "E", frets: "0--/0--/1--/2--/2--/0--" },
  { id: 4, chord: "G", frets: "3--/0--/0--/0--/2--/3--" },
  { id: 5, chord: "Am", frets: "0--/1--/2--/2--/0--/x--" },
  { id: 6, chord: "Em", frets: "0--/0--/0--/2--/2--/0--" },
];

// ----------------------------------------------------------------------------------------------- //
// Function to get a presaved chord from chordList array ----------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
function selectChord() {
  let selectedStaveMenu = document.getElementById("selectStave");
  let selectedChordMenu = document.getElementById("selectChord");
  let selectedChord =
    selectedChordMenu.options[selectedChordMenu.selectedIndex].value;

  if (selectedStaveMenu.options.length <= 0) {
    alert("No stave created!");
    return;
  }

  let frets;
  for (let i = 0; i < chordList.length; i++) {
    if (chordList[i].chord == selectedChord) {
      frets = chordList[i].frets;
    }
  }

  let selectedStave = selectedStaveMenu[selectedStaveMenu.selectedIndex].value; // Outputs int id of stave
  let textArea = document.getElementById("stave" + selectedStave);

  let chordLines = frets.split("/");
  let textAreaLines = textArea.value.split("\n");

  let tabSpacing = document.getElementById("tabSpacing");
  let spaces = parseInt(tabSpacing.options[tabSpacing.selectedIndex].value);
  let newChordLines;

  for (let i = 0; i < textAreaLines.length; i++) {
    // Alter for tab spacing and append to textAreaLines
    switch (spaces) {
      case 1:
        chordLines[i] = chordLines[i].substring(0, chordLines[i].length - 1);
        textAreaLines[i] += chordLines[i];
        break;
      case 2:
        textAreaLines[i] += chordLines[i];
        break;
      case 3:
        textAreaLines[i] += chordLines[i] + "-";
        break;
      case 4:
        textAreaLines[i] += chordLines[i] + "--";
        break;
      case 5:
        textAreaLines[i] += chordLines[i] + "---";
        break;
    }
  }
  textareaChange(textAreaLines[0]);
  textArea.value = textAreaLines.join("\n");
}

// ----------------------------------------------------------------------------------------------- //
// Function to get a saved chord from the database ----------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function selectMyChord() {
  let selectedStaveMenu = document.getElementById("selectStave");
  let selectedChordMenu = document.getElementById("selectMyChord");
  let selectedChord =
    selectedChordMenu.options[selectedChordMenu.selectedIndex].value;

  if (selectedStaveMenu.options.length <= 0) {
    alert("No stave created!");
    return;
  }

  let chords = await getMyChords();
  let myChord;

  // Iterate through all user chords until match found
  for (let i = 0; i < chords.length; i++) {
    if (chords[i].chord_name == selectedChord) {
      myChord = chords[i].chord_frets;
    }
  }

  // Now, add the chord to the stave box
  let selectedStave = selectedStaveMenu[selectedStaveMenu.selectedIndex].value; // Outputs int id of stave
  let textArea = document.getElementById("stave" + selectedStave);

  let chordLines = myChord.split("/");
  let textAreaLines = textArea.value.split("\n");

  let tabSpacing = document.getElementById("tabSpacing");
  let spaces = parseInt(tabSpacing.options[tabSpacing.selectedIndex].value);
  let newChordLines;

  for (let i = 0; i < textAreaLines.length; i++) {
    // Alter for tab spacing and append to textAreaLines
    switch (spaces) {
      case 1:
        chordLines[i] = chordLines[i].substring(0, chordLines[i].length - 1);
        textAreaLines[i] += chordLines[i];
        break;
      case 2:
        textAreaLines[i] += chordLines[i];
        break;
      case 3:
        textAreaLines[i] += chordLines[i] + "-";
        break;
      case 4:
        textAreaLines[i] += chordLines[i] + "--";
        break;
      case 5:
        textAreaLines[i] += chordLines[i] + "---";
        break;
    }
  }
  textareaChange(textAreaLines[0]);
  textArea.value = textAreaLines.join("\n");
}

var editedChord = false;
var editedChordId;
var editedOldName;

async function editChord() {
  let selectedStaveMenu = document.getElementById("selectStave");
  let selectedChordMenu = document.getElementById("selectMyChord");
  let selectedChord =
    selectedChordMenu.options[selectedChordMenu.selectedIndex].value;

  let chords = await getMyChords();
  let myChord;

  // Iterate through all user chords until match found
  for (let i = 0; i < chords.length; i++) {
    if (chords[i].chord_name == selectedChord) {
      myChord = chords[i];
    }
  }

  console.log(myChord);
  console.log(myChord.start_pos);

  editedChord = true;
  editedChordId = myChord._id;
  editedOldName = myChord.chord_name;

  // Change value of startPos and chordName
  document.getElementById("startPos").value = myChord.start_pos;
  document.getElementById("chName").value = myChord.chord_name;
  changeStartPos();
  let frets = myChord.chord_frets.split("/");
  console.log(frets);

  for (let i = 0; i < frets.length; i++) {
    // for each line in the chord
    let fretVal = frets[i].substring(0, frets[i].length - 2);
    console.log("fret: " + fretVal);
    let data_fret;
    let data_string;
    if (fretVal >= 0) {
      data_fret = fretVal - myChord.start_pos;
    } else {
      data_fret = "x";
    }
    data_string = i;
    console.log("data fret and data string: " + data_fret, data_string);

    // Now, activate above frets on mini fretboard.
    let div = document.querySelectorAll(
      "[data-string=" +
        CSS.escape(data_string) +
        "][data-fret=" +
        CSS.escape(data_fret) +
        "].fret2"
    );
    console.log(div[0]);
    div[0].classList.add("fret2Selected");
  }
  let button = document.createElement("button");
  button.innerHTML = "Delete";
  button.setAttribute("style", "float: right");
  button.onclick = async function () {
    if (confirm("Are you sure you want to delete this chord?")) {
      const fetchOptions = {
        credentials: "same-origin",
        method: "POST",
      };

      let url =
        "/api/deleteChord" + "?_id=" + encodeURIComponent(editedChordId);

      console.log("Attempting to fetch /api/deleteChord.");
      const response = await fetch(url, fetchOptions);
      if (!response.ok) {
        console.log("Fetch request for /api/deleteChord has failed.");
        return;
      } else {
        console.log("Successful /api/deleteChord call.");
      }

      let chordDropdown = document.getElementById("selectMyChord");
      chordDropdown.remove(chordDropdown.selectedIndex);

      // Clear start position input and reset fretboard legend values
      document.getElementById("startPos").value = 0;
      let legendText = document
        .getElementById("fretMiniLegend")
        .getElementsByTagName("div");
      for (let i = 0; i < legendText.length; i++) {
        if (legendText[i].innerHTML >= 0) {
          legendText[i].innerHTML = i - 2;
        }
      }

      // Clear chord name input
      document.getElementById("chName").value = "";

      // Clear fretboard selections
      let frets = document.querySelectorAll(".fret2.fret2Selected");
      for (let i = 0; i < frets.length; i++) {
        frets[i].classList.remove("fret2Selected");
      }

      editedChord = false;
      editedChordId = "";
      editedOldName = "";

      alert("Chord deleted.");
    }
  };
  let btnDiv = document.getElementsByClassName("chordcreation")[0];
  console.log(btnDiv);
  btnDiv.appendChild(button);
}

// ----------------------------------------------------------------------------------------------- //
// Function to alter chord fretboard based on starting position of chord ------------------------- //
// ----------------------------------------------------------------------------------------------- //
function changeStartPos() {
  let val = parseInt(document.getElementById("startPos").value);
  let legendText = document
    .getElementById("fretMiniLegend")
    .getElementsByTagName("div");

  // Change the content of the last 5 out of 7 values in the legend row
  for (let i = 0; i < legendText.length; i++) {
    if (legendText[i].innerHTML >= 0) {
      let newVal = i - 2 + val;
      legendText[i].innerHTML = newVal;
    }
  }
}

// ----------------------------------------------------------------------------------------------- //
// Function to get a presaved chord from the library --------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function chordFretboard() {
  let frets = document.getElementsByClassName("fret2");
  let prevFret;

  // Function called by "onclick" event of frets on mini fretboard
  let chordFretClicked = function () {
    let string = this.getAttribute("data-string");
    let fret = this.getAttribute("data-fret");
    prevFret = this;
    let startPos = document.getElementById("startPos").value;

    let newFretVal;

    // if statement ensures the fret number is modified according to starting point.
    // produces fret value information to be used for chord creation
    if (fret >= 0) {
      fret = parseInt(fret);
      startPos = parseInt(startPos);
      newFretVal = fret + startPos;
    } else {
      newFretVal = fret;
    }

    // Set marker onto div to display user's fret choice

    if (string == 0) {
      // remove fret2Selected from classList of all elements of the string row
      // then adds selected element to selected class
      let stringRow = document
        .getElementById("miniFirstRow")
        .getElementsByTagName("div");
      for (let i = 0; i < stringRow.length; i++) {
        stringRow[i].classList.remove("fret2Selected");
      }
      this.classList.add("fret2Selected");
    } else if (string == 1) {
      let stringRow = document
        .getElementById("miniSecondRow")
        .getElementsByTagName("div");
      for (let i = 0; i < stringRow.length; i++) {
        stringRow[i].classList.remove("fret2Selected");
      }
      this.classList.add("fret2Selected");
    } else if (string == 2) {
      let stringRow = document
        .getElementById("miniThirdRow")
        .getElementsByTagName("div");
      for (let i = 0; i < stringRow.length; i++) {
        stringRow[i].classList.remove("fret2Selected");
      }
      this.classList.add("fret2Selected");
    } else if (string == 3) {
      let stringRow = document
        .getElementById("miniFourthRow")
        .getElementsByTagName("div");
      for (let i = 0; i < stringRow.length; i++) {
        stringRow[i].classList.remove("fret2Selected");
      }
      this.classList.add("fret2Selected");
    } else if (string == 4) {
      let stringRow = document
        .getElementById("miniFifthRow")
        .getElementsByTagName("div");
      for (let i = 0; i < stringRow.length; i++) {
        stringRow[i].classList.remove("fret2Selected");
      }
      this.classList.add("fret2Selected");
    } else {
      let stringRow = document
        .getElementById("miniSixthRow")
        .getElementsByTagName("div");
      for (let i = 0; i < stringRow.length; i++) {
        stringRow[i].classList.remove("fret2Selected");
      }
      this.classList.add("fret2Selected");
    }
  };

  // Add event listener for "clear" button
  let clearBtn = document.getElementById("clearChord");
  clearChord.addEventListener("click", function () {
    // Clear start position input and reset fretboard legend values
    document.getElementById("startPos").value = 0;
    let legendText = document
      .getElementById("fretMiniLegend")
      .getElementsByTagName("div");
    for (let i = 0; i < legendText.length; i++) {
      if (legendText[i].innerHTML >= 0) {
        legendText[i].innerHTML = i - 2;
      }
    }
    // Clear chord name input
    document.getElementById("chName").value = "";
    // Clear fretboard selections
    let frets = document.querySelectorAll(".fret2.fret2Selected");
    for (let i = 0; i < frets.length; i++) {
      frets[i].classList.remove("fret2Selected");
    }
  });

  // Adds event listener for each fret on the mini fretboard
  for (let i = 0; i < frets.length; i++) {
    frets[i].addEventListener("click", chordFretClicked, false);
  }
  refreshSavedDropdown();
}

// ----------------------------------------------------------------------------------------------- //
// Function to create a chord from the mini fretboard -------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function createChord() {
  let chordTab = "";

  // first, check if all rows have a selected value, if not, send alert and return
  let stringRow0Selected = document
    .getElementById("miniFirstRow")
    .getElementsByClassName("fret2Selected")[0];
  let stringRow1Selected = document
    .getElementById("miniSecondRow")
    .getElementsByClassName("fret2Selected")[0];
  let stringRow2Selected = document
    .getElementById("miniThirdRow")
    .getElementsByClassName("fret2Selected")[0];
  let stringRow3Selected = document
    .getElementById("miniFourthRow")
    .getElementsByClassName("fret2Selected")[0];
  let stringRow4Selected = document
    .getElementById("miniFifthRow")
    .getElementsByClassName("fret2Selected")[0];
  let stringRow5Selected = document
    .getElementById("miniSixthRow")
    .getElementsByClassName("fret2Selected")[0];

  if (stringRow0Selected == undefined) {
    alert("please select a fret for string 0");
    return;
  } else if (stringRow1Selected == undefined) {
    alert("please select a fret for string 1");
    return;
  } else if (stringRow2Selected == undefined) {
    alert("please select a fret for string 2");
    return;
  } else if (stringRow3Selected == undefined) {
    alert("please select a fret for string 3");
    return;
  } else if (stringRow4Selected == undefined) {
    alert("please select a fret for string 4");
    return;
  } else if (stringRow5Selected == undefined) {
    alert("please select a fret for string 5");
    return;
  } else {
    // if all strings contain a selected fret
    let chName = document.getElementById("chName").value;
    if (chName.length < 1) {
      alert("please enter a valid chord name");
      return;
    } else {
      // if all strings contain selected fret AND has a valid name

      let startPos = parseInt(document.getElementById("startPos").value);

      // appends starting position or "x" to final chord tab
      if (stringRow0Selected.getAttribute("data-fret") > -1) {
        let string0fret =
          parseInt(stringRow0Selected.getAttribute("data-fret")) + startPos;
        chordTab += string0fret + "--/";
      } else {
        chordTab += "x--/";
      }

      if (stringRow1Selected.getAttribute("data-fret") > -1) {
        let string1fret =
          parseInt(stringRow1Selected.getAttribute("data-fret")) + startPos;
        chordTab += string1fret + "--/";
      } else {
        chordTab += "x--/";
      }

      if (stringRow2Selected.getAttribute("data-fret") > -1) {
        let string2fret =
          parseInt(stringRow2Selected.getAttribute("data-fret")) + startPos;
        chordTab += string2fret + "--/";
      } else {
        chordTab += "x--/";
      }

      if (stringRow3Selected.getAttribute("data-fret") > -1) {
        let string3fret =
          parseInt(stringRow3Selected.getAttribute("data-fret")) + startPos;
        chordTab += string3fret + "--/";
      } else {
        chordTab += "x--/";
      }

      if (stringRow4Selected.getAttribute("data-fret") > -1) {
        let string4fret =
          parseInt(stringRow4Selected.getAttribute("data-fret")) + startPos;
        chordTab += string4fret + "--/";
      } else {
        chordTab += "x--/";
      }

      if (stringRow5Selected.getAttribute("data-fret") > -1) {
        let string5fret =
          parseInt(stringRow5Selected.getAttribute("data-fret")) + startPos;
        chordTab += string5fret + "--";
      } else {
        chordTab += "x--";
      }
      // now, get the tuning values from dropdown
      let tuning = [];
      let str1 = document.getElementById("tuningLabel1").textContent;
      let str2 = document.getElementById("tuningLabel2").textContent;
      let str3 = document.getElementById("tuningLabel3").textContent;
      let str4 = document.getElementById("tuningLabel4").textContent;
      let str5 = document.getElementById("tuningLabel5").textContent;
      let str6 = document.getElementById("tuningLabel6").textContent;
      tuning.push(str1, str2, str3, str4, str5, str6);

      // save chord to database!!!
      let token;
      if (sessionStorage.length < 1) {
        token = localStorage.getItem("token");
      } else {
        token = sessionStorage.getItem("token");
      }
      const fetchOptions = {
        credentials: "same-origin",
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      };

      let response;
      if (editedChord == true) {
        let url =
          "/api/updateChord" +
          "?chord_name=" +
          encodeURIComponent(chName) +
          "&chord_frets=" +
          encodeURIComponent(chordTab) +
          "&chord_tuning=" +
          encodeURIComponent(tuning) +
          "&start_pos=" +
          encodeURIComponent(startPos) +
          "&editedId=" +
          encodeURIComponent(editedChordId);

        response = await fetch(url, fetchOptions);

        if (!response.ok) {
          // handle the error
          console.log("Fetch response for /api/updateChord has failed.");
          return;
        } else {
          console.log("Successful /api/updateChord call.");
        }

        // Update name in dropdown list
        let chordDropdown = document.getElementById("selectMyChord");
        chordDropdown.remove(chordDropdown.selectedIndex);
        let newOption = document.createElement("option");
        newOption.text = chName;
        chordDropdown.add(newOption);
      } else {
        let url =
          "/api/saveChord" +
          "?chord_name=" +
          encodeURIComponent(chName) +
          "&chord_frets=" +
          encodeURIComponent(chordTab) +
          "&chord_tuning=" +
          encodeURIComponent(tuning) +
          "&start_pos=" +
          encodeURIComponent(startPos);
        console.log("Attempting to fetch /api/savedChord.");

        response = await fetch(url, fetchOptions);

        if (!response.ok) {
          // handle the error
          console.log("Fetch response for /api/saveChord has failed.");
          return;
        } else {
          console.log("Successful /api/saveChord call.");
        }

        // Add new chord to list
        let chordDropdown = document.getElementById("selectMyChord");
        let newOption = document.createElement("option");
        newOption.text = chName;
        chordDropdown.add(newOption);
      }

      // Clear start position input and reset fretboard legend values
      document.getElementById("startPos").value = 0;
      let legendText = document
        .getElementById("fretMiniLegend")
        .getElementsByTagName("div");
      for (let i = 0; i < legendText.length; i++) {
        if (legendText[i].innerHTML >= 0) {
          legendText[i].innerHTML = i - 2;
        }
      }

      // Clear chord name input
      document.getElementById("chName").value = "";

      // Clear fretboard selections
      let frets = document.querySelectorAll(".fret2.fret2Selected");
      for (let i = 0; i < frets.length; i++) {
        frets[i].classList.remove("fret2Selected");
      }

      editedChord = false;
      editedChordId = "";
      editedOldName = "";
    }
  }
}

// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// -------------------------------------- GENERIC FUNCTIONS -------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //

// ----------------------------------------------------------------------------------------------- //
// Generic function to get chords from database -------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function getMyChords() {
  // First, get chord names from server
  let token;
  if (sessionStorage.length < 1) {
    token = localStorage.getItem("token");
  } else {
    token = sessionStorage.getItem("token");
  }
  const fetchOptions = {
    credentials: "same-origin",
    method: "GET",
    headers: { Authorization: "Bearer " + token },
  };

  let url = "/api/getSavedChords";
  console.log("Attempting to fetch /api/getSavedChords.");

  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    // handle the error
    console.log("Fetch response for /api/getSavedChords has failed.");
    return;
  }
  console.log("Successful /api/getSavedChords call.");

  let chords = await response.json();
  // An object with the JSON database tables for user's chords!
  return chords;
}

// ----------------------------------------------------------------------------------------------- //
// Generic function to refresh the saved chords dropdown ----------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function refreshSavedDropdown() {
  let chordDropdown = document.getElementById("selectMyChord");
  let options = chordDropdown.getElementsByTagName("option");

  // First, clear the dropdown
  for (let i = options.length - 1; i >= 0; i--) {
    chordDropdown.options[i] = null;
  }

  // Fill in 'My Chords' dropdown:

  let chords = await getMyChords();

  for (let i = 0; i < chords.length; i++) {
    let option = document.createElement("option");
    option.text = chords[i].chord_name;
    chordDropdown.add(option);
  }
}

// ----------------------------------------------------------------------------------------------- //
// A generic function for the search criteria for viewing tablatures ----------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function getTabs(key) {
  const fetchOptions = {
    credentials: "same-origin",
    method: "GET",
    // headers: { Authorization: "Bearer " + token },
  };

  let url = "/api/getTabsMetadata" + "?key=" + encodeURIComponent(key);
  console.log("attempting to fetch /api/getTabsMetadata");

  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    // handle the error
    console.log("fetch response for /api/getTabsMetadata has failed.");
    return;
  }
  console.log("successful /api/getTabsMetadata call.");

  // Store incoming data into JSON object and return to function caller
  let res = await response.json();
  console.log(res);
  return res;
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if (new Date().getTime() - start > milliseconds) {
      break;
    }
  }
}
