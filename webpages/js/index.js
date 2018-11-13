'use strict';

function onSignIn(googleUser) {
  // Get the users ID Token, store in local storage to be used with interactions with the server (authentication).
  console.log("sign in function called");
  let auth2 = gapi.auth2.getAuthInstance();
  localStorage.setItem("id_token",auth2.currentUser.get().getAuthResponse().id_token);
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
