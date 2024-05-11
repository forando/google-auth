import { defineFunction } from "@aws-amplify/backend";

export const apiFunction = defineFunction({
    name: "api-function",
    entry: "./src/index.ts",
});