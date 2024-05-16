import { defineAuth, secret } from '@aws-amplify/backend';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export enum UserGroup {
    ADMINS = 'ADMINS',
}

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
        attributeMapping: {
          email: 'email',
          givenName: 'given_name',
          nickname: 'sub',
          custom: {
            'custom:access_token': 'access_token',
            'custom:id_token': 'id_token',
            'custom:refresh_token': 'refresh_token'
          }
        },
        scopes: [
            'email', 'openid', 'profile',
            'https://www.googleapis.com/auth/photoslibrary.readonly',
            'https://www.googleapis.com/auth/youtube.readonly'
        ],
      },
      callbackUrls: [
        'http://localhost:4173/profile',
        'http://localhost:5173/profile',
        'https://main.d1usx0w4bl28pz.amplifyapp.com/profile'
      ],
      logoutUrls: ['http://localhost:5173/', 'http://localhost:5173/', 'https://main.d1usx0w4bl28pz.amplifyapp.com'],
    },
  },
  groups: [UserGroup.ADMINS],
});

export const configCustomAttributes = (userPool: cognito.CfnUserPool) => {
  userPool.addPropertyOverride("Schema", [
    {
      Name: "access_token",
      AttributeDataType: "String",
      Mutable: true,
    },
    {
      Name: "id_token",
      AttributeDataType: "String",
      Mutable: true,
    },
    {
      Name: "refresh_token",
      AttributeDataType: "String",
      Mutable: true,
    },
  ]);
};
