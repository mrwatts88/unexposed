import React, { useEffect } from 'react'
import socket from '../../sockets'


const { RTCPeerConnection, RTCSessionDescription } = window;
const peerConnection = new RTCPeerConnection();
let isAlreadyCalling = false;

peerConnection.ontrack = function(e) {
  const remoteVideo = document.getElementById("remote-video");
  console.log(remoteVideo, "Remote video\n", e.streams[0], "STREAM!")
  if (remoteVideo) {
    remoteVideo.srcObject = e.streams[0];
  }
 };

function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

async function getUserMedia(params) {
  const video = document.querySelector('video')
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
    video.srcObject = stream
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
  } catch (err) {
    console.log('error getting stream')
  }
}

function UserMedia() {
  useEffect(() => {
    if (hasGetUserMedia()) {
      getUserMedia()
    } else {
      alert('getUserMedia() is not supported by your browser')
    }
  }, [])

  return (
    <div>
      <video autoPlay></video>
      <video autoPlay id='remote-video'></video>
      <button onClick={ callUser }>CALLING USER</button>
    </div>
  )
}

async function callUser(socketId) {
  try{
    const offer = await peerConnection.createOffer();
    
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
  
  
  socket.emit("call-user", {
    offer,
    to: socketId
  });
} catch(e){
  console.log("ERROR! ", e);
} 

}
 

 socket.on("call-made", async data => {
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(data.offer)
  );
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

  socket.emit("make-answer", {
    answer,
    to: data.socket
  });
 });

socket.on("answer-made", async data => {
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(data.answer)
  );

  if (!isAlreadyCalling) {
    callUser(data.socket);
    isAlreadyCalling = true;
  }
 });

export default UserMedia
