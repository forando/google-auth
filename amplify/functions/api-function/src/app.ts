import express from 'express';
import bodyParser from 'body-parser';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import { getRefreshToken, putRefreshTokenToSSM } from "./ssm";

export const app = express();

app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

app.put("/refreshtoken", async function (req, res) {
    if(!req.body) {
        res.status(400).json({ error: "Missing request body", data: {status: "error"} });
        return;
    }
    try {
        const newToken = req.body.token;
        const token = await getRefreshToken();
        if(newToken && newToken !== token) {
            console.log("Updating refresh token");
            await putRefreshTokenToSSM(newToken);
        }
        res.status(200).json({ success: true });
    } catch (err) {
        console.log("Error:", err);
        res.status(500).json({ success: false, error: err, url: req.url, req: req.body });
    }
});