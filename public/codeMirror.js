// Websocket Initialization
// module.exports = (io) => {

// Indicates whether or not we should not watch
// changes emitted by the editor due to changes made
// via operations
let stopWatch = false,
  content = "";

let fontSize = document.getElementById("fontSize").value,
  theme = document.getElementById("theme").value,
  language = document.getElementById("language").value;

console.log(fontSize, theme, language);

CodeMirror.modeURL = "/node_modules/codemirror/mode/%N/%N.js";
let ed = CodeMirror.fromTextArea(document.querySelector("textarea"), {
  lineNumbers: true,
  value: content,
  matchBrackets: true,
  autoCloseBrackets: true,
});
ed.setSize("100%", "100%");

function editorPropertyChanged(theme = null, fontSize = null) {
  console.log(
    "broadcast to all, editor property changed",
    theme,
    fontSize,
    " room ID : ",
    ROOM_ID
  );
  io.emit("editorPropertyChanged", ROOM_ID, theme, fontSize);
}

function editorChanged(mode) {
  console.log("broadcast to all, language changed ", mode);
  io.emit("editorChanged", ROOM_ID, mode);
}
// Create operations for sharedb based on the editor
ed.on("change", (ed, chg) => {
  if (stopWatch) return;

  const stindex = ed.indexFromPos(chg.from);
  const delta = chg.removed.join("\n").length;
  const addedText = chg.text.join("\n");

  if (delta) sharedoc.submitOp([stindex, { d: delta }]);
  if (addedText) sharedoc.submitOp([stindex, addedText]);
});

// Update the range in other editors when the selection changes
ed.on("cursorActivity", (e) => {
  const stPos = ed.getCursor("start");
  const edPos = ed.getCursor("end");
  const hdPos = ed.getCursor("head");

  const stindex = ed.indexFromPos(stPos);
  const edindex = ed.indexFromPos(edPos);
  const hdindex = ed.indexFromPos(hdPos);
  const prefixed = hdindex === stindex && stindex !== edindex;
  console.log("anchor-update emitted");
  io.emit("anchor-update", { stindex, edindex, prefixed });
});

// ShareDB init //
const sharews = new WebSocket(`ws://localhost:8080`);
const shareconn = new ShareDB.Connection(sharews);
const docMatches = window.location.href.match(/\?doc=([a-zA-Z1-9]+)/);
let sharedoc = shareconn.get("room", ROOM_ID + "/" + language);

console.log("info mode", language);

// Listen for changes to the document
//Whenver a fucntion is set we need to do broadcast to every one in room.
// sharedoc.subscribe((d) => {
//   ed.setOption("mode", language);
//   console.log("auto loaf functions ", CodeMirror.autoLoadMode.toString());
//   CodeMirror.autoLoadMode(ed, language);
//   console.log("subscribe ", sharedoc.data);
//   stopWatch = true;
//   if (sharedoc.data === undefined) {
//     console.log("this doc not present, creating new doc with this key");
//     sharedoc.create(
//       "",
//       "text",
//       (data) => (sharedoc = shareconn.get("room", ROOM_ID))
//     );
//   }
//   ed.setValue(sharedoc.data);
//   ed.setCursor(0, 0);
//   ed.focus();
//   stopWatch = false;
// });
setEditor();

sharedoc.on("op", (op, mine) => {
  console.log(op, mine);
  if (mine) return;
  const index = op.length == 2 ? op[0] : 0;
  const data = op.length === 2 ? op[1] : op[0];

  // insert operation if the op is of the form
  // op [<index>, <string>]
  if (typeof data === "string") {
    const pos = ed.posFromIndex(index);

    stopWatch = true;
    ed.replaceRange(data, pos, pos);
    stopWatch = false;

    // otherwise we assume its a deletion of the form
    // op [<index>, { d: <char count> }]
  } else {
    const delCt = data.d;
    const stPos = ed.posFromIndex(index);
    const edPos = ed.posFromIndex(index + delCt);
    const range = { start: stPos, end: edPos };

    stopWatch = true;
    ed.replaceRange("", stPos, edPos);
    stopWatch = false;
  }
});

// ShareDB-Independent update events
const addName = (id, name) => {
  const userslist = document.querySelector("#users");
  const usericon = document.createElement("li");
  usericon.classList.add(`u-${id}`);
  usericon.innerHTML = name;
  userslist.appendChild(usericon);

  const color = idToColor(id);
  const styleTag = document.createElement("style");
  styleTag.id = `style-${id}`;
  styleTag.innerHTML = `
              .u-${id} { background-color: ${color}; }
              .CodeMirror-line .u-${id}                   { background-color: ${hexToRgbaStyle(
    color,
    0.35
  )}; }
              .CodeMirror-line .u-${id}.cursor            { opacity: 1; }
              .CodeMirror-line .u-${id}.cursor.left       { border-left: 2px solid ${color}; }
              .CodeMirror-line .u-${id}.cursor.right      { border-right: 2px solid ${color}; }
              .CodeMirror-line .u-${id}.empty             { background-color: transparent; }

          `;
  document.querySelector("head").appendChild(styleTag);
  console.log("adding name", styleTag);
};

const anchorMap = {};
const setAnchor = (id, anchor) => {
  console.log("anchor map set");
  if (id in anchorMap) {
    anchorMap[id].forEach((m) => m.clear());
    delete anchorMap[id];
  }

  // Whether or not the cursor is actually at the beginning
  // or end of the selection
  let emptyClass = "";
  let stindex = anchor.stindex;
  const edindex = anchor.edindex;

  // Add selection
  let stPos, edPos, range;
  anchorMap[id] = [];

  if (stindex !== edindex) {
    stPos = ed.posFromIndex(stindex);
    edPos = ed.posFromIndex(edindex);

    anchorMap[id].push(ed.markText(stPos, edPos, { className: `u-${id}` }));
  }

  if (stindex === edindex) {
    stindex = Math.max(0, stindex - 1);
    emptyClass = "empty";
  }

  // Add cursor
  const index = anchor.prefixed ? stindex : edindex;
  stPos = ed.posFromIndex(index + (anchor.prefixed ? 0 : -1));
  edPos = ed.posFromIndex(index + (anchor.prefixed ? 1 : 0));

  anchorMap[id].push(
    ed.markText(stPos, edPos, {
      className: `u-${id} ${emptyClass} cursor ${
        anchor.prefixed ? "left" : "right"
      }`,
    })
  );
};

const removeId = (id) => {
  document.querySelector(`#users li.u-${id}`).remove();
  document.querySelector(`#style-${id}`).remove();
  if (id in anchorMap) {
    anchorMap[id].forEach((m) => m.clear());
    delete anchorMap[id];
  }
};

const idToColor = (id) => {
  let total = 0;
  for (let c of id) total += c.charCodeAt(0);

  let hex = total.toString(16);
  while (hex.length < 3) hex += hex[hex.length - 1];
  hex = hex.substr(0, 3);

  let color = "#";
  for (let c of hex) color += `${c}0`;

  return color;
};

const hexToRgbaStyle = (hex, opacity) => {
  hex = hex.replace("#", "");
  let r, g, b, den;
  if (hex.length === 3) {
    r = hex[0] + hex[0];
    g = hex[1] + hex[1];
    b = hex[2] + hex[2];
  } else {
    r = hex.substr(0, 2);
    g = hex.substr(2, 2);
    b = hex.substr(4, 2);
  }

  r = parseInt(r, 16);
  g = parseInt(g, 16);
  b = parseInt(b, 16);

  return `rgba(${r},${g},${b},${opacity})`;
};

const clearAll = () => {
  for (let key in anchorMap) removeId(key);
};

function setEditor() {
  console.log("setEditor called ", language);
  sharedoc.subscribe((d) => {
    ed.setOption("mode", language);
    CodeMirror.autoLoadMode(ed, language);
    stopWatch = true;
    if (sharedoc.data === undefined) {
      console.log("this doc not present, creating new doc with this key");
      sharedoc.create(
        "",
        "text",
        async (data) =>
          (sharedoc = await shareconn.get("room", ROOM_ID + "/" + language))
      );
    }
    ed.setValue(sharedoc.data);
    ed.setCursor(0, 0);
    ed.focus();
    stopWatch = false;
  });
}

// io.on("connection", () => {
console.log("client socket connection started");
io.on("disconnect", () => clearAll());

io.on("editorChanged", async (mode) => {
  console.log("cacthcing editorChanged event");
  sharedoc = await shareconn.get("room", ROOM_ID + "/" + language);
  language = mode;
  setEditor();
  document.getElementById("language").value = mode;
});

io.on("editorPropertyChanged", (selectedTheme, fontSize) => {
  console.log("cacthcing editorPropertyChanged event");
  if (fontSize !== null) {
    document.getElementById("codeMirror").style["font-size"] = `${fontSize}px`;
    document.getElementById("fontSize").value = fontSize;
  }
  if (selectedTheme !== null) {
    console.log("Hey theme changed to ", selectedTheme);
    input = document.getElementById("theme");
    theme = selectedTheme; //input.options[input.selectedIndex].textContent;
    ed.setOption("theme", selectedTheme);
    document.getElementById("theme").value = selectedTheme;
  }
});

io.once("initialize", (e) => {
  console.log("intializing socket connection");
  for (let id in e.anchors) io.id !== id && setAnchor(id, e.anchors[id]);
  for (let id in e.names) io.id !== id && addName(id, e.names[id]);
});
io.on("anchor-update", (e) => {
  if (io.id === e.id) return;
  console.log("anchor-update");
  setAnchor(e.id, e.anchor);
});
io.on("id-join", (e) => {
  console.log(`id-joined`);
  content = e.data;
  if (io.id === e.id) return;
  addName(e.id, e.name);
  setAnchor(e.id, e.anchor);
});
io.on("id-left", (e) => {
  if (io.id === e.id) return;

  removeId(e.id);
});
// });
// };
