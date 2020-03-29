import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'

const socket = io('http://localhost:3001')

socket.on('connection', data => {
  console.log(data)
})

function Chat() {
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState([])

  useEffect(() => {
    socket.on('message', ({ data }) => {
      setMessages(msgs => [...msgs, data])

      console.log(data)
    })
  }, [])

  const sendMessage = () => {
    socket.emit('message', messageText)
  }

  const handleChange = e => {
    setMessageText(e.target.value)
  }

  const handleClick = () => {
    if (messageText === '') return
    sendMessage()
    setMessageText('')
  }

  const handleSubmit = e => {
    e.preventDefault()
    handleClick()
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" onChange={handleChange} value={messageText} />
        <button onClick={handleClick}>Send</button>
      </form>
      <div>
        {messages.map((msg, idx) => (
          <div key={idx}>{msg}</div>
        ))}
      </div>
    </div>
  )
}

export default Chat
