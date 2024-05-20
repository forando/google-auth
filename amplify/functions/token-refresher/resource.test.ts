import {Template} from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {cofigureScheduledEventSourceForTokenRefresherFn} from "./event-source";

test('should configure scheduled rule to invoke the function', () => {
    const stack = new cdk.Stack();
    const fn = new lambda.Function(stack, 'TestFunction', {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'hello.handler',
        code: lambda.Code.fromAsset('functions/token-refresher'),
    });

    cofigureScheduledEventSourceForTokenRefresherFn(fn, stack);

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::Events::Rule', 1);
    template.hasResourceProperties('AWS::Events::Rule', {
        "ScheduleExpression":"rate(45 minutes)",
        "State":"ENABLED"
    });
    template.hasResourceProperties("AWS::Lambda::Permission", {
        "Action":"lambda:InvokeFunction",
        "Principal":"events.amazonaws.com",
    });
});