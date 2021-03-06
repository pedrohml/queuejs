import MessageAdapter from 'apps/queuejs/src/adapters/message.adapter';
import * as wire from 'apps/queuejs/src/wire/message.wire';
import db from '@prisma/client';

describe('MessageAdapter', () => {
  it('internalToWire', () => {
    const wireMessage: wire.Message = {
      data: '123',
      topic: 'topic1',
      offset: 3,
    } as wire.Message;
    const internalMessage = Object.assign({ id: 1 }, wireMessage);
    expect(
      MessageAdapter.internalToWire(internalMessage as db.Message),
    ).toStrictEqual(wireMessage);
  });

  it('internalsToWire', () => {
    const wireMessage1: wire.Message = {
      data: '123',
      topic: 'topic1',
      offset: 3,
    } as wire.Message;
    const wireMessage2: wire.Message = {
      data: '456',
      topic: 'topic1',
      offset: 4,
    } as wire.Message;
    const internalMessage1 = Object.assign(
      { id: 1 },
      wireMessage1,
    ) as db.Message;
    const internalMessage2 = Object.assign(
      { id: 3 },
      wireMessage2,
    ) as db.Message;
    expect(
      MessageAdapter.internalsToWire([internalMessage1, internalMessage2]),
    ).toStrictEqual(new wire.MessageCollection([wireMessage1, wireMessage2]));
  });
});
