import type { APIGatewayProxyHandler } from "aws-lambda";
import awsServerlessExpress from "aws-serverless-express";
import { app } from "./app";

const server = awsServerlessExpress.createServer(app);

export const handler: APIGatewayProxyHandler = (event, context) => {
    console.log("event", event);
    return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};