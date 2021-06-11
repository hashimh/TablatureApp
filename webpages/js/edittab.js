async function editTab(data) {
  console.log(data);

  // first, close the current container and display the create tab container
  let tabcontainer = document.getElementById("tab-container-id");
  let createcontainer = document.getElementById("create-container-id");
  tabcontainer.style.display = "none";
  createcontainer.style.display = "grid";

  document.getElementById("loginbox").style.display = "none";
  document.getElementById("logintext").style.borderLeft = "none";
  document.getElementById("griddiv").style.display = "block";

  // fill in content
  let staves = data[0].stave_types.split(",");
  let substaves = data[0].stave_subtypes.split(",");
  let rawContent = data[0].stave_content.split(",");

  let staveDropdown = document.getElementById("selectStave");
  let tabContent = document.getElementById("tabcontent");

  // clear tab creation area
  while (tabContent.firstChild) {
    tabcontent.removeChild(tabcontent.firstChild);
  }

  // substave loop

  // we need a new loop here split by subdiv first digit which will contain code below

  // now, we want to split substave array into an array of arrays of each number
  let substaveObj = {};
  substaves.forEach(
    (e, i) => (
      (i = parseInt(e, 10)),
      substaveObj[i] ? substaveObj[i].push(e) : (substaveObj[i] = [e])
    )
  );
  substaveObj;
  console.log(substaveObj);
  console.log("raw content", rawContent);
  let currentContent;

  for (let x = 0; x < Object.values(substaveObj).length; x++) {
    // LOOP THROUGH SUBSTAVE OBJECT ARRAY
    // edit this to be compatible with new tab style

    // - For each stave group in data
    //      - run createStave
    //      - fill in with information
    //      - OR... Just fill it out now

    let div = document.createElement("div");
    div.setAttribute("id", x + 1);
    div.setAttribute("class", "stave");

    let h3 = document.createElement("h3");
    h3.innerHTML = "Stave " + (x + 1) + ": " + staves[x];
    h3.setAttribute("id", x + 1 + staves[x]);
    div.append(h3);

    let subdiv = document.createElement("div");
    subdiv.setAttribute("id", "div_stave" + (x + 1));
    subdiv.setAttribute("name", "stavecontainer");
    subdiv.setAttribute("class", "stavecontainerclass");

    for (let y = 0; y < Object.values(substaveObj)[x].length; y++) {
      console.log("run number x", x, "run number y", y);
      let alteredId = Object.values(substaveObj)[x][y].replace(".", "_");
      // LOOP THROUGH EACH ARRAY OF OBJECT
      let staveOption = document.createElement("option");
      staveOption.value = alteredId;
      staveOption.innerHTML = "Stave " + Object.values(substaveObj)[x][y];
      staveDropdown.append(staveOption);

      // create p and textarea

      console.log(Object.values(substaveObj)[x][y]);

      let textArea = document.createElement("textarea");
      let label = document.createElement("p");
      label.setAttribute("id", Object.values(substaveObj)[x][y]);
      label.innerHTML = Object.values(substaveObj)[x][y];

      textArea.setAttribute("id", "stave" + alteredId);
      textArea.setAttribute("name", "stave");
      textArea.setAttribute("rows", "6");
      textArea.setAttribute("cols", "100");
      textArea.setAttribute("wrap", "off");
      textArea.value = "\n\n\n\n\n";

      // run through raw content. remove first element, set as current textarea value
      currentContent = rawContent[0];
      rawContent.shift();

      let textAreaLines = textArea.value.split("\n");
      let content = currentContent.split("\n");

      for (let z = 0; z < content.length; z++) {
        textAreaLines[z] = content[z];
      }
      textArea.value = textAreaLines.join("\n");

      subdiv.append(label);
      subdiv.append(textArea);
    }
    div.append(subdiv);
    tabContent.append(div);
  }

  // select last option of stave dropdown
  staveDropdown.selectedIndex = staveDropdown.options.length - 1;

  fretBoard();
  chordFretboard();

  let songName = data[0].song_name;
  let artistName = data[0].artist_name;
  let genre = data[0].genre;

  editedTab = true;
  editedTabId = data[0]._id;

  // when save button is clicked, append data above into entries, change save innerhtml to update
  document.getElementById("song-name").value = songName;
  document.getElementById("song-artist").value = artistName;
  document.getElementById("song-genre").value = genre;
  document.getElementById("upload-btn").innerHTML = "update tablature";
}
