import {IFunction} from "aws-cdk-lib/aws-lambda";
import {Duration, Stack} from "aws-cdk-lib";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";


export const cofigureScheduledEventSourceForTokenRefresherFn = (lambda: IFunction, stack: Stack) => {
    const scheduledRule = new events.Rule(stack, "TokenRefresherScheduledRule", {
        schedule: events.Schedule.rate(Duration.minutes(45))
    });

    scheduledRule.addTarget(new targets.LambdaFunction(lambda));
};