import * as db from '@prisma/client'
import * as wire from '../wire/message'

export function internalToWire(internal: db.Message): wire.Message {
    return { topic: internal.topic, data: internal.data, offset: internal.offset } as wire.Message;
}

export function internalsToWire(internals: db.Message[]): wire.MessageCollection {
    let wires = internals.map(internalToWire)
    return new wire.MessageCollection(wires);
}