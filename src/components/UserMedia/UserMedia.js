import React, { useEffect } from 'react'

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
    </div>
  )
}

export default UserMedia
