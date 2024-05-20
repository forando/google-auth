import axios from 'axios';
import type { ScheduledHandler } from "aws-lambda";
import { getWebPushKeys, getGoogleSecrets, GoogleSecrets } from "../common/ssm";
import { env } from '$amplify/env/token-refresher';
import { WebPushSubscription } from "../common/webpush-subscription";
import { Keys, PartitionKey, SortKey, generateKeys } from '../common/utils';
import { ID } from '../common/id';
import {getEntity, putEntity} from '../common/dynamodb-actions';
import { sendWebPush } from '../common/webpush-actions';
import { GoogleToken } from '../common/google-token';

export const handler: ScheduledHandler = async () => {
    try {
        const secrets = await getGoogleSecrets(env.APP_ID);
    
        if(!secrets) {
            console.log("No Google Secrets Found");
            return;
        }
        
        const token = await refreshAccessToken(secrets);
        if(token) {
            await saveTokenToDb(token);
            console.log("Token refreshed successfully");
        } else {
            await sendTokenExpiredPush();
        }
    } catch(err) {
        console.log("Cannot refresh token:", err);
    }
}

async function refreshAccessToken(secrets: GoogleSecrets) {
    try {
        const custom = axios.create({
            baseURL: 'https://oauth2.googleapis.com',
            params: {
                client_id: secrets.clientId,
                client_secret: secrets.clientSecret,
                grant_type: "refresh_token",
                refresh_token: secrets.refreshToken
        }
        });
        const response = await custom.post('/token');
    
        return response.data.access_token;
    } catch(err) {
        console.log("Cannot refresh access_token:", err);
        return null;
    }
}

async function saveTokenToDb(token: string) {
    const pk = PartitionKey.fromString("google");
    const sk = SortKey.fromString("token");
    const id = new ID(pk, sk);
    const entity = new GoogleToken(id, token);

    await putEntity(entity);
}

async function sendTokenExpiredPush() {
    const subscription = await getSubscription();
    const webPushKeys = await getWebPushKeys(env.APP_ID);
    if(!subscription || !webPushKeys) {
        console.log("Cannot send WebPush. No subscription or web push keys.");
        return;
    }
    const data = {
        title: "Google Auth",
        message: "Refresh token expired"
    }
    await sendWebPush(subscription, webPushKeys, JSON.stringify(data));
}

async function getSubscription() {
    const pk: PartitionKey = WebPushSubscription.partitionKey;
    const sk: SortKey = WebPushSubscription.sortKey;
    const params: Keys = generateKeys(pk, sk);
    
    const getRes = await getEntity(params);
    
    if (getRes.Item) {
    return WebPushSubscription.fromData(getRes.Item).toDto();
    }
    return null;
}
