'use strict';

const express     = require('express');
const app         = express();
const path        = require('path');
const GoogleAuth  = require('simple-google-openid');

app.use('/', (req, res, next) => { console.log(new Date(), req.method, req.url); next(); });
// app.use('/', express.static('../webpages'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/../webpages/login.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

app.use(GoogleAuth('566769051678-k1mpvtssd5jin7p6bekdtv7g1r23qav4.apps.googleusercontent.com'));
app.use('/api', GoogleAuth.guardMiddleware());

app.get('/api/hello', hello);

// SERVER FUNCTIONS //

function hello(req, res) {
  res.send('Hello ' + (req.user.displayName || 'anonymous') + '!');
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
