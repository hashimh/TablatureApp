// A BIG ONE BOIS
'use strict';

async function signOut2 {
  // Sign out function at the top of the form
  await discardChanges();

  let apiLink = '/api/logout';
  await getPage (apiLink);
  window.location.reload();

  localStorage.removeItem("id_token");
}































// ---------------------------------------------------------------------------------------------------------------------------------------------- //
// ---------------------------------------------------------------------------------------------------------------------------------------------- //
// ---------------------------------------------------------------------------------------------------------------------------------------------- //
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
  // ---------------------------------------------------------------------------------------------------------------------------------------------- //
  // ---------------------------------------------------------------------------------------------------------------------------------------------- //
  // ---------------------------------------------------------------------------------------------------------------------------------------------- //
