import { defineBackend } from '@aws-amplify/backend';
import { Api } from './api/resource';
import { Database } from './db/resource';

import {
  apiFunction,
  grantSSMAccess,
  configureDatabaseEnvForFunction
} from "./functions/api-function/resource";
import { auth, configCustomAttributes } from './auth/resource';

const backend = defineBackend({
  auth,
  apiFunction,
});

const apiFnResources = backend.apiFunction.resources;
const authResources = backend.auth.resources;

// extract L1 CfnUserPool resources
const { cfnUserPool } = backend.auth.resources.cfnResources;
configCustomAttributes(cfnUserPool);

const apiStack = backend.createStack("api-stack");
const api = new Api(apiStack, {
    lambda: apiFnResources.lambda,
    userPool: authResources.userPool,
});

const dbStack = backend.createStack("db-stack");
const db = new Database(dbStack, {
  lambda: apiFnResources.lambda,
});

const tableName = db.table.tableName;

grantSSMAccess(apiFnResources.lambda, apiStack);
configureDatabaseEnvForFunction(apiFnResources.cfnResources.cfnFunction, tableName);

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