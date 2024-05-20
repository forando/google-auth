import { defineBackend } from '@aws-amplify/backend';
import { Api } from './api/resource';
import { Database } from './db/resource';

import {
  apiFn,
  grantSSMAccessForApiFn,
  configureDatabaseEnvForApiFn
} from "./functions/api-function/resource";

import {
  tokenRefresherFn,
  grantSSMAccessForTokenRefresherFn,
  configureDatabaseEnvForTokenRefresherFn
} from "./functions/token-refresher/resource";
import { cofigureScheduledEventSourceForTokenRefresherFn } from './functions/token-refresher/event-source';
import { auth, configCustomAttributes, UserGroup } from './auth/resource';

const backend = defineBackend({
  auth,
  apiFn,
  tokenRefresherFn
});

const authResources = backend.auth.resources;
const apiFnResources = backend.apiFn.resources;
const tokenRefresherFnResources = backend.tokenRefresherFn.resources;

const adminRole = authResources.groups[UserGroup.ADMINS].role;

// extract L1 CfnUserPool resources
const { cfnUserPool } = backend.auth.resources.cfnResources;
configCustomAttributes(cfnUserPool);

const apiStack = backend.createStack("api-stack");
const api = new Api(apiStack, {
    lambda: apiFnResources.lambda,
    userPool: authResources.userPool,
    adminRole,
});

const dbStack = backend.createStack("db-stack");
const db = new Database(dbStack, {
  lambdas: [apiFnResources.lambda, tokenRefresherFnResources.lambda],
});

const tableName = db.table.tableName;

grantSSMAccessForApiFn(apiFnResources.lambda, apiStack);
configureDatabaseEnvForApiFn(apiFnResources.cfnResources.cfnFunction, tableName, dbStack.region);

grantSSMAccessForTokenRefresherFn(tokenRefresherFnResources.lambda, dbStack);
configureDatabaseEnvForTokenRefresherFn(tokenRefresherFnResources.cfnResources.cfnFunction, tableName, dbStack.region);
cofigureScheduledEventSourceForTokenRefresherFn(tokenRefresherFnResources.lambda, dbStack);

// add outputs to the configuration file
backend.addOutput({
  custom: {
    API: {
      [api.name]: {
        endpoint: api.endpoint,
        region: api.region,
        name: api.name,
      },
    },
    DB: {
      table: tableName,
    },
  },
});