import express from 'express';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import bodyParser from 'body-parser';

const path = "/refreshtoken";

export const app = express();

app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    console.log("Allow-Origin headers set.");
    next();
});

app.get(path, async function (req, res) {
    console.log("GET request received", req.apiGateway?.event.requestContext.identity);
    res.json({ message: "Hello from myFunction test!" });
});