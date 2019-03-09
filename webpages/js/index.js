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

  // Funtion to insert default text into tab box
  fretBoard();

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
