import { defineBackend } from '@aws-amplify/backend';
import { Stack } from "aws-cdk-lib";
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";

import { apiFunction } from "./functions/api-function/resource";
import { auth } from './auth/resource';
import { data } from './data/resource';

const backend = defineBackend({
  auth,
  data,
  apiFunction
});

// extract L1 CfnUserPool resources
const { cfnUserPool } = backend.auth.resources.cfnResources;
// use CDK's `addPropertyOverride` to modify properties directly
cfnUserPool.addPropertyOverride("Schema", [
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

// create a new API stack
const apiStack = backend.createStack("api-stack");

// create a new REST API
const googleAuthApi = new RestApi(apiStack, "RestApi", {
  restApiName: "google-auth",
  deploy: true,
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS, // Restrict this to domains you trust
    allowMethods: Cors.ALL_METHODS, // Specify only the methods you need to allow
    allowHeaders: Cors.DEFAULT_HEADERS, // Specify only the headers you need to allow
  },
});

// create a new Lambda integration
const lambdaIntegration = new LambdaIntegration(
    backend.apiFunction.resources.lambda
);

// create a new Cognito User Pools authorizer
const cognitoAuth = new CognitoUserPoolsAuthorizer(apiStack, "CognitoAuth", {
  cognitoUserPools: [backend.auth.resources.userPool],
});

// create a new resource path with Cognito authorization
const refreshTokenPath = googleAuthApi.root.addResource("refreshtoken");
refreshTokenPath.addMethod("PUT", lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});

// add outputs to the configuration file
backend.addOutput({
  custom: {
    API: {
      [googleAuthApi.restApiName]: {
        endpoint: googleAuthApi.url,
        region: Stack.of(googleAuthApi).region,
        apiName: googleAuthApi.restApiName,
      },
    },
  },
});