import type { APIGatewayProxyHandler } from "aws-lambda";
import { getRefreshToken } from "./ssm";

export const handler: APIGatewayProxyHandler = async (event) => {
    console.log("event", event.body);
    const refreshToken = await getRefreshToken();
    const result = {refreshToken, tableName: process.env.TABLE_NAME};
    return {
        statusCode: 200,
        // Modify the CORS settings below to match your specific requirements
        headers: {
            "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
            "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
        },
        body: JSON.stringify(result),
    };
};