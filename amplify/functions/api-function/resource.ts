import { defineFunction } from "@aws-amplify/backend";
import { CfnFunction } from "aws-cdk-lib/aws-lambda";

export const apiFunction = defineFunction({
    name: "api-function"
});

export const configureDatabaseEnvForFunction = (lambda: CfnFunction, tableName: string) => {
    lambda.addPropertyOverride("Environment.Variables.TABLE_NAME", tableName);
};