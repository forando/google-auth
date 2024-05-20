import {
    SSMClient,
    PutParameterCommand,
    GetParametersByPathCommand,
    Parameter,
    ParameterType, ParameterTier
} from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient({});

export type WebPushKeys = {
    public: string | undefined;
    private: string | undefined;
};

export type GoogleSecrets = {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
};

export async function getWebPushKeys(appId: string): Promise<WebPushKeys | null> {

    try {
        const params = await getSsmParams(appId);

        if (!params) {
            return null;
        }
        return {
            public: params['WEB_PUSH_PUBLIC_KEY'],
            private: params['WEB_PUSH_PRIVATE_KEY']
        };
    } catch(err) {
        console.log("Cannot get SSM Params:", err);
        return null
    }
}

export async function getRefreshToken(appId: string): Promise<string | null> {

    try {
        const params = await getSsmParams(appId);

        if (!params) {
            return null;
        }
        return params['GOOGLE_REFRESH_TOKEN'];
    } catch(err) {
        console.log("Cannot get SSM Params:", err);
        return null
    }
}

export async function getGoogleSecrets(appId: string): Promise<GoogleSecrets | null> {

    try {
        const params = await getSsmParams(appId);

        if (!params) {
            return null;
        }
        const refreshToken = params['GOOGLE_REFRESH_TOKEN'];
        if(!refreshToken) {
            return null;
        }
        const clientId = params['GOOGLE_CLIENT_ID'];
        if(!clientId) {
            return null;
        }
        const clientSecret = params['GOOGLE_CLIENT_SECRET'];
        if(!clientSecret) {
            return null;
        }
        
        return {clientId, clientSecret, refreshToken};
    } catch(err) {
        console.log("Cannot get SSM Params:", err);
        return null
    }
}

async function getSsmParams(appId: string) {
    const paramPrefix = `/amplify/shared/${appId}/`;

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

export async function putRefreshTokenToSSM(token: string, appId: string) {

    try {
        const params = {
            Name:  `/amplify/shared/${appId}/GOOGLE_REFRESH_TOKEN`,
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