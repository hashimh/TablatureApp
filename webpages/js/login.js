'use strict';

function onSignIn(googleUser) {
  // Get the users ID Token, store in local storage to be used with interactions with the server (authentication).
  let auth2 = gapi.auth2.getAuthInstance();
  localStorage.setItem("id_token",auth2.currentUser.get().getAuthResponse().id_token);
  auth2.disconnect();
  // Once logged in, call function callServer().
  callServer(googleUser);
}

async function callServer(googleUser) {
  let apiLink = '/api/login';
  await getPage(apiLink);

  console.log(googleUser);

  populateMain(googleUser);
}

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
