import { Authenticator, Button, Heading } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';
import { ApiError, put } from 'aws-amplify/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from './assets/logo.svg';
import './App.css';

function App() {

  async function updateToken() {
    const attributes = await fetchUserAttributes();
    const refreshToken = attributes['custom:refresh_token'];

    if(!refreshToken) {
        toast.error('No refresh token found', {
          position: 'top-right'
        });
        console.log('No refresh token found');
        return;
    }

    try {
      const restOperation = put({
        apiName: 'google-auth',
        path: 'refreshtoken',
        options: {
          body: {token: refreshToken}
        }
      });
      const response = await restOperation.response;
      toast.success('Token updated!', {
        position: 'top-right'
      });
      console.log('PUT call on /refreshtoken succeeded: ', await response.body.text());
    } catch (error) {
      if(error instanceof ApiError) {
        if (error.response) {
          const {
            statusCode,
            body
          } = error.response;
          console.error(`PUT call on /refreshtoken got ${statusCode} error response with payload: ${body}`);
        } else {
          console.log('PUT call on /refreshtoken failed: ', error.message);
        }
      } else {
        console.log('PUT call on /refreshtoken failed: ', error);
      }
      toast.error('Error updating token', {
        position: 'top-right'
      });
    }
  }

  return (
      <Authenticator socialProviders={['google']}>
        {({signOut, user}) => (
            <div className="App">
              <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <div className='container'>
                  <Heading level={1}>Google Auth</Heading>
                  <Button onClick={signOut} className='button'>Sign out</Button>
                  {user && <Button onClick={updateToken} className='button'>Save refresh_token</Button>}
                </div>
                <ToastContainer />
              </header>
            </div>
        )}
      </Authenticator>
  )
      ;
}

export default App;
