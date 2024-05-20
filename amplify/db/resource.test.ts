import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {Database} from "./resource";

test('should create DynamoDB table', () => {
    const stack = new cdk.Stack();
    new Database(stack, {
        lambdas: [new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'hello.handler',
            code: lambda.Code.fromAsset('functions/api-function'),
        })]
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
});