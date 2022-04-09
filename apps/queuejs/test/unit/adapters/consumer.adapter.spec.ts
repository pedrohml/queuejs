import ConsumerAdapter from "apps/queuejs/src/adapters/consumer.adapter";
import * as wire from 'apps/queuejs/src/wire/consumer.wire'
import db from '@prisma/client';

describe('ConsumerAdapter', () => {
    it('internalToWire', () => {
        let expectedConsumer: wire.Consumer = { group: 'group1', topic: 'topic1', offset: 3 };
        let sampleConsumer = Object.assign({ id: 1}, expectedConsumer);
        expect(ConsumerAdapter.internalToWire(sampleConsumer as db.Consumer)).toStrictEqual(expectedConsumer);
    });
});