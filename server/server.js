"use strict";

const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require("bcryptjs");

// const GoogleAuth = require("simple-google-openid");

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

// app.use(
//   GoogleAuth(
//     "566769051678-k1mpvtssd5jin7p6bekdtv7g1r23qav4.apps.googleusercontent.com"
//   )
// );
// app.use("/api", GoogleAuth.guardMiddleware());

app.get("/api/login", login);
app.get("/api/logout", logout);
app.get("/api/createTabBtn", createTabBtn);
app.get("/api/viewTabBtn", viewTabBtn);
app.get("/api/getSavedChords", getSavedChords);
app.get("/api/getTabsMetadata", getTabsMetadata);
app.get("/api/getTabContent", getTabContent);

// app.post("/api/checkUser", checkUser);
app.post("/api/register", register);
app.get("/api/checkusername", checkusername);

app.post("/api/saveChord", saveChord);
app.post("/api/saveTab", saveTab);
app.post("/api/updateTab", updateTab);
app.post("/api/deleteTab", deleteTab);
app.post("/api/updateChord", updateChord);
app.post("/api/deleteChord", deleteChord);

// -------------------------------------------------- //
// ---------------- SERVER FUNCTIONS ---------------- //
// -------------------------------------------------- //

async function checkusername(req, res) {
  // console.log(await db.checkusername(req.query.username, callback));
  await db.checkusername(req.query.username, function (err, data) {
    console.log(data, data.length);
    if (err) throw err;

    if (data.length > 0) {
      console.log("user exists (server), returning true");
      return res.json({ result: true });
    } else {
      console.log("user doesn't exist (server), returning false");
      return res.json({ result: false });
    }
  });
}

async function register(req, res) {
  // call mongodb function to register user
  console.log(req.query.username, req.query.password, req.query.email);

  try {
    // hash the password
    const hash = await bcrypt.hash(req.query.password, 10);
    req.query.password = hash;
  } catch (error) {
    throw err;
  }
  console.log(req.query.password);

  const retval = await db.register(
    req.query.username,
    req.query.password,
    req.query.email
  );
  return res.json(retval);
}

// this will be made redundant
async function login(req, res) {
  // Sends menu.html once logged in.
  res.sendFile("menu.html", { root: "./webpages" });
  console.log("changed");
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
  await db.getSavedChords(req.user.emails[0].value, function (err, data) {
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
    req.user.emails[0].value
  );
  res.json(retval);
}

async function updateChord(req, res) {
  const retval = await db.updateChord(
    req.query.chord_name,
    req.query.chord_frets,
    req.query.chord_tuning,
    req.query.start_pos,
    req.user.emails[0].value,
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
    // debugging

    // req.user.emails[0].value,
    "testemail@mail.com",
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

(function () {
  const CHECK_DELAY = 2000;
  let lastTime = Date.now();

  setInterval(() => {
    const currentTime = Date.now();
    if (currentTime > lastTime + CHECK_DELAY * 2) {
      // ignore small delays
      gapi.auth2.getAuthInstance().currentUser.get().reloadAuthResponse();
    }
    lastTime = currentTime;
  }, CHECK_DELAY);
})();

function error(res, msg) {
  // Function to send errors.
  res.sendStatus(500);
  console.error(msg);
}
