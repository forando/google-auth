import express from 'express';
import bodyParser from 'body-parser';
import { decode } from 'universal-base64url';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import { WebPushSubscription } from './webpush-subscription';
import { getRefreshToken, putRefreshTokenToSSM, getWebPushKeys } from "./ssm";
import { getEntity, putEntity, deleteEntity } from './dynamodb-actions';
import { Keys, PartitionKey, SortKey, generateKeys } from './utils';
import { EntityError } from './entity-error';

const pathWebPushSubscriptions = "/webpush/subscription";
const hashKeyPath = '/:' + PartitionKey.name;
const sortKeyPath = '/:' + SortKey.name;

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

app.get(pathWebPushSubscriptions + hashKeyPath + sortKeyPath, async (req, res) => {
    try {
        console.log("req.params:", req.params);
        const id: string = decode(req.params[SortKey.name]);
        const pk: PartitionKey = WebPushSubscription.generatePk(req.params[PartitionKey.name]);
        const sk: SortKey = WebPushSubscription.generateSk(id);
        const params: Keys = generateKeys(pk, sk);

        const getRes = await getEntity(params);
        console.log(getRes);
        if (getRes.Item) {
            res.json({success: true, url: req.url, data: WebPushSubscription.fromData(getRes.Item).toDto()});
        } else {
            res.json({success: true, url: req.url, data: null});
        }
    } catch (err) {
        res.statusCode = 500;
        console.log("Could not load Subscription:", err);
        res.json({success: false, error: err, url: req.url });
    }
});

app.put(pathWebPushSubscriptions + hashKeyPath, async (req, res) => {
    try {
        let subToPut = null;
        const sub = WebPushSubscription.fromUpdateDto(req.body, req.params[PartitionKey.name]);
        const params: Keys = generateKeys(sub.pk, sub.sk);

        const getRes = await getEntity(params);
        if (getRes.Item) {
            subToPut = WebPushSubscription.fromData(getRes.Item);
            subToPut.updateFrom(sub);
        } else {
            subToPut = sub;
        }

        await putEntity(subToPut);

        res.json({success: true, url: req.url, data: subToPut.toDto()})

    } catch (err) {
        if(err instanceof EntityError) {
            res.statusCode = 400;
        } else {
            res.statusCode = 500;
        }
        console.log("Cannot put a Subscription:", err);
        res.json({success: false, error: err, url: req.url});
    }
});

app.delete(pathWebPushSubscriptions + hashKeyPath + sortKeyPath, async (req, res) => {
    try {
        const id = decode(req.params[SortKey.name])
        const pk = WebPushSubscription.generatePk(req.params[PartitionKey.name]);
        const sk = WebPushSubscription.generateSk(id);
        const params: Keys = generateKeys(pk, sk);

        const delRes = await deleteEntity(params)
        res.json({success: true, url: req.url, data: delRes});
    } catch(err) {
        console.log("Cannot delete an Event:", err);
        res.statusCode = 500;
        res.json({success: false, error: err, url: req.url});
    }
});