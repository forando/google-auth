import express from 'express';
import bodyParser from 'body-parser';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import { getRefreshToken, putRefreshTokenToSSM, getWebPushKeys } from "./ssm";

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
        res.statusCode = 400;
        res.json({ error: "Missing request body", data: {status: "error"} });
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
        res.statusCode = 500;
        res.json({ success: false, error: err, url: req.url });
    }
});

app.get("/webpush/pubkey", async (req, res) => {
    try {
        const keys = await getWebPushKeys();
        if (!keys) {
            res.statusCode = 500;
            res.json({success: false, error: "Cannot get web push keys", url: req.url });
            return;
        }
        if (!keys.public) {
            res.statusCode = 500;
            res.json({success: false, error: "Cannot get public web push key", url: req.url });
            return;
        }
        res.json({success: true, url: req.url, data: keys.public})
    } catch (err) {
        console.log("Cannot get public web push key:", err);
        res.statusCode = 500;
        res.json({success: false, error: err, url: req.url });
    }
});