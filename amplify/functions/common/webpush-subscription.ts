import { PushSubscription } from 'web-push';
import { ID } from './id';
import {Json, PartitionKey, SortKey, DynamoDBEntity, Keys} from './utils';
import { EntityError } from './entity-error';

export class WebPushSubscription implements DynamoDBEntity {
    private data: PushSubscription;
    constructor(readonly id: ID, rest: any) {
        if(!rest) {
            throw new EntityError("No rest json");
        }
        const endpoint = rest.endpoint;
        if(!endpoint) {
            throw new EntityError("No rest.endpoint");
        }
        const keys = rest.keys;
        if(!keys) {
            throw new EntityError("No rest.keys");
        }
        const p256dh = keys.p256dh;
        if(!p256dh) {
            throw new EntityError("No rest.keys.p256dh");
        }
        const auth = keys.auth;
        if(!p256dh) {
            throw new EntityError("No rest.keys.auth");
        }
        this.data = rest;
    }

    /**
     * Transforms this entity into a DynamoDB json representation
     */
    get() {
        return {
            ...this.id.keys,
            ...this.data
        }
    }

    get pk(): PartitionKey {
        return this.id.pk
    }

    get sk(): SortKey {
        return this.id.sk
    }

    get subscriptionId() {
        return this.sk.get().substring(WebPushSubscription.SK_PREFIX.length);
    }

    get userId() {
        return this.pk.get().substring(WebPushSubscription.PK_PREFIX.length);
    }

    toDto(): PushSubscription {
        return {
            ...this.data
        }
    }

    updateFrom(subscription: WebPushSubscription) {
        this.data = subscription.data
    }

    static get PK_PREFIX() {
        return "user";
    }

    static get SK_PREFIX() {
        return "webpush_subscription";
    }

    static get partitionKey(): PartitionKey {
        return PartitionKey.fromString(WebPushSubscription.PK_PREFIX);
    }

    static get sortKey(): SortKey {
        return SortKey.fromString(WebPushSubscription.SK_PREFIX);
    }

    static fromData(data : Json): WebPushSubscription {
        if(!data) {
            throw new EntityError('No data!');
        }

        const {id, rest} = ID.parseDynamoDbID(data);

        return new WebPushSubscription(id, rest);
    }

    static fromUpdateDto(dto: Json) {
        if(!dto) {
            throw new EntityError('No dto!');
        }

        if(!dto.endpoint) {
            throw new EntityError('endpoint not defined');
        }
        
        if(!dto.keys) {
            throw new EntityError('keys not defined');
        }

        const pk = WebPushSubscription.partitionKey;
        const sk = WebPushSubscription.sortKey;
        const id = new ID(pk, sk);

        return new WebPushSubscription(id, dto);
    }
}