import https from 'https';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { Keys, DynamoDBEntity } from './utils';

const ddbClient = new DynamoDBClient({
    region: process.env.TABLE_REGION,
    requestHandler: new NodeHttpHandler( {
        connectionTimeout: 1000,
        requestTimeout: 1000,
        httpsAgent: new https.Agent({ keepAlive: true })
    })
});

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const tableName = process.env.TABLE_NAME;

export async function getEntity(keys: Keys) {
    const params = {
        TableName: tableName,
        Key: keys
    }

    console.log("Params:", params);

    return await ddbDocClient.send(new GetCommand(params));
}

export async function putEntity(entity: DynamoDBEntity) {
    const params = {
        TableName: tableName,
        Item: entity.get()
    }

    return await ddbDocClient.send(new PutCommand(params));
}

export async function deleteEntity(keys: Keys) {
    const params = {
        TableName: tableName,
        Key: keys
    }

    return await ddbDocClient.send(new DeleteCommand(params));
}