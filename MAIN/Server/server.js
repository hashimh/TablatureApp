'use strict';

const express = require('express');
const app = express();
const port = 8080

app.get('/', (req, res) => res.send("Hello World!"));
app.use('/', (req, res, next) => { console.log(new Date(), req.method, req.url); next(); });

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
