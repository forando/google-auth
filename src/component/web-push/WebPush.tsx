import './WebPush.css';
import Switch from "@mui/material/Switch";
import { FormControlLabel } from '@mui/material';
import { useRegisterSW } from 'virtual:pwa-register/react'
import { subscribe, unsubscribe, loadNotificationSettings, saveNotificationSettings } from './utils.ts';
import {useState} from "react";
function WebPush() {
    
    const [resistration , setRegistration] = useState<ServiceWorkerRegistration>();
    
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({ onRegisteredSW, onRegisterError });
    
    function onRegisteredSW(swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) {
        const intervalMS = 60 * 60 * 1000;
        
        console.log(`SW Registered: ${swScriptUrl}` + registration);
        
        if(registration) {
            setInterval(
                () => { registration.update() },
                intervalMS
            );
            setRegistration(registration);
        }
    }
    
    function onRegisterError(error: Error) {
        console.log('SW registration error', error)
    }
    
    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    }
    
    const handleChange = (_: any, checked: boolean) => {
        if(checked) {
            subscribe(resistration)
            .catch(err => {console.log(err)});
        } else {
            unsubscribe(resistration)
            .catch(err => {console.log(err)});
        }
        saveNotificationSettings(checked);
    };
    
    return (
        <div className="WebPush-container">
            <span className="Switch-container">
                <FormControlLabel control={<Switch defaultChecked={loadNotificationSettings()}/>} label="notifications" onChange={handleChange} />
            </span>
            { (offlineReady || needRefresh)
                && <div className="WebPush-toast">
                        <div className="WebPush-message">
                            { offlineReady
                                ? <span>App ready to work offline</span>
                                : <span>New content available, click on reload button to update.</span>
                            }
                        </div>
                        { needRefresh && <button className="WebPush-toast-button" onClick={() => updateServiceWorker(true)}>Reload</button> }
                        <button className="WebPush-toast-button" onClick={() => close()}>Close</button>
                </div>
            }
        </div>
    )
}

export default WebPush