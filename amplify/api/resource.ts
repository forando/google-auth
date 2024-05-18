import { Construct } from 'constructs';
import { Stack } from "aws-cdk-lib";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { IRole, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
    AuthorizationType,
    Cors,
    LambdaIntegration,
    RestApi,
} from "aws-cdk-lib/aws-apigateway";

export interface ApiProps {
    lambda: lambda.IFunction;
    userPool: cognito.IUserPool;
    adminRole: IRole;
}

export class Api {
    public readonly endpoint: string;
    public readonly name: string;
    public readonly region: string;

    constructor(scope: Construct, props: ApiProps) {
        // create a new REST API
        const googleAuthApi = new RestApi(scope, "RestApi", {
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
            props.lambda
        );

        // create a new resource path with Cognito authorization
        const refreshTokenPath = googleAuthApi.root.addResource("refreshtoken");
        refreshTokenPath.addMethod("PUT", lambdaIntegration, {
            authorizationType: AuthorizationType.IAM
        });

        const webPushPath = googleAuthApi.root.addResource("webpush");
        const pubKeyPath = webPushPath.addResource("pubkey");
        pubKeyPath.addMethod("GET", lambdaIntegration, {
            authorizationType: AuthorizationType.IAM
        });
        const subscriptionProxy = webPushPath
            .addResource("subscription")
            .addProxy({
                defaultIntegration: lambdaIntegration,
                defaultMethodOptions: {
                    authorizationType: AuthorizationType.IAM
                }
            });
        subscriptionProxy.addMethod("GET");
        subscriptionProxy.addMethod("PUT");
        subscriptionProxy.addMethod("DELETE");

        const apiRestPolicy = new Policy(scope, "RestApiPolicy", {
            statements: [
                new PolicyStatement({
                    actions: ["execute-api:Invoke"],
                    resources: [
                        `${googleAuthApi.arnForExecuteApi("PUT", "/refreshtoken", "*")}`,
                        `${googleAuthApi.arnForExecuteApi("GET", "/webpush/pubkey", "*")}`,
                        `${googleAuthApi.arnForExecuteApi("GET", "/webpush/subscription/*", "*")}`,
                        `${googleAuthApi.arnForExecuteApi("PUT", "/webpush/subscription/*", "*")}`,
                        `${googleAuthApi.arnForExecuteApi("DELETE", "/webpush/subscription/*", "*")}`,
                    ],
                }),
            ],
        });

        props.adminRole.attachInlinePolicy(apiRestPolicy);

        this.endpoint = googleAuthApi.url;
        this.name = googleAuthApi.restApiName;
        this.region = Stack.of(googleAuthApi).region;
    }
}