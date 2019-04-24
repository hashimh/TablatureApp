'use strict';

// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// -------------------------------------- INITIAL FUNCTIONS -------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //



// ----------------------------------------------------------------------------------------------- //
// Store user's login information into localStorage ---------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
function onSignIn(googleUser) {
  console.log("sign in function called");
  let auth2 = gapi.auth2.getAuthInstance();
  localStorage.setItem("id_token",auth2.currentUser.get().getAuthResponse().id_token);
  localStorage.setItem("googleUser",googleUser.getBasicProfile().getName());
  auth2.disconnect();

  // Call next initialising function
  callServer(googleUser);
}



// ----------------------------------------------------------------------------------------------- //
// Function gets next form from the server ------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function callServer(googleUser) {
  console.log("call server function called");
  let apiLink = '/api/login';
  await getPage(apiLink);

  const token = localStorage.getItem("id_token");
  const fetchOptions = {
    credentials: 'same-origin',
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token },
  };

  // This API call checks to see if a user is in the database. If they aren't, they
  // are added to the db. If yes, then this part is skipped.
  const response = await fetch('/api/checkUser', fetchOptions);
  if (!response.ok) {
    console.log("fetch response for /api/checkuser has failed.");
    return;
  }

  // Get name for heading
  const profile = googleUser.getBasicProfile();
  const el = document.getElementById('greeting');
  el.textContent = 'Welcome, ' + profile.getName() + '...' + 'What would you like to do today?';
}



// ----------------------------------------------------------------------------------------------- //
// Function to sign out of the menu.html form ---------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function signOut() {
  // Call server function 'logout'
  let apiLink = '/api/logout';
  await getPage(apiLink);

  window.location.reload();

  // Removes ID Token from local storage, ensures Google account logs out properly.
  localStorage.removeItem("id_token");
  localStorage.removeItem("googleUser");

}



// ----------------------------------------------------------------------------------------------- //
// Function to go to main.html form -------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function createTabBtn() {
  // Call server function 'createTabBtn'
  let apiLink = '/api/createTabBtn';
  await getPage(apiLink);

  populateMain();
}



// ----------------------------------------------------------------------------------------------- //
// Function to initialise the form --------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function populateMain() {
  console.log("populating main...")

  // Get user's name for nav bar
  const el = document.getElementById('greeting');
  el.textContent = " - Hello " + localStorage.getItem("googleUser");

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
  let modal = document.getElementById('helpModal');

  // Get the <span> element that closes the modal
  let span = document.getElementsByClassName("close")[0];

  // When the user clicks the button, open the modal
  modal.style.display = "block";

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}



// ----------------------------------------------------------------------------------------------- //
// Function to sign out of the menu.html form ---------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function signOut2() {
  if (confirm("All changes will be lost, continue with sign out?")) {
    // Call server function 'logout'
    let apiLink = '/api/logout';
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
  if ((selectedStaveMenu.options).length <= 0) {
    alert("Nothing to save!");
    return;
  }

  // now, bring up form for user to enter song name, artist, genre, etc.
  let modal = document.getElementById("saveModal");
  let span = document.getElementsByClassName("close")[1];

  modal.style.display = "block";

  span.onclick = function() {
    modal.style.display = "none";
  }

  let confirmBtn = document.getElementById("confirmSave");
  confirmBtn.addEventListener("click", async function() {
    // most of the code will go here...
    // first, check inputs and assign variables
    let songName = document.getElementById("songName").value;
    let artistName = document.getElementById("artistName").value;
    let genreMenu = document.getElementById("genreSelect");
    let songGenre = genreMenu.options[genreMenu.selectedIndex].value;

    if (songName.length <= 0) {
      alert("Please enter a valid song name.");
      return;
    } else if (artistName.length <= 0) {
      alert("Please enter a valid artist name.");
    }

    // Now, save the stave contents into variables
    let types = [];
    let staves = [];
    let tabContent = document.getElementById("tabcontent");
    let allStaves = tabContent.getElementsByTagName("div");

    for (let i = 0; i < allStaves.length; i++) {
      // get stave type from h3's id, and add to 'type' array
      let type = allStaves[i].getElementsByTagName("h3")[0].id
      type = type.substring(1);
      types.push(type)

      // now, get stave textarea, and add to 'stave' array
      let textarea = allStaves[i].getElementsByTagName("textarea")[0].value;
      staves.push(textarea);

    }

    // Now, stave types and contents stored in the arrays below...
    console.log(types);
    console.log(staves);

    // make initial server call requests...
    const token = localStorage.getItem("id_token");
    const fetchOptions = {
      credentials: 'same-origin',
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
    };

    let url = '/api/saveTab'
              + '?song_name=' + encodeURIComponent(songName)
              + '&artist_name=' + encodeURIComponent(artistName)
              + '&genre=' + encodeURIComponent(songGenre)
              + '&stave_types=' + encodeURIComponent([types])
              + '&stave_content=' + encodeURIComponent([staves]);

    console.log("attempting to fetch /api/saveTab");
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      // handle the error
      console.log("fetch response for /api/saveTab has failed")
      return;
    } else {
      console.log("successful /api/saveTab call!");
    }
    alert("tab saved in database!");
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
    tempmessage.innerHTML = "No content... Please create a stave with the button above"
    tempmessage.setAttribute("id", "tempmessage");
    tabcontent.append(tempmessage);
  });
}


// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ------------------------------------- MAIN FRETBOARD CODE ------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //

let symbolInserted = false;
let symbolString;
let symbolFret;

// ----------------------------------------------------------------------------------------------- //
// Function for main fretboard, allows frets to be added to tablature ---------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function fretBoard() {
  let frets = document.getElementsByClassName("fret");

  // Event handler for clicking a fret:
  let fretClicked = function() {
    let string = this.getAttribute("data-string");
    let fret = this.getAttribute("data-fret");
    let selectedStaveMenu = document.getElementById("selectStave");

    // If no staves yet created, output error message.
    if ((selectedStaveMenu.options).length <= 0) {
      alert("Please create a stave to edit!");
      return;
    }

    let selectedStave = selectedStaveMenu.options[selectedStaveMenu.selectedIndex].value;
    let staveid = "stave" + selectedStave;
    let textArea = document.getElementById(staveid);
    let textAreaLines = textArea.value.split("\n");

    // For each line in the textarea (line 0 to line 5)
    // concatenate (+) either "--" or "stringnumber", depending on strng value
    // Also adjust value of tab spacing
    let staveSpacing = document.getElementById("tabSpacing");
    let selectedSpacing = parseInt(staveSpacing.options[staveSpacing.selectedIndex].value);

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

      if (symbolInserted == true && (symbolString > -1 && symbolFret > -1)) {
        console.log("string: ", string, " fret: ", fret);
        console.log("symbolString: ", symbolString, " symbolFret: ", symbolFret);
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
              textAreaLines[i] += "---"
            } else {
              textAreaLines[i] += "--"
            }
            break;
          case "b":
            symbolInserted = true;
            if (fret > 9) {
              textAreaLines[i] += "---"
            } else {
              textAreaLines[i] += "--"
            }
            break;
          case "p":
            symbolInserted = true;
            if (fret > 9) {
              textAreaLines[i] += "---"
            } else {
              textAreaLines[i] += "--"
            }
            break;
          case "/":
            symbolInserted = true;
            if (fret > 9) {
              textAreaLines[i] += "---"
            } else {
              textAreaLines[i] += "--"
            }
            break;
          case "\\":
            symbolInserted = true;
            if (fret > 9) {
              textAreaLines[i] += "---"
            } else {
              textAreaLines[i] += "--"
            }
            break;
          case "~":
            symbolInserted = true;
            if (fret > 9) {
              textAreaLines[i] += "---"
            } else {
              textAreaLines[i] += "--"
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
                  textAreaLines[i] += '---';
                  break;
                case 2:
                  textAreaLines[i] += '----';
                  break;
                case 3:
                  textAreaLines[i] += '-----';
                  break;
                case 4:
                  textAreaLines[i] += '------';
                  break;
                case 5:
                  textAreaLines[i] += '-------';
                  break;
              }
            } else {
              switch (selectedSpacing) {
                case 1:
                  textAreaLines[i] += '--';
                  break;
                case 2:
                  textAreaLines[i] += '---';
                  break;
                case 3:
                  textAreaLines[i] += '----';
                  break;
                case 4:
                  textAreaLines[i] += '-----';
                  break;
                case 5:
                  textAreaLines[i] += '------';
                  break;
                }
            }
          }
      } else {
        // First, handle any symbol
        switch(symbol) {
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
                textAreaLines[i] += fret + '-';
                break;
              case 2:
                textAreaLines[i] += fret + '--';
                break;
              case 3:
                  textAreaLines[i] += fret + '---';
                  break;
              case 4:
                textAreaLines[i] += fret + '----';
                break;
              case 5:
                textAreaLines[i] += fret + '-----';
                break;
            }
        }
      }
    }
    textArea.value = textAreaLines.join("\n");
  }

  // Add event listener for frets on fretboard
  for (let i = 0; i < frets.length; i++) {
    frets[i].addEventListener('click', fretClicked, false);
  }

  // Add event listeners for buttons
  let btns = document.getElementsByClassName("optionBtn");
  for (let i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function() {
      let current = document.getElementsByClassName("activeBtn");
      if (current.length > 0) {
        current[0].classList.remove("activeBtn");
      }
      this.classList.add("activeBtn");
    });
  }

  // Add event listener for clearing tab option button selection
  let clearBtn = document.getElementById("clearOptions");
  clearBtn.addEventListener("click", function() {
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
function addStave() {
    let tempmessage = document.getElementById("tempmessage");
    if (tempmessage != undefined) {
      tempmessage.parentNode.removeChild(tempmessage);
    }

    let tabcontent = document.getElementById("tabcontent");
    let staves = document.getElementsByClassName("stave");

    // Get selected stave type
    let staveType = document.getElementById("selectStaveType");
    let type = staveType.options[staveType.selectedIndex].value;

    const id = (staves.length) + 1
    const staveid = "stave" + id

    // Append a new stave - h3, textarea //
    let div = document.createElement("div");
    div.setAttribute("id", id);
    div.setAttribute("class", "stave");
    tabcontent.append(div);

    let h3 = document.createElement("h3");
    h3.innerHTML = "Stave " + id + ": " + type;
    h3.setAttribute("id",id + type)
    div.append(h3);

    let textarea = document.createElement("textarea");
    textarea.setAttribute("id", staveid);
    textarea.setAttribute("name", "stave");
    textarea.setAttribute("rows", "6");
    textarea.setAttribute("cols", "100");
    textarea.setAttribute("wrap", "off");

    let textAppend = "";
    // get tuning from select dropdowns
    let str1 = document.getElementById("tuningDropdown1");
    let str2 = document.getElementById("tuningDropdown2");
    let str3 = document.getElementById("tuningDropdown3");
    let str4 = document.getElementById("tuningDropdown4");
    let str5 = document.getElementById("tuningDropdown5");
    let str6 = document.getElementById("tuningDropdown6");

    let str1val = str1.textContent;

    textAppend +=
      str1.value + " |--\n" +
      str2.value + " |--\n" +
      str3.value + " |--\n" +
      str4.value + " |--\n" +
      str5.value + " |--\n" +
      str5.value + " |--";

    textarea.value = textAppend;

    div.append(textarea);

    // Add new stave to dropdown option box //
    let staveDropdown = document.getElementById("selectStave");
    let staveOption = document.createElement("option");
    staveOption.value = id;
    staveOption.innerHTML = "Stave " + id;

    staveDropdown.append(staveOption);
    staveDropdown.value = id;

    // document.getElementById("tuningDropdown1").disabled = true;
    str1.disabled = true;
    str2.disabled = true;
    str3.disabled = true;
    str4.disabled = true;
    str5.disabled = true;
    str6.disabled = true;
}



// ----------------------------------------------------------------------------------------------- //
// Function to delete the selected stave --------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
function deleteStave() {
  let selectedStaveMenu = document.getElementById("selectStave");

  // If no staves yet created, output error message
  if ((selectedStaveMenu.options).length <= 0) {
    alert("No Stave selected");
    return;
  }
  let selectedStave = selectedStaveMenu.options[selectedStaveMenu.selectedIndex].value; // Outputs Int
  console.log(selectedStave);
  // Function to delete an individual stave
  // Search for child with id of selected, and remove child
  if(confirm('Are you sure you want to delete Stave ' + selectedStave + '?')) {
    console.log("chose yes");
    // Selects are removes Stave 'div' element
    let textarea = document.getElementById(selectedStave);
    textarea.parentNode.removeChild(textarea);

    // Remove Stave from dropdown menu
    let staveDropdown = document.getElementById("selectStave");
    staveDropdown.remove(staveDropdown.selectedIndex);
  }

  if ((selectedStaveMenu.options).length <= 0) {
    // enable tuning dropdown lists if no staves are left.
    document.getElementById("tuningDropdown1").disabled = false;
    document.getElementById("tuningDropdown2").disabled = false;
    document.getElementById("tuningDropdown3").disabled = false;
    document.getElementById("tuningDropdown4").disabled = false;
    document.getElementById("tuningDropdown5").disabled = false;
    document.getElementById("tuningDropdown6").disabled = false;
  }
}



// ----------------------------------------------------------------------------------------------- //
// Function to clear the form of all staves ------------------------------------------------------ //
// ----------------------------------------------------------------------------------------------- //
function clearAllStaves() {
  let tabcontent = document.getElementById("tabcontent");
  let allStaves = tabcontent.childNodes;
  if (allStaves.length >= 1) {
    if (confirm('Are you sure you want to reset all staves?')) {
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
      tempmessage.innerHTML = "No content... Please create a stave with the button above"
      tempmessage.setAttribute("id", "tempmessage");
      tabcontent.append(tempmessage);
    } else {
      // Do nothing
      return;
    }
  } else {
    alert("No staves created!");
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
  if ((selectedStaveMenu.options).length <= 0) {
    alert("Please create a stave to edit!");
    return;
  }
  let selectedStave = selectedStaveMenu.options[selectedStaveMenu.selectedIndex].value;
  let staveid = "stave" + selectedStave;

  // Variable for rows in selected text area
  let textArea = document.getElementById(staveid);
  let textAreaLines = textArea.value.split("\n");
  let insert = '-'

  for (let i = 0; i < textAreaLines.length; i++) {
    textAreaLines[i] += insert.repeat(amount);
  }
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



// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ---------------------------- CHORD CREATION AND SELECTION FUNCTIONS --------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //



// List of presaved chords to be used in selectChord function:
const chordList = [
  { "id": 0, "chord": "A", "frets": "0--/2--/2--/2--/0--/x--"},
  { "id": 1, "chord": "C", "frets": "0--/1--/0--/2--/3--/x--"},
  { "id": 2, "chord": "D", "frets": "2--/1--/2--/0--/x--/x--"},
  { "id": 3, "chord": "E", "frets": "0--/0--/1--/2--/2--/0--"},
  { "id": 4, "chord": "G", "frets": "3--/0--/0--/0--/2--/3--"},
  { "id": 5, "chord": "Am", "frets": "0--/1--/2--/2--/0--/x--"},
  { "id": 6, "chord": "Em", "frets": "0--/0--/0--/2--/2--/0--"}
];

// ----------------------------------------------------------------------------------------------- //
// Function to get a presaved chord from chordList array ----------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
function selectChord() {
  let selectedStaveMenu = document.getElementById("selectStave");
  let selectedChordMenu = document.getElementById("selectChord")
  let selectedChord = selectedChordMenu.options[selectedChordMenu.selectedIndex].value;

  if ((selectedStaveMenu.options).length <= 0) {
    alert("No stave created!");
    return;
  }

  let frets;
  for (let i = 0; i < chordList.length; i++) {
    if (chordList[i].chord == selectedChord) {
      frets = chordList[i].frets;
    }
  }

  let selectedStave = selectedStaveMenu.options[selectedStaveMenu.selectedIndex].value; // Outputs int id of stave
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
        textAreaLines[i] += (chordLines[i] + '-');
        break;
      case 4:
        textAreaLines[i] += (chordLines[i] + '--');
        break;
      case 5:
      textAreaLines[i] += (chordLines[i] + '---');
      break;
    }
  }
  textArea.value = textAreaLines.join("\n");
}



// ----------------------------------------------------------------------------------------------- //
// Function to get a saved chord from the database ----------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function selectMyChord() {
  let selectedStaveMenu = document.getElementById("selectStave");
  let selectedChordMenu = document.getElementById("selectMyChord");
  let selectedChord = selectedChordMenu.options[selectedChordMenu.selectedIndex].value;
  console.log("SELECTED MYCHORD: " + selectedChord); // prints chord selected by user

  if ((selectedStaveMenu.options).length <= 0) {
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
  let selectedStave = selectedStaveMenu.options[selectedStaveMenu.selectedIndex].value; // Outputs int id of stave
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
        textAreaLines[i] += (chordLines[i] + '-');
        break;
      case 4:
        textAreaLines[i] += (chordLines[i] + '--');
        break;
      case 5:
      textAreaLines[i] += (chordLines[i] + '---');
      break;
    }
  }
  textArea.value = textAreaLines.join("\n");
}


// ----------------------------------------------------------------------------------------------- //
// Function to alter chord fretboard based on starting position of chord ------------------------- //
// ----------------------------------------------------------------------------------------------- //
function changeStartPos() {
  let val = parseInt(document.getElementById("startPos").value);
  let legendText = document.getElementById("fretMiniLegend").getElementsByTagName('div');

  // Change the content of the last 5 out of 7 values in the legend row
  for (let i = 0; i < legendText.length; i++) {
    if (legendText[i].innerHTML >= 0) {
      let newVal = (i - 2) + val;
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
  let chordFretClicked = function() {
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
       let stringRow = document.getElementById("miniFirstRow").getElementsByTagName("div");
       for (let i = 0; i < stringRow.length; i++) {
         stringRow[i].classList.remove("fret2Selected");
       }
       this.classList.add("fret2Selected");
     } else if (string == 1) {
       let stringRow = document.getElementById("miniSecondRow").getElementsByTagName("div");
       for (let i = 0; i < stringRow.length; i++) {
         stringRow[i].classList.remove("fret2Selected");
       }
       this.classList.add("fret2Selected");
     } else if (string == 2) {
       let stringRow = document.getElementById("miniThirdRow").getElementsByTagName("div");
       for (let i = 0; i < stringRow.length; i++) {
         stringRow[i].classList.remove("fret2Selected");
       }
       this.classList.add("fret2Selected");
     } else if (string == 3) {
       let stringRow = document.getElementById("miniFourthRow").getElementsByTagName("div");
       for (let i = 0; i < stringRow.length; i++) {
         stringRow[i].classList.remove("fret2Selected");
       }
       this.classList.add("fret2Selected");
     } else if (string == 4) {
       let stringRow = document.getElementById("miniFifthRow").getElementsByTagName("div");
       for (let i = 0; i < stringRow.length; i++) {
         stringRow[i].classList.remove("fret2Selected");
       }
       this.classList.add("fret2Selected");
     } else {
       let stringRow = document.getElementById("miniSixthRow").getElementsByTagName("div");
       for (let i = 0; i < stringRow.length; i++) {
         stringRow[i].classList.remove("fret2Selected");
       }
       this.classList.add("fret2Selected");
     }
  }

  // Add event listener for "clear" button
  let clearBtn = document.getElementById("clearChord");
  clearChord.addEventListener("click", function() {
    // Clear start position input and reset fretboard legend values
    document.getElementById("startPos").value = 0;
    let legendText = document.getElementById("fretMiniLegend").getElementsByTagName('div');
    for (let i = 0; i < legendText.length; i++) {
      if (legendText[i].innerHTML >= 0) {
        legendText[i].innerHTML = (i - 2);
      }
    }
    // Clear chord name input
    document.getElementById("chName").value = "";
    // Clear fretboard selections
    let frets = document.querySelectorAll('.fret2.fret2Selected');
    for (let i = 0; i < frets.length; i++) {
      frets[i].classList.remove('fret2Selected');
    }
  });

  // Adds event listener for each fret on the mini fretboard
  for (let i = 0; i < frets.length; i++) {
    frets[i].addEventListener('click', chordFretClicked, false);
  }
  refreshSavedDropdown();
}



// ----------------------------------------------------------------------------------------------- //
// Function to create a chord from the mini fretboard -------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function createChord() {
  let chordTab = "";

  // first, check if all rows have a selected value, if not, send alert and return
  let stringRow0Selected = document.getElementById("miniFirstRow").getElementsByClassName("fret2Selected")[0];
  let stringRow1Selected = document.getElementById("miniSecondRow").getElementsByClassName("fret2Selected")[0];
  let stringRow2Selected = document.getElementById("miniThirdRow").getElementsByClassName("fret2Selected")[0];
  let stringRow3Selected = document.getElementById("miniFourthRow").getElementsByClassName("fret2Selected")[0];
  let stringRow4Selected = document.getElementById("miniFifthRow").getElementsByClassName("fret2Selected")[0];
  let stringRow5Selected = document.getElementById("miniSixthRow").getElementsByClassName("fret2Selected")[0];

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
        let string0fret = parseInt(stringRow0Selected.getAttribute("data-fret")) + startPos;
        chordTab += string0fret + "--/"
      } else {
        chordTab += "x--/"
      }

      if (stringRow1Selected.getAttribute("data-fret") > -1) {
        let string1fret = parseInt(stringRow1Selected.getAttribute("data-fret")) + startPos;
        chordTab += string1fret + "--/"
      } else {
        chordTab += "x--/"
      }

      if (stringRow2Selected.getAttribute("data-fret") > -1) {
        let string2fret = parseInt(stringRow2Selected.getAttribute("data-fret")) + startPos;
        chordTab += string2fret + "--/"
      } else {
        chordTab += "x--/"
      }

      if (stringRow3Selected.getAttribute("data-fret") > -1) {
        let string3fret = parseInt(stringRow3Selected.getAttribute("data-fret")) + startPos;
        chordTab += string3fret + "--/"
      } else {
        chordTab += "x--/"
      }

      if (stringRow4Selected.getAttribute("data-fret") > -1) {
        let string4fret = parseInt(stringRow4Selected.getAttribute("data-fret")) + startPos;
        chordTab += string4fret + "--/"
      } else {
        chordTab += "x--/"
      }

      if (stringRow5Selected.getAttribute("data-fret") > -1) {
        let string5fret = parseInt(stringRow5Selected.getAttribute("data-fret")) + startPos;
        chordTab += string5fret + "--/"
      } else {
        chordTab += "x--/"
      }

      // chord tab succesfully created
      console.log(chordTab)

      // now, get the tuning values from dropdown
      let tuning = [];
      let str1 = document.getElementById("tuningLabel1").textContent;
      let str2 = document.getElementById("tuningLabel2").textContent;
      let str3 = document.getElementById("tuningLabel3").textContent;
      let str4 = document.getElementById("tuningLabel4").textContent;
      let str5 = document.getElementById("tuningLabel5").textContent;
      let str6 = document.getElementById("tuningLabel6").textContent;
      tuning.push(str1, str2, str3, str4, str5, str6);

      console.log(tuning);


      // save chord to database!!!
      const token = localStorage.getItem("id_token");
      const fetchOptions = {
        credentials: 'same-origin',
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
      };

      let url = '/api/saveChord'
                + '?chord_name=' + encodeURIComponent(chName)
                + '&chord_frets=' + encodeURIComponent(chordTab)
                + '&chord_tuning=' + encodeURIComponent(tuning);
      console.log("attempting to fetch /api/savedChord");

      const response = await fetch(url, fetchOptions);
      if (!response.ok) {
        // handle the error
        console.log("fetch response for /api/saveChord has failed.");
        return;
      } else {
        console.log("successful /api/saveChord call!");

        alert("chord saved to database!");

        // Append chName to dropdown
        let chordDropdown = document.getElementById("selectMyChord");
        let newOption = document.createElement("option");
        newOption.text = chName;
        chordDropdown.add(newOption);

        // Clear start position input and reset fretboard legend values
        document.getElementById("startPos").value = 0;
        let legendText = document.getElementById("fretMiniLegend").getElementsByTagName('div');
        for (let i = 0; i < legendText.length; i++) {
          if (legendText[i].innerHTML >= 0) {
            legendText[i].innerHTML = (i - 2);
          }
        }

        // Clear chord name input
        document.getElementById("chName").value = "";

        // Clear fretboard selections
        let frets = document.querySelectorAll('.fret2.fret2Selected');
        for (let i = 0; i < frets.length; i++) {
          frets[i].classList.remove('fret2Selected');
        }

      }
    }
  }
}



// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ------------------------------------- VIEW TABS FUNCTIONS ------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// Code for the 'viewtabs.html' form
















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
    credentials: 'same-origin',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token },
  };

  let url = '/api/getSavedChords'
  console.log("attempting to fetch /api/getSavedChords");

  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    // handle the error
    console.log("fetch response for /api/getSavedChords has failed.");
    return;
  }
  console.log("successful /api/getSavedChords call");

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
// Generic function to change forms -------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
async function getPage(apiLink) {
  const token = localStorage.getItem("id_token");
  const fetchOptions = {
    credentials: 'same-origin',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token },
  };
  const response = await fetch(apiLink, fetchOptions);
  if (!response.ok) {
    console.log("fetch response for " + apiLink + 'has failed.');
    return;
  }
  console.log('fetch response for ' + apiLink + ' successful!');
  let innerhtml = await response.text();
  document.documentElement.innerHTML = innerhtml;
}
