import { defineBackend } from '@aws-amplify/backend';
// import { Api } from './api/resource';
// import { Database } from './db/resource';

// import { apiFunction } from "./functions/api-function/resource";
import {auth} from './auth/resource';

defineBackend({
  auth,
  // apiFunction
});

// extract L1 CfnUserPool resources
// const { cfnUserPool } = backend.auth.resources.cfnResources;
// configCustomAttributes(cfnUserPool);
//
// const apiStack = backend.createStack("api-stack");
// const api = new Api(apiStack, {
//     lambda: backend.apiFunction.resources.lambda,
//     userPool: backend.auth.resources.userPool,
// });
//
// const dbStack = backend.createStack("db-stack");
// const db = new Database(dbStack, {
//   lambda: backend.apiFunction.resources.lambda,
// });

// add outputs to the configuration file
// backend.addOutput({
//   custom: {
//     API: {
//       [api.name]: {
//         endpoint: api.endpoint,
//         region: api.region,
//         name: api.name,
//       },
//     },
//     DB: {
//       table: db.table.tableName,
//     },
//   },
// });