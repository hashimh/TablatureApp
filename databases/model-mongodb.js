'use strict';

const fs = require('fs');
const mongo = require('mongodb');
const path = require('path');

// Create object, specify connection URL
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

process.on('unhandledRejection', console.error);

// Initialise Tabify database in MongoDB
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  const dbo = db.db("Tabify");
  console.log("connected to database");
});

// ---------------------------------------------------------------------------------------------------------------------------------------------- //
// ---------------------------------------------------------------------------------------------------------------------------------------------- //
// ---------------------------------------------------------------------------------------------------------------------------------------------- //
// DATABASE FUNCTIONS

// Funtion to add user to database if not already on it.
function login (insertEmail, fnameIn, lnameIn) {

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    const dbo = db.db("Tabify");

    // First, check the user doesn't exist in database
    dbo.collection("users").find({email: insertEmail}).toArray(function(err, res) {
      if (err) throw err;

      if (res.length < 1) {
        // Create collection "users" if it doesn't exist:
        dbo.createCollection("users", function(err, res) {
          if (err) throw err;
          console.log("collection 'users' created");
        });

        const userInfo = [
          { email: insertEmail, fname: fnameIn, lname: lnameIn }
        ];

        dbo.collection("users").insertMany(userInfo, function(err, res) {
          if (err) throw err;
          console.log("inserted user into database: ", fnameIn);
          db.close();
        });
      } else {
        console.log("already exists: ", fnameIn);
      }
    });
  });
}

function saveChord (chName, chFrets, chTuning, email) {

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    const dbo = db.db("Tabify");

    // First, check chord name is not a duplicate
    dbo.collection("chords").find({chord_name: chName}).toArray(function(err, res) {
      if (err) throw err;

      if (res.length < 1) {
        // Create collection "chords" if it doesn't exist:
        dbo.createCollection("chords", function(err, res) {
          if (err) throw err;
          console.log("collection 'chords' created");
        });

        const chordInfo = [
          { email: email, chord_name: chName, chord_frets: chFrets, chord_tuning: chTuning }
        ];

        dbo.collection("chords").insertMany(chordInfo, function(err, res) {
          if (err) throw err;
          console.log("inserted chord into database: ", chName, chFrets, " for user ", email);
          db.close();
        });
      } else {
        console.log(chName, " already exists in database")
      }
    });
  });
}

function saveTab (email, song, artist, genre, types, staves) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    const dbo = db.db("Tabify");

    // Create collection "tabs" if it doesn't exist:
    dbo.createCollection("tabs", function(err, res) {
      if (err) throw err;
      console.log("collection 'tabs' created");
    });

    const tabInfo = [
      { email: email, song_name: song, artist_name: artist, genre: genre, stave_types: types, stave_content: staves }
    ];

    dbo.collection("tabs").insertMany(tabInfo, function(err, res) {
      if (err) throw err;
      console.log("inserted tab into database!");
      db.close();
    });
  });
}

let getSavedChords = function(emailIn, cb) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    const dbo = db.db("Tabify");
    dbo.collection("chords").find({email: emailIn}).toArray(cb);
    db.close();
  });
}

let getTabsMetadata = function(cb) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    const dbo = db.db("Tabify");
    dbo.collection("tabs").find({}, { projection: { _id: 0, song_name: 1, artist_name: 1, genre: 1, email: 1}
    }).toArray(cb);
    db.close();
  });
}

let getMyTabsMetadata = function(emailIn, cb) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    const dbo = db.db("Tabify");
    dbo.collection("tabs").find( {email: emailIn}, { projection: { _id: 0, song_name: 1, artist_name: 1, genre: 1, email: 1}
    }).toArray(cb);
    db.close();
  });
}

let getOtherTabsMetadata = function(emailIn, cb) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    const dbo = db.db("Tabify");
    dbo.collection("tabs").find( {email: {$ne: emailIn}}, { projection: { _id: 0, song_name: 1, artist_name: 1, genre: 1, email: 1}
    }).toArray(cb);
    db.close();
  });
}

// Fills in 'presaved' table:
// function fillPresaved() {
//   MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     const dbo = db.db("Tabify");
//
//     // First, check it doesn't exist
//     dbo.collection("presaved").find({}).toArray(function(err, res) {
//       if (err) throw err;
//
//       if (res.length < 1) {
//         // Create collection 'Presaved' if it does not exist
//         dbo.createCollection("presaved", function(err, res) {
//           if (err) throw err;
//           console.log("collection 'presaved' created");
//         });
//
//         // Array of presaved chord entries.
//         const chordList = [
//           { id: 0, chord: 'A', frets: '0--/2--/2--/2--/0--/x--'},
//           { id: 1, chord: 'C', frets: '0--/1--/0--/2--/3--/x--'},
//           { id: 2, chord: 'D', frets: '2--/1--/2--/0--/x--/x--'},
//           { id: 3, chord: 'E', frets: '0--/0--/1--/2--/2--/0--'},
//           { id: 4, chord: 'G', frets: '3--/0--/0--/0--/2--/3--'},
//           { id: 5, chord: 'Am', frets: '0--/1--/2--/2--/0--/x--'},
//           { id: 6, chord: 'Em', frets: '0--/0--/0--/2--/2--/0--'}
//         ];
//
//         dbo.collection("presaved").insertMany(chordList, function(err, res) {
//           if (err) throw err;
//           console.log("number of presaved chords inserted: ", res.insertedCount);
//           db.close();
//         });
//       } else {
//         return;
//       }
//     });
//   });
// }

// let getPresaved = function(chName, cb) {
//   MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     const dbo = db.db("Tabify");
//     dbo.collection("presaved").find({chord: chName}, { projection: { _id: 0, id: 0, chord: 0}}).toArray(cb);
//   });
// }

// MODULE EXPORTATION
// module.exports.fillPresaved = fillPresaved;
// module.exports.getPresaved = getPresaved;
module.exports.login = login;
module.exports.saveChord = saveChord;
module.exports.getSavedChords = getSavedChords;
module.exports.saveTab = saveTab;
module.exports.getTabsMetadata = getTabsMetadata;
module.exports.getMyTabsMetadata = getMyTabsMetadata;
module.exports.getOtherTabsMetadata = getOtherTabsMetadata;
