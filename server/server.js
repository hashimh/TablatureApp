'use strict';

const express = require('express');
const app = express();
const path = require('path');

app.use('/', (req, res, next) => { console.log(new Date(), req.method, req.url); next(); });
app.use('/', express.static('../webpages'));


//app.get('/', function(req, res) {
//  res.sendFile(path.join(__dirname + '/../webpages/login.html'));
//});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
