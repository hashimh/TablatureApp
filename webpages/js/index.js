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

  console.log(googleUser);

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
  fillTabBox();
  fretBoard();

  // Code for clicking a fret


}

async function fillTabBox() {
  // Key at the top of the box
  let textAppend = "";
  let textArea = document.getElementById("tabOutput");
  textAppend += "Stave 1: \n\n"
  textAppend += "E |-- \nB |-- \nG |-- \nD |-- \nA |-- \nE |--"
  textArea.value = textAppend;
  // when new stave clicked, need to do the same shit
}

async function fretBoard() {
  let frets = document.getElementsByClassName("fret");

  let fretClicked = function() {
    let string = this.getAttribute("data-string");
    let fret = this.getAttribute("data-fret");
    console.log("fret clicked", "fret = " + fret, "string = " + string);

    let textAppend = "";
    let textArea = document.getElementById("tabOutput");
    console.log("text area: ", textArea);

    // must append fret to the tab sheet!!
    if (string == 5) {
      // add to low E
    } else if (string == 4) {
      // add to A
    } else if (string == 3) {
      // add to D
    } else if (string == 2) {
      // add to G
    } else if (string == 1) {
      // add to B
    } else {
      // add to high E
    }

  }

  for (let i = 0; i < frets.length; i++) {
    frets[i].addEventListener('click', fretClicked, false);
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
