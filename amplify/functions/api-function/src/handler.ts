import type { APIGatewayProxyHandler } from "aws-lambda";
import { getRefreshToken, putRefreshTokenToSSM } from "./ssm";

export const handler: APIGatewayProxyHandler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
    };

    if(!event.body) {
        return {
            headers,
            statusCode: 400,
            body: JSON.stringify({ error: "Missing request body" }),
        };
    }

    try {
        const newToken = JSON.parse(event.body).token;
        const token = await getRefreshToken();
        if(newToken && newToken !== token) {
            console.log("Updating refresh token");
            await putRefreshTokenToSSM(newToken);
        }
        return {
            headers,
            statusCode: 200,
            body: JSON.stringify({ success: "Refresh token updated", data: {status: "success"} }),
        };
    } catch (err) {
        console.log("Error:", err);
        return {
            headers,
            statusCode: 500,
            body: JSON.stringify({ error: err, data: {status: "error"} }),
        };
    }
};