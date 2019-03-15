'use strict';

const express = require('express');
const app = express();
const path = require('path');
const GoogleAuth = require('simple-google-openid');

const webpagesPath = path.join(__dirname, '../webpages');

const db = require('../databases/model-mongodb');

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
// app.get('/api/getPresaved', getPresaved);
app.get('/api/getSavedChords', getSavedChords);

// app.post('/api/fillPresaved', fillPresaved);
app.post('/api/checkUser', checkUser);
app.post('/api/saveChord', saveChord);


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

async function getSavedChords(req, res) {
  // Calls database function to get user's presaved chords
  await db.getSavedChords(req.user.emails[0].value, function(err, data) {
    if (err) {
      throw err;
      return res(err);
    } else {
      return res.json(data);
    }
  });
}


async function checkUser(req, res) {
  let fullName = req.user.displayName;
  let firstName = fullName.split(' ').slice(0, -1).join(' ');
  let lastName = fullName.split(' ').slice(-1).join(' ');

  const retval = await db.login(req.user.emails[0].value, firstName, lastName);
  res.json(retval);
}

async function saveChord(req, res) {
  // Two parameters to be saved in database
  console.log("chord name: ", req.query.chord_name);
  console.log("chord frets: ", req.query.chord_frets);
  console.log("requesting user email: ", req.user.emails[0].value);

  const retval = await db.saveChord(req.query.chord_name, req.query.chord_frets, req.user.emails[0].value);
  res.json(retval);
}
// function to fill presaved chords into database table - only if table entries do not exist
// async function fillPresaved (req, res) {
//   try {
//     // If no entries exist in the presaved table:
//     // Calls database function to fill table
//     await db.fillPresaved();
//   } catch (e) {
//     error (res, e);
//   }
// }

// async function getPresaved(req, res) {
//   // Calls database function to get presaved chord
//   await db.getPresaved(req.query.chord_name, function(err, data) {
//     if (err) {
//       throw err;
//       return res(err);
//     } else {
//       return res.json(data);
//     }
//   });
// }


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

function error(res, msg) {
  // Function to send errors.
  res.sendStatus(500);
  console.error(msg);
}
