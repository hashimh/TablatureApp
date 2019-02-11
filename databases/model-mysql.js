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

async function releaseConnection(connection) {
  await connection.end();
}

process.on('unhandledRejection', console.error);





// DATABASE FUNCTIONS
async function getPresaved (chName) {
  const sql = await init();

  const query = sql.format('SELECT chord_frets FROM presaved WHERE chord_name = ?', chName);
  const frets = await sql.query(query);
  console.log("SQL QUERY RESULT:", frets[0]);

  return frets[0];


}

// MODULE EXPORTATION
module.exports.getPresaved = getPresaved;
