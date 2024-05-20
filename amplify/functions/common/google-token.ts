import { ID } from "./id";
import { DynamoDBEntity } from "./utils";

export class GoogleToken implements DynamoDBEntity {
    constructor(readonly  id: ID, readonly token: string) {
    }
    get () {
        return {
            ...this.id.keys,
            token: this.token
        }
    }
}