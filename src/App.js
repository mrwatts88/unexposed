import React, { useEffect, useReducer, useState } from 'react'

import API, { graphqlOperation } from '@aws-amplify/api'
import PubSub from '@aws-amplify/pubsub'

import { createUser } from './graphql/mutations'
import { listUsers } from './graphql/queries'
import { onCreateUser } from './graphql/subscriptions'

import awsconfig from './aws-exports'
import './App.css'

import io from 'socket.io-client'

const socket = io('http://localhost:3001')

socket.on('connect', function() {
  console.log('im connected ')
})

socket.on('connection', data => {
  console.log(data)
})

// Configure Amplify
API.configure(awsconfig)
PubSub.configure(awsconfig)

async function createNewUser(name) {
  const user = { name }
  await API.graphql(graphqlOperation(createUser, { input: user }))
}

// Action Types
const QUERY = 'QUERY'
const SUBSCRIPTION = 'SUBSCRIPTION'

const initialState = {
  users: [],
}

const reducer = (state, action) => {
  switch (action.type) {
    case QUERY:
      return { ...state, users: action.users }
    case SUBSCRIPTION:
      return { ...state, users: [...state.users, action.user] }
    default:
      return state
  }
}

function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState([])

  socket.on('message', ({ data }) => {
    setMessages([...messages, data])
    setMessageText('')
    console.log(data)
  })

  const sendMessage = () => {
    socket.emit('message', messageText)
  }

  const handleChange = e => {
    setMessageText(e.target.value)
  }

  useEffect(() => {
    if (hasGetUserMedia()) {
      getUserMedia()
    } else {
      alert('getUserMedia() is not supported by your browser')
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

    async function getData() {
      const userData = await API.graphql(
        graphqlOperation(listUsers, { limit: 1000 })
      )
      dispatch({ type: QUERY, users: userData.data.listUsers.items })
    }

    const subscription = API.graphql(graphqlOperation(onCreateUser)).subscribe({
      next: eventData => {
        const user = eventData.value.data.onCreateUser
        dispatch({ type: SUBSCRIPTION, user })
      },
    })

    getData()
    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="App">
      <video autoPlay></video>
      <input type="text" onChange={handleChange} value={messageText} />
      <button onClick={sendMessage}>Send</button>
      <div>
        {messages.map(msg => (
          <div>{msg}</div>
        ))}
      </div>
      {/* <button onClick={() => createNewUser('PETER RULES')}>Add User</button>
      <div>
        {state.users.length}
        {state.users.map(user => (
          <div key={user.id}>{user.name}</div>
        ))}
      </div> */}
    </div>
  )
}

export default App
