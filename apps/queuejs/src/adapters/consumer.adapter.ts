import * as db from '@prisma/client';
import * as wire from '../wire/consumer.wire';
export class ConsumerAdapter {
  static internalToWire(internal: db.Consumer) {
    return {
      group: internal.group,
      topic: internal.topic,
      offset: internal.offset,
    } as wire.Consumer;
  }
}

export default ConsumerAdapter;
