'use strict';

const express = require('express');
const app = express();
const path = require('path');
const GoogleAuth = require('simple-google-openid');

const webpagesPath = path.join(__dirname, '../webpages');

const db = require('../database/model-mysql');
const config = require('../database/config');

app.use('/', (req, res, next) => { console.log(new Date(), req.method, req.url); next(); });
app.use('/', express.static(webpagesPath));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../webpages/' + 'login.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

app.use(GoogleAuth('566769051678-k1mpvtssd5jin7p6bekdtv7g1r23qav4.apps.googleusercontent.com'));
app.use('/api', GoogleAuth.guardMiddleware());

app.get('/api/login', login);
app.get('/api/logout', logout);
app.get('/api/createTabBtn', createTabBtn);

// -------------------------------------------------- //
// ---------------- SERVER FUNCTIONS ---------------- //
// -------------------------------------------------- //

async function login (req, res) {
  // Sends menu.html once logged in.
  res.sendFile('menu.html', {root: '../webpages'});
}

function logout (req, res) {
  // Sends login page HTML on sign out.
  res.sendFile('login.html', {root: '../webpages'});
}

async function createTabBtn (req, res) {
  // Sends main.html on button click.
  res.sendFile('main.html', {root: '../webpages'});
}

(function () {
  const CHECK_DELAY = 2000;
  let lastTime = Date.now();

  setInterval(() => {
    const currentTime = Date.now();
    if (currentTime > (lastTime + CHECK_DELAY*2)) {  // ignore small delays
      gapi.auth2.getAuthInstance().currentUser.get().reloadAuthResponse();
    }
    lastTime = currentTime;
  }, CHECK_DELAY);
}());
