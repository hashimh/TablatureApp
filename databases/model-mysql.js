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
// DATABASE CONNECTION FUNCTIONS
// initiates chord database
async function initChords() {
  if (sqlPromise) return sqlPromise;

  sqlPromise = newConnectionChords();
  return sqlPromise;
}

// creates connection to chord database
async function newConnectionChords() {
  const sql = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "chords",
    multipleStatements: true
  });

// initiates user database

  // handle unexpected errors by just logging them
  sql.on('error', (err) => {
    console.error(err);
    sql.end();
  });
  return sql;
}

// generic function to release connection from any database
async function releaseConnection(connection) {
  await connection.end();
}

process.on('unhandledRejection', console.error);

// ---------------------------------------------------------------------------------------------------------------------------------------------- //
// ---------------------------------------------------------------------------------------------------------------------------------------------- //
// ---------------------------------------------------------------------------------------------------------------------------------------------- //
// DATABASE FUNCTIONS
// Fills in 'presaved' table:
async function fillPresaved() {
  const sql = await initChords();

  // Array of presaved chord entries.
  const chordList = [
    [1, 'A', '0--/2--/2--/2--/0--/x--'],
    [2, 'C', '0--/1--/0--/2--/3--/x--'],
    [3, 'D', '2--/1--/2--/0--/x--/x--'],
    [4, 'E', '0--/0--/1--/2--/2--/0--'],
    [5, 'G', '3--/0--/0--/0--/2--/3--'],
    [6, 'Am', '0--/1--/2--/2--/0--/x--'],
    [7, 'Em', '0--/0--/0--/2--/2--/0--']
  ];

  // Check if the table is empty by attempting to select contents:
  const checkQuery = sql.format('SELECT * FROM presaved');
  const tableVals = await sql.query(checkQuery);

  if (tableVals.length > 0 ) {
    // Presaved table is already filled.
    return;
  } else {
    // Presaved table not filled, run insert query.
    const query = sql.format('INSERT INTO presaved (chord_id, chord_name, chord_frets) VALUES ?', [chordList]);
    await sql.query(query);
  }
}






async function getPresaved (chName) {
  const sql = await initChords();

  // SQL Query to get chord frets from database
  const query = sql.format('SELECT chord_frets FROM presaved WHERE chord_name = ?', chName);
  const frets = await sql.query(query);

  // Returns chord_name from presaved chords table for specified chord
  return frets[0];
}

// MODULE EXPORTATION
module.exports.fillPresaved = fillPresaved;
module.exports.getPresaved = getPresaved;
