import { Authenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { fetchAuthSession } from 'aws-amplify/auth'
import '@aws-amplify/ui-react/styles.css';
import { put } from 'aws-amplify/api';

function App() {

  async function callApi() {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    if(!token) {
        console.error('No token found');
        return;
    }

    try {
      const restOperation = put({
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
              <button onClick={signOut}>SignOut</button>
              <button onClick={async () => {
                console.log("User:", await fetchUserAttributes());
              }}>Log User
              </button>
              <button onClick={callApi}>Invoke API</button>
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
