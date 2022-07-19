"use strict";
const ShareDB = require("sharedb");
ShareDB.types.register(require("ot-text").type);
const WebSocket = require("ws");
const WebSocketJSONStream = require("websocket-json-stream");
const http = require("http");
const socketIo = require("socket.io");
var axios = require("axios");
var qs = require("qs");
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
    console.log("server socket connection started");
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

    client.on("editorPropertyChanged", (roomId, theme, fontSize) => {
      console.log(
        "received and braodcasting to all in room ",
        roomId,
        theme,
        fontSize
      );
      io.to(roomId).emit("editorPropertyChanged", theme, fontSize);
    });
    client.on("editorChanged", (roomId, mode) => {
      console.log("received and braodcasting to all in room ", roomId, mode);
      io.to(roomId).emit("editorChanged", mode);
    });
    client.on("chatMessage", (roomId, data) => {
      console.log("messaage chatted");
      io.to(roomId).emit("chatMessage", data);
    });
    client.on("execute", async (roomId, code, language, input) => {
      console.log("received io event from client ", code, input, language);
      var data = qs.stringify({
        code,
        language,
        input,
      });
      var config = {
        method: "post",
        url: "https://codex-api.herokuapp.com/",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data,
      };
      let err = "",
        resp = "";
      try {
        let response = (await axios(config)).data;
        resp = response.output;
      } catch (error) {
        err = error;
      }

      console.log(err, resp);
      io.to(roomId).emit("codeResult", err, resp);
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

    client.on("join-room", (roomId, userId) => {
      client.join(roomId);
      console.log("new user joined", userId, "in roomID ", roomId);
      client.broadcast.to(roomId).emit("new-user-joined", userId);
      // client.to(roomId).broadcast.emit("new-user-joined", userId);

      client.on("disconnect", () => {
        client.broadcast.to(roomId).emit("user-exited", userId);
        // client.to(roomId).broadcast.emit("user-exited", userId);
      });
    });
  });
};
