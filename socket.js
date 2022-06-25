"use strict";
const ShareDB = require("sharedb");
ShareDB.types.register(require("ot-text").type);
const WebSocket = require("ws");
const WebSocketJSONStream = require("websocket-json-stream");
const http = require("http");
const socketIo = require("socket.io");

const anchors = {};
const names = {};

// Share DB
const share = new ShareDB();
const shareconn = share.connect();
const shareserver = http.createServer();
const sharewss = new WebSocket.Server({ server: shareserver });
sharewss.on("connection", (client) =>
  share.listen(new WebSocketJSONStream(client))
);
shareserver.listen(8080);

console.log(`ShareDB listening on port 8080`);

module.exports = function (server) {
  // Socket IO Server
  const io = socketIo(server);

  io.on("connection", (client) => {
    "server socket connection started";
    const id = client.id;
    names[id] = String.fromCharCode(
      Math.floor("A".charCodeAt(0) + Math.random() * 26)
    );
    anchors[id] = [0, 0];

    // send client its id and anchor and names obj
    client.emit("initialize", { anchors, names });

    client.on("anchor-update", (msg) => {
      // set anchors[id]
      anchors[id] = msg;
      io.emit("anchor-update", { id, anchor: anchors[id] });
    });

    io.emit("id-join", {
      id,
      name: names[id],
      anchor: anchors[id],
    });

    client.on("data-change", (data) => {
      console.log("server recieved data=>", data);
      sharedoc.data = data;
    });
    // Remove id info and update clients
    // TODO: This doesn't seem to always get called
    // Mashing resfresh on a page seems to leave lingering
    // connections that eventually close
    client.on("disconnect", () => {
      console.log("left", id);
      delete names[id];
      delete anchors[id];
      io.emit("id-left", { id });
    });
  });
};
