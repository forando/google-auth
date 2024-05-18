import { fetchUserAttributes } from 'aws-amplify/auth';
import { ApiError, put, get } from 'aws-amplify/api';
import { encode } from "universal-base64url";
import { toast } from 'react-toastify';

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

export async function getWebPushPubKey() {

    try {
        const restOperation = get({
            apiName: 'google-auth',
            path: 'webpush/pubkey'
        });
        const response = await restOperation.response;
        console.log('GET call on /webpush/pubkey succeeded: ', await response.body.text());
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
    }
}

export async function updateSubscription() {
    try {
        const restOperation = put({
            apiName: 'google-auth',
            path: 'webpush/subscription/12345',
            options: {
                body: { id: 12345, endpoint: 'q2ef/qwerty' }
            }
        });
        const response = await restOperation.response;
        toast.success('Subscription updated!', {
            position: 'top-right'
        });
        console.log('PUT call on /webpush/subscription succeeded: ', await response.body.text());
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

export async function getSubscription() {

    try {
        const id = encode("qwerty");
        const restOperation = get({
            apiName: 'google-auth',
            path: `webpush/subscription/12345/${id}`
        });
        const response = await restOperation.response;
        console.log('GET call on /webpush/subscription succeeded: ', await response.body.text());
    } catch (error) {
        if(error instanceof ApiError) {
            if (error.response) {
                const {
                    statusCode,
                    body
                } = error.response;
                console.error(`GET call on /webpush/subscription got ${statusCode} error response with payload: ${body}`);
            } else {
                console.log('GET call on /webpush/subscription failed: ', error.message);
            }
        } else {
            console.log('GET call on /webpush/subscription failed: ', error);
        }
    }
}