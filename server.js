'use strict';

const express = require('express');
const app = express();
const path = require('path');
const port = 8080

app.use('/', (req, res, next) => { console.log(new Date(), req.method, req.url); next(); });

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
