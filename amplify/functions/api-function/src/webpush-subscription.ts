import { ID } from './id';
import { Json, PartitionKey, SortKey, DynamoDBEntity } from './utils';
import { EntityError } from './entity-error';

export class WebPushSubscription implements DynamoDBEntity {
    private rest: Json;
    constructor(readonly id: ID, rest: Json) {
        this.rest = rest;
    }

    /**
     * Transforms this entity into a DynamoDB json representation
     */
    get() {
        return {
            ...this.id.keys,
            ...this.rest
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

    toDto(): Json {
        return {
            ...this.rest
        }
    }

    updateFrom(subscription: WebPushSubscription) {
        this.rest = subscription.rest
    }

    static get PK_PREFIX() {
        return "user";
    }

    static get SK_PREFIX() {
        return "webpush_subscription";
    }

    static generatePk(userId: string | undefined): PartitionKey {
        if(!userId) {
            throw new EntityError('No userId!');
        }
        return PartitionKey.fromString(`${WebPushSubscription.PK_PREFIX}_${userId}`);
    }

    static generateSk(subscriptionId: string | undefined): SortKey {
        if(!subscriptionId) {
            throw new EntityError('No subscriptionId!');
        }
        return SortKey.fromString(`${WebPushSubscription.SK_PREFIX}_${subscriptionId}`);
    }

    static fromData(data : Json): WebPushSubscription {
        if(!data) {
            throw new EntityError('No data!');
        }

        const {id, rest} = ID.parseDynamoDbID(data);

        return new WebPushSubscription(id, rest);
    }

    static fromUpdateDto(dto: Json, userId: string | undefined) {
        if(!dto) {
            throw new EntityError('No dto!');
        }

        if(!userId) {
            throw new EntityError('userId not defined');
        }

        const endpoint = dto.endpoint;

        if(!endpoint) {
            throw new EntityError('endpoint not defined');
        }

        const subscriptionId = endpoint.split("/").pop();

        if(!subscriptionId) {
            throw new EntityError('subscriptionId not defined');
        }

        const pk = WebPushSubscription.generatePk(userId);
        const sk = WebPushSubscription.generateSk(subscriptionId);
        const id = new ID(pk, sk);

        return new WebPushSubscription(id, dto);
    }
}