import { useEffect, useState } from "react";
import { Authenticator } from '@aws-amplify/ui-react';
import type { Schema } from "../amplify/data/resource";
import { fetchUserAttributes } from 'aws-amplify/auth';
import { fetchAuthSession } from 'aws-amplify/auth'
import { generateClient } from "aws-amplify/data";
import '@aws-amplify/ui-react/styles.css';
import { get } from 'aws-amplify/api';

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({content: window.prompt("Todo content")});
  }

  async function callApi() {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    if(!token) {
        console.error('No token found');
        return;
    }

    try {
      const restOperation = get({
        apiName: 'google-auth',
        path: 'refreshtoken',
        options: {
          headers: {
            Authorization: token
          }
        }
      });
      const response = await restOperation.response;
      console.log('GET call succeeded: ', await response.body.text());
    } catch (error) {
      console.log('GET call failed: ', error);
    }
  }

  return (
      <Authenticator socialProviders={['google']}>
        {({signOut, user}) => (

            <main>
              <h1>Hello {user?.username}</h1>
              <button onClick={createTodo}>+ new</button>
              <button onClick={signOut}>SignOut</button>
              <button onClick={async () => {
                console.log("User:", await fetchUserAttributes());
              }}>Log User
              </button>
              <button onClick={callApi}>Invoke API</button>
              <ul>
                {todos.map((todo) => (
                    <li key={todo.id}>{todo.content}</li>
                ))}
              </ul>
              <div>
                🥳 App successfully hosted. Try creating a new todo.
                <br/>
                <a href="https://next-release-dev.d1ywzrxfkb9wgg.amplifyapp.com/react/start/quickstart/vite-react-app/#step-2-add-delete-to-do-functionality">
                  Review next step of this tutorial.
                </a>
              </div>
            </main>
        )}
      </Authenticator>
  )
      ;
}

export default App;
