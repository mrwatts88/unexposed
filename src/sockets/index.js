import io from 'socket.io-client'

const socket = io('http://localhost:3001')

socket.on('connection', data => {
  console.log(data)
})

export default socket;