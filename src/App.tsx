import { Authenticator, Button, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {updateToken, getWebPushPubKey, getSubscription} from './api'
import logo from './assets/logo.svg';
import './App.css';

function App() {

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
                  {user && <Button onClick={getWebPushPubKey} className='button'>Get Web Push Key</Button>}
                  {user && <Button onClick={getSubscription} className='button'>Update Subscription</Button>}
                </div>
                <ToastContainer />
              </header>
            </div>
        )}
      </Authenticator>
  );
}

export default App;
