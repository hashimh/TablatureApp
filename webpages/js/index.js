'use strict';

function onSignIn(googleUser) {
  // Get the users ID Token, store in local storage to be used with interactions with the server (authentication).
  console.log("sign in function called");
  let auth2 = gapi.auth2.getAuthInstance();
  localStorage.setItem("id_token",auth2.currentUser.get().getAuthResponse().id_token);
  localStorage.setItem("googleUser",googleUser.getBasicProfile().getName());
  auth2.disconnect();
  // Once logged in, call function callServer().

  callServer(googleUser);
}

async function callServer(googleUser) {
  console.log("call server function called");
  let apiLink = '/api/login';
  await getPage(apiLink);

  // Checks if user is in database, if not then user is added.
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
    // handle the error
    console.log("fetch response for /api/checkuser has failed.");
    return;
  }

  displayMenu(googleUser);

  // ---------------------------------------------------------------
  // NEED A FUNCTION TO ADD USER TO DATABASE IF NOT EXISTING ALREADY
  // ---------------------------------------------------------------

}

async function displayMenu(googleUser) {
  // Get name for heading
  const profile = googleUser.getBasicProfile();
  const el = document.getElementById('greeting');
  el.textContent = 'Welcome, ' + profile.getName() + '...' + 'What would you like to do today?';
}

async function signOut() {
  // Call server function 'logout'
  let apiLink = '/api/logout';
  await getPage(apiLink);

  window.location.reload();

  // Removes ID Token from local storage, ensures Google account logs out properly.
  localStorage.removeItem("id_token");
  localStorage.removeItem("googleUser");
}

async function createTabBtn() {
  // Call server function 'createTabBtn'
  let apiLink = '/api/createTabBtn';
  await getPage(apiLink);

  populateMain();
}

// -----------------------------------------------------------------------------
// ---------- CODE FOR MAIN.HTML -----------------------------------------------
// -----------------------------------------------------------------------------

async function populateMain() {
  console.log("populating main...")

  // Get name for heading
  const el = document.getElementById('greeting');
  el.textContent = " - Hello " + localStorage.getItem("googleUser");

  fretBoard();
  chordFretboard();
  // getMyChords();

}





async function fretBoard() {
  let frets = document.getElementsByClassName("fret");

  let fretClicked = function() {
    let string = this.getAttribute("data-string");
    let fret = this.getAttribute("data-fret");

    let selectedStaveMenu = document.getElementById("selectStave");

    // If no staves yet created, output error message
    if ((selectedStaveMenu.options).length <= 0) {
      alert("Please create a stave to edit!");
      return;
    }

    let selectedStave = selectedStaveMenu.options[selectedStaveMenu.selectedIndex].value;
    let staveid = "stave" + selectedStave;

    let textArea = document.getElementById(staveid);

    // Variable for line number
    let textAreaLines = textArea.value.split("\n");

    // For each line in the textarea (line 0 to line 5)
    // concatenate (+) either "--" or "stringnumber", depending on strng value
    for (let i = 0; i < textAreaLines.length; i++) {
      if (i != string) {
        if (fret > 9) {
          textAreaLines[i] += '----'
        } else {
          textAreaLines[i] += '---';
        }
      } else {
        textAreaLines[i] += fret + '--';
      }
    }
    textArea.value = textAreaLines.join("\n");

  }

  for (let i = 0; i < frets.length; i++) {
    frets[i].addEventListener('click', fretClicked, false);
  }

  // // Now fill in presaved table:
  // const token = localStorage.getItem("id_token");
  // const fetchOptions = {
  //   credentials: 'same-origin',
  //   method: 'POST',
  //   headers: { 'Authorization': 'Bearer ' + token },
  // };
  //
  // let url = '/api/fillPresaved';
  // console.log("attempting to fetch /api/fillPresaved");
  //
  // const response = await fetch(url, fetchOptions);
  // if (!response.ok) {
  //   // handle the error
  //   console.log("fetch response for /api/fillPresaved has failed.");
  //   return;
  // }
  // console.log("successful /api/fillPresaved call! Check database!");
}





// FUNCTION TO ADD A STAVE //
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

    // CODE FOR THE STAVE DIV //
    const id = (staves.length) + 1
    const staveid = "stave" + id

    // Append a new stave - h3, textarea //
    let div = document.createElement("div");
    div.setAttribute("id", id); // ------------------------------------------------------------------------------------
    div.setAttribute("class", "stave");
    tabcontent.append(div);

    let h3 = document.createElement("h3");
    h3.innerHTML = "Stave " + id + ": " + type;
    div.append(h3);

    let textarea = document.createElement("textarea");
    textarea.setAttribute("id", staveid);
    textarea.setAttribute("name", "stave");
    textarea.setAttribute("rows", "6");
    textarea.setAttribute("cols", "100");
    textarea.setAttribute("wrap", "off");

    let textAppend = "";
    textAppend += "E |--\nB |--\nG |--\nD |--\nA |--\nE |--";
    textarea.value = textAppend;

    div.append(textarea);

    // Add new stave to dropdown option box //
    let staveDropdown = document.getElementById("selectStave");
    let staveOption = document.createElement("option");
    staveOption.value = id;
    staveOption.innerHTML = "Stave " + id;

    staveDropdown.append(staveOption);
    staveDropdown.value = id;
}





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
}



// -----------------------------------------------------------------------------
// ---------- CODE FOR CHORD BOX -----------------------------------------------
// -----------------------------------------------------------------------------


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

// function to get a presaved chord from the library:
function selectChord() {
  let selectedStaveMenu = document.getElementById("selectStave");
  let selectedChordMenu = document.getElementById("selectChord")
  let selectedChord = selectedChordMenu.options[selectedChordMenu.selectedIndex].value;
  console.log("SELECTED CHORD: " + selectedChord); // prints 'A'

  if ((selectedStaveMenu.options).length <= 0) {
    alert("No stave created!");
    return;
  }

  let frets;
  for (let i = 0; i < chordList.length; i++) {
    if (chordList[i].chord == selectedChord) {
      frets = chordList[i].frets;
      console.log(frets);
    }
  }

  let selectedStave = selectedStaveMenu.options[selectedStaveMenu.selectedIndex].value; // Outputs int id of stave
  let textArea = document.getElementById("stave" + selectedStave);

  let chordLines = frets.split("/");
  let textAreaLines = textArea.value.split("\n");

  for (let i = 0; i < textAreaLines.length; i++) {
    textAreaLines[i] += chordLines[i];
  }
  textArea.value = textAreaLines.join("\n");

}

// Event listener for change of chord starting position, change legend row of table
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

async function chordFretboard() {
  let frets = document.getElementsByClassName("fret2");

  // Function called by "onclick" event of frets on mini fretboard
  let chordFretClicked = function() {
    let string = this.getAttribute("data-string");
    let fret = this.getAttribute("data-fret");
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

  // Adds event listener for each fret on the mini fretboard
  for (let i = 0; i < frets.length; i++) {
    frets[i].addEventListener('click', chordFretClicked, false);
  }

  refreshSavedDropdown();

}

  // when clicked, check if the row is empty
  // then add html marker (possibly finger number) onto table
  // create tab format "--0/--0"...


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

      // save chord to database!!!
      const token = localStorage.getItem("id_token");
      const fetchOptions = {
        credentials: 'same-origin',
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
      };

      let url = '/api/saveChord' + '?chord_name=' + encodeURIComponent(chName) + '&chord_frets=' + encodeURIComponent(chordTab);
      console.log("attempting to fetch /api/savedChord");

      const response = await fetch(url, fetchOptions);
      if (!response.ok) {
        // handle the error
        console.log("fetch response for /api/saveChord has failed.");
        return;
      } else {
        console.log("successful /api/saveChord call!");

        // Append chName to dropdown
        let chordDropdown = document.getElementById("selectMyChord");
        let newOption = document.createElement("option");
        newOption.text = chName;
        chordDropdown.add(newOption);
      }
    }
  }
}



// Function to add selected chord
// async function selectChordOld() {
//   // Check if a tab has been selected, via dropdown
//   let selectedStaveMenu = document.getElementById("selectStave");
//   let selectedChordMenu = document.getElementById("selectChord")
//   let selectedChord = selectedChordMenu.options[selectedChordMenu.selectedIndex].value;
//   console.log("SELECTED CHORD: " + selectedChord);
//
//   if ((selectedStaveMenu.options).length <= 0) {
//     alert("No stave created!");
//     return;
//   }
//
//
//   const token = localStorage.getItem("id_token");
//   const fetchOptions = {
//     credentials: 'same-origin',
//     method: 'GET',
//     headers: { 'Authorization': 'Bearer ' + token },
//   };
//
//   let url = '/api/getPresaved' + '?chord_name=' + encodeURIComponent(selectedChord);
//   console.log("attempting to fetch /api/getPresaved");
//
//   // call server function to GET table value from 'presaved', where name = selected chord
//   const response = await fetch(url, fetchOptions);
//   if (!response.ok) {
//     // handle the error
//     console.log("fetch response for /api/getPresaved has failed.");
//     return;
//   }
//   console.log("successful /api/getPresaved call!");
//   let chord = await response.json();
//
//   // Raw string to append to textArea
//   let chordString = chord[0].frets;
//
//   // Get textarea, append chord to tab
//   let selectedStave = selectedStaveMenu.options[selectedStaveMenu.selectedIndex].value; // Outputs int id of stave
//   let textArea = document.getElementById("stave" + selectedStave);
//
//   let chordLines = chordString.split("/");
//   let textAreaLines = textArea.value.split("\n");
//
//   for (let i = 0; i < textAreaLines.length; i++) {
//     textAreaLines[i] += chordLines[i];
//   }
//   textArea.value = textAreaLines.join("\n");
// }





function clearAllStaves() {
  let tabcontent = document.getElementById("tabcontent");
  let allStaves = tabcontent.childNodes;
  console.log(allStaves)
  if (allStaves.length >= 1) {
    if (confirm('Are you sure you want to reset all staves?')) {
      console.log("chose yes");
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
    } else {
      // Do nothing
      return;
    }
  } else {
    alert("No staves created!");
  }
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// ----------------------------- GENERIC FUNCTIONS -----------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// GENERIC FUNCTION TO GET CURRENT USERS CHORD INFORMATION FROM DATABASE
async function getMyChords() {
  // Function will select all names in saved chords with email = current user to display in dropdown menu.

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
  console.log("getMyChords(): ",chords);
  return chords;

}

// GENERIC FUNCTION USED TO LOAD 'MY CHORDS' DROPDOWN
async function refreshSavedDropdown() {
  let chordDropdown = document.getElementById("selectMyChord");
  let options = chordDropdown.getElementsByTagName("option");

  // First, clear the dropdown
  for (let i = options.length - 1; i >= 0; i--) {
    chordDropdown.options[i] = null;
  }

  // Fill in 'My Chords' dropdown:

  let chords = await getMyChords();
  console.log("Fill chordFretboard chords value: ", chords);

  for (let i = 0; i < chords.length; i++) {
    let option = document.createElement("option");
    option.text = chords[i].chord_name;
    chordDropdown.add(option);
  }
}

// GENERIC FUNCTION USED TO GET NEW HTML PAGES TO THE SERVER //
async function getPage(apiLink) {
  // This is a core function used when changing pages on this app.
  // It is sent an api link, and returns the HTML of the requested page.
  const token = localStorage.getItem("id_token");
  // These are the options sent with the API request.
  const fetchOptions = {
    credentials: 'same-origin',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token },
  };
  const response = await fetch(apiLink, fetchOptions);
  if (!response.ok) {
    // handle the error
    console.log("fetch response for " + apiLink + 'has failed.');
    return;
  }
  // TO-DO: History API
  console.log('fetch response for ' + apiLink + ' successful!');
  let innerhtml = await response.text();
  document.documentElement.innerHTML = innerhtml;
}
