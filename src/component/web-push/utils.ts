import { fetchUserSubscription, saveUserSubscription, deleteUserSubscription, getWebPushPubKey } from "../../api.ts";
import {toast} from 'react-toastify';

export async function subscribe(swRegistration: ServiceWorkerRegistration | undefined) {
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
        // Check whether notification permissions have already been granted;
        console.log('Notification granted previously');
        await subscribeUser(swRegistration);
    } else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            console.log('Notification granted just now');
            await subscribeUser(swRegistration);
        }
    }
}

export async function unsubscribe(swRegistration: ServiceWorkerRegistration | undefined) {
    if(!swRegistration) {
        console.log("Unsubscribe: subscription == null");
        return;
    }
    
    let subscription = await getSubscribtion(swRegistration);
    if (!subscription) {
        console.log('No WebPush Subscription Found');
        return
    }
    console.log('Trying to delete WebPush Subscription:', subscription);
    await deleteUserSubscription(subscription);

    try {
        await subscription.unsubscribe();
        console.log('Successfully unsubscribed from subscription');
    } catch (err) {
        console.log('Cannot unsubscribed from subscription: ', err);
    }
}

async function subscribeUser(swRegistration: ServiceWorkerRegistration | undefined) {
    if(!swRegistration) {
        console.log("SubscribeUser: subscription == null");
        return;
    }
    let subscription = await getSubscribtion(swRegistration);
    if (subscription) {
        const fetchedSubscription = await fetchUserSubscription(subscription);
        if (fetchedSubscription) {
            return;
        }
        console.log("Existing Subscription is not present on the backend. Resubscribing...");
        unsubscribe(swRegistration)
        .catch(err => console.log('Cannot usubscribe user:', err));
    }
    const key = await getWebPushPubKey();
    if(!key) {
        console.log('WebPush Public Key Not defined');
        return;
    }
    const keyBytes = urlB64ToUint8Array(key);

    subscription = await subscribeUserToWebPush(swRegistration, keyBytes)

    if(!subscription) {
        toast.error('Not supported on your device!', {
            position: 'top-right'
        });
        return;
    }

    await saveUserSubscription(subscription);
        
}

function urlB64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function subscribeUserToWebPush(swRegistration: ServiceWorkerRegistration, applicationServerKey: Uint8Array) {
    console.log("ServiceWorker Registration:", swRegistration);
    console.log("ServiceWorker Registration PushManager:", swRegistration.pushManager);

    if(!swRegistration.pushManager) {
        console.log("Subscription.pushManager == null");
        return null;
    }

    try {
        return await swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        })
    } catch (err) {
        console.log("Cannot register user to WebPush:", err);
        return null;
    }
}

async function getSubscribtion(swRegistration: ServiceWorkerRegistration) {
    /*
    * Safari might not have pushManager in ServiceRegistration
    * See: https://developer.apple.com/forums/thread/712627?login=true&page=1&r_s_legacy=true#743663022
    */
    if(!swRegistration.pushManager) {
        console.log("Subscription.pushManager == null");
        return null;
    }
    try {
        return await swRegistration.pushManager.getSubscription();
    } catch (err) {
        console.log("Cannot get subscription:", err);
        return null;
    }
}

export function saveNotificationSettings(enabled: boolean) {
    localStorage.setItem("notificationsEnabled", String(enabled));
}

export function loadNotificationSettings() {
    const notificationStr = localStorage.getItem("notificationsEnabled");
    return notificationStr === 'true';
}
