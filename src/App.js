import React from 'react'
import API from '@aws-amplify/api'
import PubSub from '@aws-amplify/pubsub'

import awsconfig from './aws-exports'
import './App.css'

import UserMedia from './components/UserMedia/UserMedia'
import Chat from './components/Chat/Chat'
import Users from './components/Users/Users'

// Configure Amplify
API.configure(awsconfig)
PubSub.configure(awsconfig)

function App() {
  return (
    <div className="App">
      <UserMedia />
      <Chat />
      {/* <Users /> */}
    </div>
  )
}

export default App
