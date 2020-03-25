import React, { useEffect, useReducer } from 'react'

import API, { graphqlOperation } from '@aws-amplify/api'
import PubSub from '@aws-amplify/pubsub'

import { createUser } from './graphql/mutations'
import { listUsers } from './graphql/queries'
import { onCreateUser } from './graphql/subscriptions'

import awsconfig from './aws-exports'
import './App.css'

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

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
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
      <button onClick={() => createNewUser('PETER RULES')}>Add User</button>
      <div>
        {state.users.length}
        {state.users.map(user => (
          <div key={user.id}>{user.name}</div>
        ))}
      </div>
    </div>
  )
}

export default App
