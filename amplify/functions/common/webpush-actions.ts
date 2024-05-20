import webpush, { PushSubscription, RequestOptions } from 'web-push';
import { WebPushKeys } from "./ssm";

export async function sendWebPush(subscription: PushSubscription, webPushKeys: WebPushKeys, data: string) {
    if(!webPushKeys.private || !webPushKeys.public) {
        throw new Error('Cannot find WebPush Keys');
    }
    const options : RequestOptions = {
        vapidDetails: {
            subject: 'https://developers.google.com/web/fundamentals/',
            publicKey: webPushKeys.public,
            privateKey: webPushKeys.private
        },
        // 1 hour in seconds.
        TTL: 60 * 60
    };
    
    await  webpush.sendNotification(subscription, data, options);
}