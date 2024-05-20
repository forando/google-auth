import { PushSubscription } from 'web-push';
export class PartitionKey {
    constructor(readonly value: string) {
    }

    get (): string {
        return this.value;
    }

    static get name(): string {
        return "PK";
    }

    static fromString(value: string): PartitionKey {
        return new PartitionKey(value);
    }
}

export class SortKey {
    constructor(readonly value: string) {
    }

    get (): string {
        return this.value;
    }

    static get name(): string {
        return "SK";
    }

    static fromString(value: string): SortKey {
        return new SortKey(value);
    }
}

export interface DynamoDBEntity {
    get(): KeysEntity;
}

export type Json = {
    [k: string]: string | undefined;
} | undefined;

export type Data = {
    [key: string]: string
}

export type Keys = {
    PK: string;
    SK: string;
};

export type KeysEntity = {
    PK: string;
    SK: string;
    [k: string]: any;
}

export function generateKeys(pk: PartitionKey, sk: SortKey): Keys {
    return {
        PK: pk.get(),
        SK: sk.get()
    };
}