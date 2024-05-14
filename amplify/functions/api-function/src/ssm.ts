import {
    SSMClient,
    PutParameterCommand,
    GetParametersByPathCommand,
    Parameter,
    ParameterType, ParameterTier
} from '@aws-sdk/client-ssm';
// import { env } from '$amplify/env/api-function';

const ssmClient = new SSMClient({});

export async function getRefreshToken() {

    try {
        const params = await getSsmParams();

        if (!params) {
            return null;
        }
        return params['GOOGLE_REFRESH_TOKEN'];
    } catch(err) {
        console.log("Cannot get SSM Params:", err);
        return null
    }
}

async function getSsmParams() {
    const paramPrefix = `/amplify/shared/${process.env.APP_ID}/`;

    console.log("trying to get params with prefix:", paramPrefix);

    const { Parameters } = await ssmClient.send(
        new GetParametersByPathCommand({
            Path: paramPrefix,
            WithDecryption: true,
        })
    );

    type SsmParams = {[k: string]: string;};

    return Parameters?.reduce((acc: SsmParams, param: Parameter) => {
        const name = param.Name ?? 'prefix/unexpected';
        const key = name.split('/').pop() ?? 'unexpected'
        acc[key] = param.Value ?? 'unexpected';
        return acc;
    }, {});
}

export async function putRefreshTokenToSSM(token: string) {

    try {
        const params = {
            Name:  `/amplify/shared/${process.env.APP_ID}/GOOGLE_REFRESH_TOKEN`,
            Value: token,
            Overwrite: true,
            Tags: [],
            Tier: ParameterTier.STANDARD,
            Type: ParameterType.SECURE_STRING
        };
        await ssmClient.send(new PutParameterCommand(params));
    } catch(err) {
        console.log("Cannot put SSM Params:", err);
    }
}