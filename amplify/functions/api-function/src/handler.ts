import type { APIGatewayProxyHandler } from "aws-lambda";
import { getRefreshToken, putRefreshTokenToSSM } from "./ssm";

export const handler: APIGatewayProxyHandler = async (event) => {
    if(!event.body) {
        return {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            },
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
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            },
            body: JSON.stringify({ success: "Refresh token updated", data: {status: "success"} }),
        };
    } catch (err) {
        console.log("Error:", err);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            },
            body: JSON.stringify({ error: err, data: {status: "error"} }),
        };
    }
};