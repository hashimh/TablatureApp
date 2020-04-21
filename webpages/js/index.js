"use strict";
var editedTab = false;
var editedTabId = "";
var tabInfo;

// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// -------------------------------------- INITIAL FUNCTIONS -------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
window.onload = async (event) => {
  // Get tablature information from the database
  tabInfo = await getTabs("all");
  populateTable(tabInfo);
};

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
  contentArea.appendChild(listWrapper);

  // Now, create li for each result, append information accordingly
  for (let i = 0; i < tabInfo.length; i++) {
    let listElem = document.createElement("ul");
    // Give id to each list element
    listElem.setAttribute("id", tabInfo[i]._id, 0);
    listElem.setAttribute("class", "results-list-elem");
    // create a list element for each section of the UL
    let listElemText0 = document.createElement("li");
    listElemText0.innerHTML =
      "<b>" + tabInfo[i].song_name + " by " + tabInfo[i].artist_name + "</b>";
    listElemText0.style.paddingRight = "1em";

    let listElemText1 = document.createElement("li");
    listElemText1.innerHTML = "<i>" + tabInfo[i].genre + "</i>";

    let listElemText2 = document.createElement("li");
    listElemText2.innerHTML = "<i>" + "user: " + tabInfo[i].email + "</i>";
    listElemText2.style.float = "right";
    listElemText2.style.paddingRight = "1em";

    let listElemSymbol = document.createElement("li");
    let symbol = document.createElement("i");
    symbol.setAttribute("class", "fa fa-plus");
    symbol.setAttribute("aria-hidden", "true");
    listElemSymbol.appendChild(symbol);
    listElemSymbol.style.float = "right";

    // Create onclick event for each li element, to open the tablatures
    listElem.setAttribute("onclick", "openTab(this.id)");

    // Append p and button to their li
    listElem.appendChild(listElemText0);
    listElem.appendChild(listElemText1);
    listElem.appendChild(listElemSymbol);
    listElem.appendChild(listElemText2);
    listWrapper.appendChild(listElem);
  }
  // List of availabe information from tabInfo:
  // tabInfo[i]._id
  // .genre
  // .artist_name,
  // .song_name,
  // .email
  // addRowHandlers();
}

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

async function openTab(id) {
  // function will switch to tabcont. and fill in information
  let tabcontainer = document.getElementById("tab-container-id");
  let maincontainer = document.getElementById("main-container-id");
  maincontainer.style.display = "none";
  tabcontainer.style.display = "grid";

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
    "<b>" + res[0].song_name + " by " + res[0].artist_name + "</b>";

  document.getElementById("tab-info-2").innerHTML =
    "<i>" + res[0].genre + "</i>";

  let staves = res[0].stave_types.split(",");
  let substaves = res[0].stave_subtypes.split(",");
  let stavecontent = res[0].stave_content.split(",");
  let user = res[0].email;

  let contentcontainer = document.getElementById("tab-content-id");

  while (contentcontainer.hasChildNodes()) {
    contentcontainer.removeChild(contentcontainer.firstChild);
  }

  // let closeBtn = document.createElement("button");
  // closeBtn.setAttribute("onclick", "closeTab();");
  // closeBtn.setAttribute("class", "close-tab-btn");
  // closeBtn.innerHTML = "close";
  // contentcontainer.append(closeBtn);

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

  // NEXT, CHECK IF CURRENT USER IS USER WHO CREATED THE TAB AND ADD SOME EXTRA OPTIONS FOR THEM
}

// ----------------------------------------------------------------------------------------------- //
// Store user's login information into localStorage ---------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// function onSignIn(googleUser) {
//   let auth2 = gapi.auth2.getAuthInstance();
//   localStorage.setItem(
//     "id_token",
//     auth2.currentUser.get().getAuthResponse().id_token
//   );
//   localStorage.setItem("googleUser", googleUser.getBasicProfile().getName());
//   localStorage.setItem("userEmail", googleUser.getBasicProfile().getEmail());
//   auth2.disconnect();

//   // Call next initialising function
//   callServer(googleUser);
// }

// ----------------------------------------------------------------------------------------------- //
// Function gets next form from the server ------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// async function callServer(googleUser) {
//   let apiLink = "/api/login";
//   await getPage(apiLink);

//   const token = localStorage.getItem("id_token");
//   const fetchOptions = {
//     credentials: "same-origin",
//     method: "POST",
//     headers: { Authorization: "Bearer " + token },
//   };

//   // This API call checks to see if a user is in the database. If they aren't, they
//   // are added to the db. If yes, then this part is skipped.
//   const response = await fetch("/api/checkUser", fetchOptions);
//   if (!response.ok) {
//     console.log("Fetch response for /api/checkuser has failed.");
//     return;
//   }
// }

// ----------------------------------------------------------------------------------------------- //
// Function to sign out of the menu.html form ---------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function signOut() {
  // Call server function 'logout'
  let apiLink = "/api/logout";
  await getPage(apiLink);

  window.location.reload();

  // Removes ID Token from local storage, ensures Google account logs out properly.
  // localStorage.removeItem("id_token");
  // localStorage.removeItem("googleUser");
}

// ----------------------------------------------------------------------------------------------- //
// Function to go to main.html form -------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function createTabBtn() {
  // Call server function 'createTabBtn'
  let apiLink = "/api/createTabBtn";
  await getPage(apiLink);

  editedTab = false;
  editedTabId = "";
  ``;

  populateMain();
}

// ----------------------------------------------------------------------------------------------- //
// Function to initialise the form --------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function populateMain() {
  // Get user's name for nav bar
  const el = document.getElementById("greeting");
  // el.textContent = " - Hello " + localStorage.getItem("googleUser");

  fretBoard();
  chordFretboard();
}

// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ------------------------------------- NAVIGATION BAR CODE ------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //

// ----------------------------------------------------------------------------------------------- //
// Code for the help modal popup ----------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// Get the modal
function helpBtn() {
  let modal = document.getElementById("helpModal");
  // Get the <span> element that closes the modal
  let span = document.getElementsByClassName("close")[0];
  // When the user clicks the button, open the modal
  modal.style.display = "block";
  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = "none";
  };
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

// ----------------------------------------------------------------------------------------------- //
// Function to sign out of the menu.html form ---------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function signOut2() {
  if (confirm("All content will be lost, continue with sign out?")) {
    // Call server function 'logout'
    let apiLink = "/api/logout";
    await getPage(apiLink);

    window.location.reload();

    // Removes ID Token from local storage, ensures Google account logs out properly.
    localStorage.removeItem("id_token");
    localStorage.removeItem("googleUser");
  } else {
    return;
  }
}

// ----------------------------------------------------------------------------------------------- //
// Function to save a tablature ------------------------------------------------------------------ //
// ----------------------------------------------------------------------------------------------- //
async function saveTab() {
  // first, check if at least 1 stave exists, with at least 1 column of entries
  let selectedStaveMenu = document.getElementById("selectStave");
  if (selectedStaveMenu.options.length <= 0) {
    alert("Nothing to save!");
    return;
  }

  // now, bring up form for user to enter song name, artist, genre, etc.
  let modal = document.getElementById("saveModal");
  let span = document.getElementsByClassName("close")[1];

  modal.style.display = "block";

  span.onclick = function () {
    modal.style.display = "none";
  };

  let confirmBtn = document.getElementById("confirmSave");
  confirmBtn.addEventListener("click", async function () {
    let songName = document.getElementById("songName").value;
    let artistName = document.getElementById("artistName").value;
    let genreMenu = document.getElementById("genreSelect");
    let songGenre = genreMenu.options[genreMenu.selectedIndex].value;
    if (editedTab == false) {
      // most of the code will go here...
      // first, check inputs and assign variables

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
      const token = localStorage.getItem("id_token");
      const fetchOptions = {
        credentials: "same-origin",
        method: "POST",
        // headers: { Authorization: "Bearer " + token },
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
      alert("Tab saved in database!");
      // clear modal entries and close modal
      songName = "";
      artistName = "";
      modal.style.display = "none";

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
    } else {
      // Call new server function -> new database function -> replace old _id file with new one
      let types = [];
      let staves = [];
      let tabContent = document.getElementById("tabcontent");
      let allStaves = tabContent.getElementsByTagName("div");

      for (let i = 0; i < allStaves.length; i++) {
        // get stave type from h3's id, and add to 'type' array
        let type = allStaves[i].getElementsByTagName("h3")[0].id;
        type = type.substring(1);
        types.push(type);

        // now, get stave textarea, and add to 'stave' array
        let textarea = allStaves[i].getElementsByTagName("textarea")[0].value;
        staves.push(textarea);
      }

      const token = localStorage.getItem("id_token");
      const fetchOptions = {
        credentials: "same-origin",
        method: "POST",
        // headers: { Authorization: "Bearer " + token },
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
      alert("Tab updated in database!");
      // clear modal entries and close modal
      songName = "";
      artistName = "";
      modal.style.display = "none";

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
    }
  });
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
    alert("time for a new textarea");
    // create a new textarea, append it to the container
    // change the value of select stave dropdown to new area
    // to get count, get number of child elements of the container, then add 1, or use global var
    createTextarea(stavedivid, staveSectionCount + 1);

    let staveDropdown = document.getElementById("selectStave");
    let staveOption = document.createElement("option");
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

  const id = staves.length + 1;
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
function deleteStave() {
  let selectedStaveMenu = document.getElementById("selectStave");

  // If no staves yet created, output error message
  if (selectedStaveMenu.options.length <= 0) {
    alert("No Stave selected");
    return;
  }
  let selectedStave =
    selectedStaveMenu.options[selectedStaveMenu.selectedIndex].value; // Outputs Int
  // Function to delete an individual stave
  // Search for child with id of selected, and remove child
  if (confirm("Are you sure you want to delete Stave " + selectedStave + "?")) {
    // Selects are removes Stave 'div' element
    let textarea = document.getElementById(selectedStave);
    textarea.parentNode.removeChild(textarea);

    // Remove Stave from dropdown menu
    let staveDropdown = document.getElementById("selectStave");
    staveDropdown.remove(staveDropdown.selectedIndex);
  }

  if (selectedStaveMenu.options.length <= 0) {
    // enable tuning dropdown lists if no staves are left.
    document.getElementById("tuningDropdown1").disabled = false;
    document.getElementById("tuningDropdown2").disabled = false;
    document.getElementById("tuningDropdown3").disabled = false;
    document.getElementById("tuningDropdown4").disabled = false;
    document.getElementById("tuningDropdown5").disabled = false;
    document.getElementById("tuningDropdown6").disabled = false;

    let tabcontent = document.getElementById("tabcontent");
    let tempmessage = document.createElement("p");
    tempmessage.innerHTML =
      "No content... Please create a stave with the button above";
    tempmessage.setAttribute("id", "tempmessage");
    tabcontent.append(tempmessage);
  }
}

// ----------------------------------------------------------------------------------------------- //
// Function to clear the form of all staves ------------------------------------------------------ //
// ----------------------------------------------------------------------------------------------- //
function clearAllStaves() {
  let tabcontent = document.getElementById("tabcontent");
  let allStaves = tabcontent.childNodes;

  let selectedStaveMenu = document.getElementById("selectStave");
  // If no staves yet created, output error message
  if (selectedStaveMenu.options.length <= 0) {
    alert("No staves created");
    return;
  } else {
    if (confirm("Are you sure you want to reset all staves?")) {
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
    } else {
      // Do nothing
      return;
    }
  }

  document.getElementById("tuningDropdown1").disabled = false;
  document.getElementById("tuningDropdown2").disabled = false;
  document.getElementById("tuningDropdown3").disabled = false;
  document.getElementById("tuningDropdown4").disabled = false;
  document.getElementById("tuningDropdown5").disabled = false;
  document.getElementById("tuningDropdown6").disabled = false;
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
  // this function will play the audio of all staves created
  // first, a 'do for each' for each stave
  //      then, a do for each for each of the 6 lines, changing
  //      start position to first number (after E4  |--)
  //
  //      read each line simultaneously, and play appropriate notes for the tablature
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
          sleep(200);
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
          sleep(200);
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
      const token = localStorage.getItem("id_token");

      const fetchOptions = {
        credentials: "same-origin",
        method: "POST",
        // headers: { Authorization: "Bearer " + token },
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
      const token = localStorage.getItem("id_token");
      const fetchOptions = {
        credentials: "same-origin",
        method: "POST",
        // headers: { Authorization: "Bearer " + token },
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

async function backBtnMain() {
  if (confirm("Changes will not be saved, are you sure you want to go back?")) {
    // Call main menu form
    let apiLink = "/api/login";
    await getPage(apiLink);
  }
}

// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ------------------------------------- VIEW TABS FUNCTIONS ------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// Code for the 'viewtabs.html' form

// ----------------------------------------------------------------------------------------------- //
// Function to go to viewtab.html form ----------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// async function viewTabBtn() {
//   // Call server function 'createTabBtn'
//   let apiLink = "/api/viewTabBtn";
//   await getPage(apiLink);

//   populateMain2();
// }

// var tabInfo;
// async function populateMain2() {
//   // Get user's name for nav bar
//   const el = document.getElementById("greeting2");
//   el.textContent = " - Hello " + localStorage.getItem("googleUser");

//   // Remove potential pre-existing results
//   let div = document.getElementById("selectedContent");
//   while (div.hasChildNodes()) {
//     div.removeChild(div.firstChild);
//   }

//   // Get tablature information from the database
//   tabInfo = await getTabs("all");
//   populateTable(tabInfo);
// }

// ----------------------------------------------------------------------------------------------- //
// Function to change whose tabs are displayed to user ------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// async function showWhichTabsChange() {
//   // let myTabInfo;
//   let menu = document.getElementsByClassName("showWhichTabs")[0];
//   let newVal = menu.options[menu.selectedIndex].value;

//   if (newVal == "allTabs") {
//     // show all aka insert tabInfo into table
//     tabInfo = await getTabs("all");
//     populateTable(tabInfo);
//   } else if (newVal == "myTabs") {
//     // show all of users tabs
//     tabInfo = await getTabs("myTabs");
//     populateTable(tabInfo);
//   } else {
//     // don't show users tabs
//     tabInfo = await getTabs("otherTabs");
//     populateTable(tabInfo);
//   }
// }

// ----------------------------------------------------------------------------------------------- //
// Function to search all tabs by name, artist and genre ----------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
function searchByName() {
  let search = document.getElementById("searchByName").value;
  let newTabInfo = tabInfo.filter(function (el) {
    return el.song_name.includes(search);
  });
  populateTable(newTabInfo);
}

function searchByArtist() {
  let search = document.getElementById("searchByArtist").value;
  let newTabInfo = tabInfo.filter(function (el) {
    return el.artist_name.includes(search);
  });
  populateTable(newTabInfo);
}

function searchByGenre() {
  let searchMenu = document.getElementById("searchGenre");
  let search = searchMenu.options[searchMenu.selectedIndex].value;
  if (search !== "All Genres") {
    let newTabInfo = tabInfo.filter(function (el) {
      return el.genre == search;
    });
    populateTable(newTabInfo);
  } else {
    populateTable(tabInfo);
  }
}

// ----------------------------------------------------------------------------------------------- //
// Function to make clickable table and get relevant info upon events ---------------------------- //
// ----------------------------------------------------------------------------------------------- //
// async function addRowHandlers() {
//   let table = document.getElementById("tabTable");
//   let rows = table.getElementsByTagName("tr");
//   for (let i = 1; i < rows.length; i++) {
//     let currentRow = table.rows[i];
//     let createClickHandler = function (row) {
//       return async function () {
//         let id = row.id;

//         // Do the main stuff
//         // use getTabs function, alter 'key' parameter to be sent
//         // to include name, artist and user

//         const token = localStorage.getItem("id_token");
//         const fetchOptions = {
//           credentials: "same-origin",
//           method: "GET",
//           // headers: { Authorization: "Bearer " + token },
//         };
//         let url = "/api/getTabContent" + "?id=" + encodeURIComponent(id);
//         console.log("Attempting to fetch /api/getTabContent.");

//         const response = await fetch(url, fetchOptions);
//         if (!response.ok) {
//           console.log("Fetch response for /api/getTabContent has failed.");
//           return;
//         }
//         console.log("Successful /api/getTabContent call.");
//         let res = await response.json();

//         populateContent(res);
//       };
//     };
//     currentRow.onclick = createClickHandler(currentRow);
//   }
// }

// Populate content
function populateContent(tabContent) {
  let mainDiv = document.getElementById("selectedContent");
  mainDiv.style.visibility = "visible";
  // First, empty contents of mainDiv
  while (mainDiv.hasChildNodes()) {
    mainDiv.removeChild(mainDiv.firstChild);
  }
  // for loop through number of staves
  // if tablature is users, show modal
  let rawData = tabContent;

  let staves = tabContent[0].stave_types.split(",");
  let rawContent = tabContent[0].stave_content.split(",");
  let user = tabContent[0].email;

  for (let i = 0; i < staves.length; i++) {
    // first, create inner stave div
    let staveDiv = document.createElement("div");
    staveDiv.setAttribute("class", "contentDiv");

    let h3 = document.createElement("h3");
    h3.innerHTML = "Stave " + (i + 1) + ": " + staves[i];
    staveDiv.append(h3);

    let textarea = document.createElement("textarea");
    textarea.setAttribute("rows", "6");
    textarea.setAttribute("cols", "100");
    textarea.setAttribute("wrap", "off");
    textarea.value = "\n\n\n\n\n";

    let textAreaLines = textarea.value.split("\n");
    let content = rawContent[i].split("\n");

    for (let j = 0; j < content.length; j++) {
      textAreaLines[j] += content[j];
    }

    textarea.value = textAreaLines.join("\n");
    staveDiv.append(textarea);
    mainDiv.append(staveDiv);
  }

  // Create a div for text boxes, containing song name, artist and email
  let infoDiv = document.createElement("div");
  infoDiv.setAttribute("class", "infoDiv");

  let nameLabel = document.createElement("label");
  nameLabel.innerHTML = "Song Name: " + tabContent[0].song_name;
  nameLabel.setAttribute("style", "display: block");
  infoDiv.append(nameLabel);

  let artistLabel = document.createElement("label");
  artistLabel.innerHTML = "Artist Name: " + tabContent[0].artist_name;
  artistLabel.setAttribute("style", "display: block");
  infoDiv.append(artistLabel);

  let genreLabel = document.createElement("label");
  genreLabel.innerHTML = "Genre: " + tabContent[0].genre;
  genreLabel.setAttribute("style", "display: block");
  infoDiv.append(genreLabel);

  mainDiv.append(infoDiv);

  if (user == localStorage.getItem("userEmail")) {
    let editBtn = document.createElement("button");
    editBtn.setAttribute("id", "editTabBtn");
    editBtn.setAttribute("value", "Edit");
    editBtn.setAttribute("title", "Select to edit current tablature");
    editBtn.innerHTML = "Edit Tablature";

    let deleteBtn = document.createElement("button");
    deleteBtn.setAttribute("id", "deleteTabBtn");
    deleteBtn.setAttribute("value", "Delete Tab");
    deleteBtn.setAttribute("title", "Select to delete current tablature");
    deleteBtn.innerHTML = "Delete Tablature";

    mainDiv.append(editBtn);
    mainDiv.append(deleteBtn);
  }

  if (document.getElementById("editTabBtn") !== null) {
    document.getElementById("editTabBtn").onclick = function () {
      // Make a call to the 'edit tablature' function
      editTab(rawData);
    };
  }

  if (document.getElementById("deleteTabBtn") !== null) {
    document.getElementById("deleteTabBtn").onclick = async function () {
      if (confirm("Are you sure you want to delete this tablature?")) {
        console.log("Deleting...");
        let _id = rawData[0]._id;
        // Send request to server to delete, then reload page
        const token = localStorage.getItem("id_token");
        const fetchOptions = {
          credentials: "same-origin",
          method: "POST",
          // headers: { Authorization: "Bearer " + token },
        };

        let url = "/api/deleteTab" + "?_id=" + encodeURIComponent(_id);

        console.log("Attempting to fetch /api/deleteTab.");
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
          console.log("Fetch request for /api/deleteTab has failed.");
          return;
        } else {
          console.log("Successful /api/deleteTab call.");
        }
        alert("Tablature deleted.");
        populateMain2();
      } else {
        return;
      }
    };
  }
}

async function editTab(data) {
  // Take user to 'create tablature' page, with data
  let apiLink = "/api/createTabBtn";
  await getPage(apiLink);

  // Now, fill in the page with all information
  // - Add staves to dropdown menu
  let staves = data[0].stave_types.split(",");
  let staveDropdown = document.getElementById("selectStave");
  let rawContent = data[0].stave_content.split(",");
  let tabContent = document.getElementById("tabcontent");

  for (let i = 0; i < staves.length; i++) {
    let staveOption = document.createElement("option");
    staveOption.value = i + 1;
    staveOption.innerHTML = "Stave " + (i + 1);
    staveDropdown.append(staveOption);

    // - For each stave group in data
    //      - run createStave
    //      - fill in with information
    //      - OR... Just fill it out now

    let div = document.createElement("div");
    div.setAttribute("id", i + 1);
    div.setAttribute("class", "stave");
    tabContent.append(div);

    let h3 = document.createElement("h3");
    h3.innerHTML = "Stave " + (i + 1) + ": " + staves[i];
    h3.setAttribute("id", i + 1 + staves[i]);
    div.append(h3);

    let textArea = document.createElement("textarea");
    textArea.setAttribute("id", "stave" + (i + 1));
    textArea.setAttribute("name", "stave");
    textArea.setAttribute("rows", "6");
    textArea.setAttribute("cols", "100");
    textArea.setAttribute("wrap", "off");
    textArea.value = "\n\n\n\n\n";

    let textAreaLines = textArea.value.split("\n");
    let content = rawContent[i].split("\n");

    for (let j = 0; j < content.length; j++) {
      textAreaLines[j] = content[j];
    }

    textArea.value = textAreaLines.join("\n");
    div.append(textArea);
    tabContent.append(div);
  }
  fretBoard();
  chordFretboard();

  let songName = data[0].song_name;
  let artistName = data[0].artist_name;
  let genre = data[0].genre;

  // Override save button to send pre-saved metadata to modal

  document.getElementById("saveTabBtn").addEventListener("click", function () {
    document.getElementById("songName").value = songName;
    document.getElementById("artistName").value = artistName;
    document.getElementById("genreSelect").value = genre;
  });

  editedTab = true;
  editedTabId = data[0]._id;
}

// Function to reset search criteria
function resetSearch() {
  document.getElementById("showMeDropdown").selectedIndex = 0;
  document.getElementById("searchGenre").selectedIndex = 0;
  document.getElementById("searchByName").value = "";
  document.getElementById("searchByArtist").value = "";
  populateMain2();
}

// Functions to change background colour of row on mouseover
function changeBackground(row) {
  row.style.backgroundColor = "teal";
}
function revertBackground(row) {
  row.style.backgroundColor = "white";
}

async function backBtnView() {
  let apiLink = "/api/login";
  await getPage(apiLink);
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
  const token = localStorage.getItem("id_token");
  const fetchOptions = {
    credentials: "same-origin",
    method: "GET",
    // headers: { Authorization: "Bearer " + token },
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

function moveText() {
  document.getElementById("moveable-text").style.top = "0px";
}
function moveText2() {
  document.getElementById("moveable-text").style.top = "-60px";
}

// ----------------------------------------------------------------------------------------------- //
// Generic function to change forms -------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function getPage(apiLink) {
  const token = localStorage.getItem("id_token");
  const fetchOptions = {
    credentials: "same-origin",
    method: "GET",
    // headers: { Authorization: "Bearer " + token },
  };
  const response = await fetch(apiLink, fetchOptions);
  if (!response.ok) {
    console.log("Fetch response for " + apiLink + "has failed.");
    return;
  }
  console.log("Fetch response for " + apiLink + " successful.");
  let innerhtml = await response.text();
  document.documentElement.innerHTML = innerhtml;
}

// ----------------------------------------------------------------------------------------------- //
// Function to sort array of tabs by 'property' variable ----------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
var sortBy = function (property) {
  return function (x, y) {
    return x[property] === y[property] ? 0 : x[property] > y[property] ? 1 : -1;
  };
};

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
