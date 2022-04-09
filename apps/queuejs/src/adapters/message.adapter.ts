import * as db from '@prisma/client';
import * as wire from '../wire/message.wire';
export class MessageAdapter {
  static internalToWire(internal: db.Message): wire.Message {
    return {
      topic: internal.topic,
      data: internal.data,
      offset: internal.offset,
    } as wire.Message;
  }
  
  static internalsToWire(internals: db.Message[]): wire.MessageCollection {
    const wires = internals.map(MessageAdapter.internalToWire);
    return new wire.MessageCollection(wires);
  }
}

export default MessageAdapter;