'use strict';

const fs = require('fs');
const mysql = require('mysql2/promise');

const path = require('path');

const config = require('./config');

// CREATING A PROMISE CONNECTION TO DATABASE //
let sqlPromise = null;

// ---------------------------------------------------------------------------------------------------------------------------------------------- //
// ---------------------------------------------------------------------------------------------------------------------------------------------- //
// ---------------------------------------------------------------------------------------------------------------------------------------------- //
async function init() {
  if (sqlPromise) return sqlPromise;

  sqlPromise = newConnection();
  return sqlPromise;
}

async function newConnection() {
  const sql = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "chords",
    multipleStatements: true
  });

  // handle unexpected errors by just logging them
  sql.on('error', (err) => {
    console.error(err);
    sql.end();
  });
  return sql;
}
