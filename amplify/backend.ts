import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

const backend = defineBackend({
  auth,
  data,
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
