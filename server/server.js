"use strict";

require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const webpagesPath = path.join(__dirname, "../webpages");

const db = require("../databases/model-mongodb");

app.use("/", (req, res, next) => {
  console.log(new Date(), req.method, req.url);
  next();
});
app.use("/", express.static(webpagesPath));
app.use(express.static("../webpages/js/audio"));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../webpages/" + "home.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

app.get("/api/logout", logout);
app.get("/api/createTabBtn", createTabBtn);
app.get("/api/viewTabBtn", viewTabBtn);
app.get("/api/getSavedChords", authenticateToken, getSavedChords);
app.get("/api/getTabsMetadata", getTabsMetadata);
app.get("/api/getTabContent", getTabContent);

app.get("/api/login", login);
app.post("/api/register", register);

app.get("/api/checkusername", checkusername);
app.get("/api/checkemail", checkemail);

app.post("/api/saveChord", authenticateToken, saveChord);
app.post("/api/saveTab", authenticateToken, saveTab);
app.post("/api/updateTab", updateTab);
app.post("/api/deleteTab", deleteTab);
app.post("/api/updateChord", authenticateToken, updateChord);
app.post("/api/deleteChord", deleteChord);

// this middleware will be called when a user tries to save a tablature
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  // user is valid
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    // token exists but not valid
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// -------------------------------------------------- //
// ---------------- SERVER FUNCTIONS ---------------- //
// -------------------------------------------------- //
async function login(req, res) {
  console.log(req.query.username, req.query.password);

  await db.login(req.query.username, function (err, data) {
    if (err) throw err;

    console.log(data);

    if (data.length > 0) {
      // found user in the database, now compare passwords
      bcrypt.compare(req.query.password, data[0].password, (err, isMatch) => {
        if (err) throw err;

        if (isMatch) {
          console.log("passwords match");

          // now add some auth method for user, used in saving tabs
          const username = data[0].username;
          const user = { name: username };
          const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

          res.status(200).json({
            username: data[0].username,
            email: data[0].email,
            accessToken: accessToken,
          });
        } else {
          console.log("incorrect password");
          res.sendStatus(404);
        }
      });
    } else {
      console.log("user doesnt exist");
      res.sendStatus(404);
    }
  });
}

async function checkusername(req, res) {
  await db.checkusername(req.query.username, function (err, data) {
    if (err) throw err;

    if (data.length > 0) {
      return res.json({ result: true });
    } else {
      return res.json({ result: false });
    }
  });
}

async function checkemail(req, res) {
  await db.checkemail(req.query.email, function (err, data) {
    if (err) throw err;

    if (data.length > 0) {
      return res.json({ result: true });
    } else {
      return res.json({ result: false });
    }
  });
}

async function register(req, res) {
  // call mongodb function to register user

  try {
    // hash the password
    const hash = await bcrypt.hash(req.query.password, 10);
    req.query.password = hash;
  } catch (error) {
    throw err;
  }

  const retval = await db.register(
    req.query.username,
    req.query.password,
    req.query.email
  );
  return res.json(retval);
}

// async function checkUser(req, res) {
//   let fullName = req.user.displayName;
//   let firstName = fullName.split(" ").slice(0, -1).join(" ");
//   let lastName = fullName.split(" ").slice(-1).join(" ");

//   const retval = await db.login(req.user.emails[0].value, firstName, lastName);
//   res.json(retval);
// }

function logout(req, res) {
  // Sends login page HTML on sign out.
  res.sendFile("home.html", { root: "../webpages" });
}

async function createTabBtn(req, res) {
  // Sends main.html on button click.
  res.sendFile("main.html", { root: "./webpages" });
}

async function viewTabBtn(req, res) {
  // Sends viewtabs.html on button click.
  res.sendFile("viewtabs.html", { root: "./webpages" });
}

async function getSavedChords(req, res) {
  // Calls database function to get user's presaved chords
  await db.getSavedChords(req.user.name, function (err, data) {
    if (err) {
      throw err;
      return res(err);
    } else {
      return res.json(data);
    }
  });
}

async function getTabsMetadata(req, res) {
  // Calls database function to get all tablatures
  if (req.query.key == "all") {
    await db.getTabsMetadata(function (err, data) {
      if (err) {
        throw err;
        return res(err);
      } else {
        return res.json(data);
      }
    });
  } else if (req.query.key == "myTabs") {
    await db.getMyTabsMetadata(req.user.emails[0].value, function (err, data) {
      if (err) {
        throw err;
        return res(err);
      } else {
        return res.json(data);
      }
    });
  } else {
    await db.getOtherTabsMetadata(req.user.emails[0].value, function (
      err,
      data
    ) {
      if (err) {
        throw err;
        return res(err);
      } else {
        return res.json(data);
      }
    });
  }
}

async function getTabContent(req, res) {
  // Calls database to get chosen tablatures data
  await db.getTabContent(req.query.id, function (err, data) {
    if (err) {
      throw err;
      return res(err);
    } else {
      return res.json(data);
    }
  });
}

async function saveChord(req, res) {
  const retval = await db.saveChord(
    req.query.chord_name,
    req.query.chord_frets,
    req.query.chord_tuning,
    req.query.start_pos,
    req.user.name
  );
  res.json(retval);
}

async function updateChord(req, res) {
  const retval = await db.updateChord(
    req.query.chord_name,
    req.query.chord_frets,
    req.query.chord_tuning,
    req.query.start_pos,
    req.user.name,
    req.query.editedId
  );
  res.json(retval);
}

async function saveTab(req, res) {
  console.log(
    req.query.stave_types,
    req.query.stave_subtypes,
    req.query.stave_content
  );
  const retval = await db.saveTab(
    req.user.name,
    req.query.song_name,
    req.query.artist_name,
    req.query.genre,
    req.query.stave_types,
    req.query.stave_subtypes,
    req.query.stave_content
  );
  res.json(retval);
}

async function updateTab(req, res) {
  const retval = await db.updateTab(
    req.query._id,
    req.user.emails[0].value,
    req.query.song_name,
    req.query.artist_name,
    req.query.genre,
    req.query.stave_types,
    req.query.stave_content
  );
  res.json(retval);
}

async function deleteTab(req, res) {
  const retval = await db.deleteTab(req.query._id);
  res.json(retval);
}

async function deleteChord(req, res) {
  const retval = await db.deleteChord(req.query._id);
  res.json(retval);
}

// (function () {
//   const CHECK_DELAY = 2000;
//   let lastTime = Date.now();

//   setInterval(() => {
//     const currentTime = Date.now();
//     if (currentTime > lastTime + CHECK_DELAY * 2) {
//       // ignore small delays
//       gapi.auth2.getAuthInstance().currentUser.get().reloadAuthResponse();
//     }
//     lastTime = currentTime;
//   }, CHECK_DELAY);
// })();

function error(res, msg) {
  // Function to send errors.
  res.sendStatus(500);
  console.error(msg);
}
