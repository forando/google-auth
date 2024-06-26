import { Authenticator, Button, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { updateToken } from './api';
import logo from './assets/logo.svg';
import WebPush from "./component/web-push/WebPush.tsx";
import './App.css';

function App() {

  return (
      <Authenticator socialProviders={['google']}>
        {({signOut, user}) => (
            <div className="App">
              <WebPush/>
              <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <div className='container'>
                  <Heading level={1}>Google Auth</Heading>
                  <Button onClick={signOut} className='button space-right'>Sign out</Button>
                  {user && <Button onClick={updateToken} className='button'>Save refresh_token</Button>}
                </div>
                <ToastContainer />
              </header>
            </div>
        )}
      </Authenticator>
  );
}

export default App;
