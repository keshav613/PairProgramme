// let socket = io();
console.log(io);
const calls = new Map();
let videoGrid = document.getElementById("video-grid");

const myVideo = document.createElement("video");
myVideo.muted = true;

let peer;
/*
Add support for having older user call details when new user joins, else when he exits we wont remove
the call
*/
let constraints = { video: true, audio: false };
console.log(constraints);
// let getUserMedia = navigator.getUserMedia
navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
  //Display your video stream on the browers vedio grid
  addVideo(myVideo, stream);

  peer = new Peer(undefined, {
    host: "/",
    port: "3001",
  });

  //When our client geets connected to peer server and gets an ID.
  peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id);
  });

  //Call new user with your stream
  socket.on("new-user-joined", (userId) => {
    console.log(
      "client recevied boradcast, calling after 1sec to user ",
      userId
    );
    // setTimeout(callNewUser, 1000, peer, userId, stream);
    callNewUser(userId, stream);
  });

  //Answer if other user calls you
  peer.on("call", (call) => {
    //Answer with your video stream
    console.log("answering call from", call.peer);
    call.answer(stream);

    //Save the call object so that, when that user exits you can close the call connection.
    //Actually call will get closed as either one if the party termintates the call,
    // but the video frame we added will be present, so to know when to delete that video
    //we need this mapping.
    calls.set(call.peer, call);

    console.log("adding callers video stream");
    //Calling user will send their vedio stream, so take it displya it on user side
    let callerVideo = document.createElement("video");
    call.on("stream", (remoteVideoStream) => {
      addVideo(callerVideo, remoteVideoStream);
    });
    call.on("close", () => {
      callerVideo.remove();
    });
  });

  //If current socket connection closes, stop your video stream
  socket.on("user-exited", (userId) => {
    if (calls.has(userId)) {
      calls.get(userId).close();
      calls.delete(userId);
    }
  });
});

const callNewUser = (userId, stream) => {
  //Call user with your video stream
  let call = peer.call(userId, stream);
  calls.set(userId, call);
  console.log("calling new user with my stream", userId);
  let newUserVideo = document.createElement("video");
  //As a reply you will recive the remote vedio stream
  call.on("stream", (remoteVideoStream) => {
    addVideo(newUserVideo, remoteVideoStream);
    console.log("recieved new users video stream");
  });

  //If the user disconnects the call, then stop their video feed
  call.on("close", () => {
    newUserVideo.remove();
  });
};

const addVideo = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

/**
 * Lets suppose there are N users in a call and then a new user joins the room. Then we will get a even saying
 * a new user joined and all the existing users will send calls to the new user. So there will be N*N-1 calls going on.
 * And when a user disconnects then we will need to disconect all the N-1 calls connected with this user.
 * As we will be storing the userID Vs callConnection, all the N-1 users will be storing this user Vs
 * This webRTC is a two way connection
 * Lets suppose two users A and B are there
 * A (call to B with ur stream) =======> B (answer the call with  your stream, and consume A's stream)
 *  (if B answers your call then you will receive his stream, so consume it)
 *
 * For each user there will be N-1 call objects. When a user disonnects, each user should know and they
 * remove respective AV streams from their browser. How will you know? when user disconnects socket.io
 * will broadcast to all users in that room, then each user should maintain a map of that particular
 * userId vs call connection between them. So when user discaonnects we can close call on our end
 * and this call termination will triger a event 'close' which will then remove the video
 * Here socket => map => video. Instead we could have simply kept mapping of video.
 *  When new user joins call him and store that
 */
