import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import {Construct} from "constructs";

export interface DbProps {
    lambda: lambda.IFunction;
}

export class Database {
    public readonly table: dynamodb.Table;

    constructor(scope: Construct, props: DbProps) {
        this.table = new dynamodb.Table(scope, 'google-token', {
            partitionKey: {name: 'PK', type: dynamodb.AttributeType.STRING},
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            readCapacity: 5
        });

        this.table.grantReadWriteData(props.lambda);
    }
}