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
    get(): Json;
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

export function generateKeys(pk: PartitionKey, sk: SortKey): Keys {
    return {
        PK: pk.get(),
        SK: sk.get()
    };
}