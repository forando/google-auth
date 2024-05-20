import { PartitionKey, SortKey, Json, Keys } from './utils';

export class ID {
    constructor(readonly pk: PartitionKey, readonly sk: SortKey) {
    }

    get keys(): Keys {
        return {
            PK: this.pk.get(),
            SK: this.sk.get()
        };
    }

    static parseDynamoDbID(data: Json): DataWithID {
        if(!data) {
            throw new Error('No data!');
        }

        const {PK, SK, ...rest} = data;
        if(!PK) {
            throw new Error('No PK!');
        }
        if(!SK) {
            throw new Error('No SK!');
        }

        const id = new ID(PartitionKey.fromString(PK), SortKey.fromString(SK));

        return {id, rest};
    }
}

export type DataWithID = {
    id: ID;
    rest: Json;
};