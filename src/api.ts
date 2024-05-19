import {fetchUserAttributes, getCurrentUser} from 'aws-amplify/auth';
import {ApiError, del, get, put} from 'aws-amplify/api';
import {encode} from "universal-base64url";
import {toast} from 'react-toastify';

export async function updateToken() {
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

export async function getWebPushPubKey(): Promise<string | null> {

    try {
        const restOperation = get({
            apiName: 'google-auth',
            path: 'webpush/pubkey'
        });
        const response = await restOperation.response;
        const body = await response.body.json();
        console.log(body);
        // @ts-ignore
        return body["data"];
    } catch (error) {
        if(error instanceof ApiError) {
            if (error.response) {
                const {
                    statusCode,
                    body
                } = error.response;
                console.error(`GET call on /webpush/pubkey got ${statusCode} error response with payload: ${body}`);
            } else {
                console.log('GET call on /webpush/pubkey failed: ', error.message);
            }
        } else {
            console.log('GET call on /webpush/pubkey failed: ', error);
        }
        return null;
    }
}

export async function saveUserSubscription(subscription: PushSubscription) {
    try {
        const user = await getUser();
        const restOperation = put({
            apiName: 'google-auth',
            path: `webpush/subscription/${user.username}`,
            options: {
                // @ts-ignore
                body: subscription.toJSON()
            }
        });
        const response = await restOperation.response;
        toast.success('Subscription updated!', {
            position: 'top-right'
        });
        console.log('PUT call on /webpush/subscription succeeded: ', await response.body.json());
    } catch (error) {
        if(error instanceof ApiError) {
            if (error.response) {
                const {
                    statusCode,
                    body
                } = error.response;
                console.error(`PUT call on /webpush/subscription got ${statusCode} error response with payload: ${body}`);
            } else {
                console.log('PUT call on /webpush/subscription failed: ', error.message);
            }
        } else {
            console.log('PUT call on /webpush/subscription failed: ', error);
        }
        toast.error('Error updating subscription', {
            position: 'top-right'
        });
    }
}

export async function fetchUserSubscription(subscription: PushSubscription) {

    const uri = await createSubscriptionUri(subscription);
    if (!uri) {
        return null;
    }

    try {
        const restOperation = get({
            apiName: 'google-auth',
            path: uri
        });
        const response = await restOperation.response;
        return await response.body.json();
    } catch (error) {
        if(error instanceof ApiError) {
            if (error.response) {
                const {
                    statusCode,
                    body
                } = error.response;
                console.error(`GET call on ${uri} got ${statusCode} error response with payload: ${body}`);
            } else {
                console.log(`GET call on ${uri} failed: `, error.message);
            }
        } else {
            console.log(`GET call on ${uri} failed: `, error);
        }
        return null;
    }
}

export async function deleteUserSubscription(subscription: PushSubscription) {

    const uri = await createSubscriptionUri(subscription);
    if (!uri) {
        return null;
    }

    try {
        const restOperation = del({
            apiName: 'google-auth',
            path: uri
        });
        await restOperation.response;
    } catch (error) {
        if(error instanceof ApiError) {
            if (error.response) {
                const {
                    statusCode,
                    body
                } = error.response;
                console.error(`DELETE call on ${uri} got ${statusCode} error response with payload: ${body}`);
            } else {
                console.log(`DELETE call on ${uri} failed: `, error.message);
            }
        } else {
            console.log(`DELETE call on ${uri} failed: `, error);
        }
    }
}

async function createSubscriptionUri(subscription: PushSubscription | undefined | null) {
    if(!subscription?.endpoint) {
        console.log('No endpoint in subscription', subscription)
        return null;
    }

    const subscriptionId = subscription.endpoint.split("/").pop();
    if(!subscriptionId) {
        console.log("Malformed subscription endpoint:", subscription.endpoint);
        return null;
    }

    const user = await getUser();
    if(!user) {
        console.log("User not defined");
        return null;
    }

    const id = encode(subscriptionId);
    return `webpush/subscription/${user.username}/${id}`;
}

async function getUser() {
    return await getCurrentUser();
}