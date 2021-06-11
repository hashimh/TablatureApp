// file for home page / start-up functions
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
