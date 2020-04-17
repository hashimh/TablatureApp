"use strict";

const fs = require("fs");
const mongo = require("mongodb");
const path = require("path");
const ObjectId = require("mongodb").ObjectId;

// Create object, specify connection URL
const MongoClient = require("mongodb").MongoClient;
const url = process.env.MONGODB_URI || "mongodb://localhost:27017/";

// Initialise Tabify database in MongoDB
MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  const dbo = db.db("heroku_2k42nnmn");
  console.log("Connected to database");
});

process.on("unhandledRejection", console.error);

// ---------------------------------------------------------------------------------------------------------------------------------------------- //
// ---------------------------------------------------------------------------------------------------------------------------------------------- //
// ---------------------------------------------------------------------------------------------------------------------------------------------- //
// DATABASE FUNCTIONS

// Funtion to add user to database if not already on it.
function login(insertEmail, fnameIn, lnameIn) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    const dbo = db.db("heroku_2k42nnmn");

    // First, check the user doesn't exist in database
    dbo
      .collection("users")
      .find({ email: insertEmail })
      .toArray(function (err, res) {
        if (err) throw err;

        if (res.length < 1) {
          // Create collection "users" if it doesn't exist:
          dbo.createCollection("users", function (err, res) {
            if (err) throw err;
            console.log("collection 'users' created");
          });

          const userInfo = [
            { email: insertEmail, fname: fnameIn, lname: lnameIn },
          ];

          dbo.collection("users").insertMany(userInfo, function (err, res) {
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

function saveChord(chName, chFrets, chTuning, startPos, email) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    const dbo = db.db("heroku_2k42nnmn");

    // First, check chord name is not a duplicate
    dbo
      .collection("chords")
      .find({ chord_name: chName })
      .toArray(function (err, res) {
        if (err) throw err;

        if (res.length < 1) {
          // Create collection "chords" if it doesn't exist:
          dbo.createCollection("chords", function (err, res) {
            if (err) throw err;
            console.log("collection 'chords' created");
          });

          const chordInfo = [
            {
              email: email,
              chord_name: chName,
              chord_frets: chFrets,
              chord_tuning: chTuning,
              start_pos: startPos,
            },
          ];

          dbo.collection("chords").insertMany(chordInfo, function (err, res) {
            if (err) throw err;
            console.log(
              "inserted chord into database: ",
              chName,
              chFrets,
              startPos,
              " for user ",
              email
            );
            db.close();
          });
        } else {
          console.log(chName, " already exists in database");
        }
      });
  });
}

function updateChord(chName, chFrets, chTuning, chStart, email, chId) {
  let o_id = new ObjectId(chId);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    const dbo = db.db("heroku_2k42nnmn");

    dbo.collection("chords").updateOne(
      { _id: o_id },
      {
        $set: {
          chord_name: chName,
          chord_frets: chFrets,
          chord_tuning: chTuning,
          start_pos: chStart,
        },
      },
      { upsert: true }
    );
    db.close();
  });
}

function saveTab(email, song, artist, genre, types, staves) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    const dbo = db.db("heroku_2k42nnmn");

    // Create collection "tabs" if it doesn't exist:
    dbo.createCollection("tabs", function (err, res) {
      if (err) throw err;
      console.log("collection 'tabs' created");
    });

    const tabInfo = [
      {
        email: email,
        song_name: song,
        artist_name: artist,
        genre: genre,
        stave_types: types,
        stave_content: staves,
      },
    ];

    dbo.collection("tabs").insertMany(tabInfo, function (err, res) {
      if (err) throw err;
      console.log("inserted tab into database!");
      db.close();
    });
  });
}

function updateTab(id, email, song, artist, genre, types, staves) {
  let o_id = new ObjectId(id);
  console.log(o_id);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    const dbo = db.db("heroku_2k42nnmn");

    dbo.collection("tabs").updateOne(
      { _id: o_id },
      {
        $set: {
          song_name: song,
          artist_name: artist,
          genre: genre,
          stave_types: types,
          stave_content: staves,
        },
      },
      { upsert: true }
    );
    db.close();
  });
}

function deleteTab(id) {
  let o_id = new ObjectId(id);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    const dbo = db.db("heroku_2k42nnmn");

    dbo.collection("tabs").remove({ _id: o_id });
    db.close();
  });
}

function deleteChord(id) {
  let o_id = new ObjectId(id);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    const dbo = db.db("heroku_2k42nnmn");

    dbo.collection("chords").remove({ _id: o_id });
    db.close();
  });
}

let getSavedChords = function (emailIn, cb) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    const dbo = db.db("heroku_2k42nnmn");
    dbo.collection("chords").find({ email: emailIn }).toArray(cb);
    db.close();
  });
};

let getTabsMetadata = function (cb) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    const dbo = db.db("heroku_2k42nnmn");
    dbo
      .collection("tabs")
      .find(
        {},
        {
          projection: {
            _id: 1,
            song_name: 1,
            artist_name: 1,
            genre: 1,
            email: 1,
          },
        }
      )
      .toArray(cb);
    db.close();
  });
};

let getMyTabsMetadata = function (emailIn, cb) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    const dbo = db.db("heroku_2k42nnmn");
    dbo
      .collection("tabs")
      .find(
        { email: emailIn },
        {
          projection: {
            _id: 1,
            song_name: 1,
            artist_name: 1,
            genre: 1,
            email: 1,
          },
        }
      )
      .toArray(cb);
    db.close();
  });
};

let getOtherTabsMetadata = function (emailIn, cb) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    const dbo = db.db("heroku_2k42nnmn");
    dbo
      .collection("tabs")
      .find(
        { email: { $ne: emailIn } },
        {
          projection: {
            _id: 1,
            song_name: 1,
            artist_name: 1,
            genre: 1,
            email: 1,
          },
        }
      )
      .toArray(cb);
    db.close();
  });
};

let getTabContent = function (id, cb) {
  let o_id = new ObjectId(id);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    const dbo = db.db("heroku_2k42nnmn");
    dbo.collection("tabs").find({ _id: o_id }).toArray(cb);
    db.close();
  });
};

// MODULE EXPORTATION
module.exports.login = login;
module.exports.saveChord = saveChord;
module.exports.saveTab = saveTab;
module.exports.updateTab = updateTab;
module.exports.updateChord = updateChord;

module.exports.getSavedChords = getSavedChords;
module.exports.getTabsMetadata = getTabsMetadata;
module.exports.getMyTabsMetadata = getMyTabsMetadata;
module.exports.getOtherTabsMetadata = getOtherTabsMetadata;
module.exports.getTabContent = getTabContent;

module.exports.deleteTab = deleteTab;
module.exports.deleteChord = deleteChord;
