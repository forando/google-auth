import { defineFunction, secret } from "@aws-amplify/backend";
import {CfnFunction, IFunction} from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam"
import { Stack } from "aws-cdk-lib";

export const apiFn = defineFunction({
    name: "api-function",
    entry: "src/handler.ts",
    environment: {
        APP_ID: secret('APP_ID')
    }
});

export const configureDatabaseEnvForApiFn = (lambda: CfnFunction, tableName: string, tableRegion: string) => {
    lambda.addPropertyOverride("Environment.Variables.TABLE_NAME", tableName);
    lambda.addPropertyOverride("Environment.Variables.TABLE_REGION", tableRegion);
};

export const grantSSMAccessForApiFn = (lambda: IFunction, stack: Stack) => {

    const statement = new iam.PolicyStatement({
        sid: "AllowSSMAccess",
        actions: [
            "ssm:PutParameter",
            "ssm:GetParametersByPath"
        ],
        resources: [`arn:aws:ssm:${stack.region}:${stack.account}:parameter/amplify/shared/*`],
    });


    lambda.addToRolePolicy(statement)
}