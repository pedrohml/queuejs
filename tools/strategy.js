class Strategy {
    constructor(consumeReqFn, commitReqFn) {
        this.consumeReqFn = consumeReqFn;
        this.commitReqFn = commitReqFn;
    }

    async consumeMessages() {
        const consumeResponse = await this.consumeReqFn();
        console.assert(consumeResponse.statusCode === 200, "Couldn't consume messages with success");
        const docResponse = JSON.parse(consumeResponse.text);
        return docResponse.messages;
    }

    async commitOffset(messages) {
        let maxOffset = 0;

        for (let message of messages)
            maxOffset = Math.max(message.offset, maxOffset);

        const commitResponse = await this.commitReqFn(maxOffset);
        console.assert([200, 409].indexOf(commitResponse.statusCode) >= 0, "Couldn't commit with success");
        return commitResponse
    }

    async consume(handlerFn) {
        throw new ReferenceError('Strategy class cannot be instantiated.');
    }
}

class AtMostOnceStrategy extends Strategy {
    constructor(consumeReqFn, commitFn) {
        super(consumeReqFn, commitFn);
    }

    async consume(handlerFn) {
        const messages = await this.consumeMessages();

        if (messages.length) {
            await this.commitOffset(messages);
            handlerFn(messages);
        }
    }
}

class AtLeastOnceStrategy extends Strategy {
    constructor(consumeReqFn, commitFn) {
        super(consumeReqFn, commitFn);
    }

    async consume(handlerFn) {
        const messages = await this.consumeMessages();

        if (messages.length) {
            handlerFn(messages);
            await this.commitOffset(messages);
        }
    }
}

module.exports = {
    Strategy, AtMostOnceStrategy, AtLeastOnceStrategy
}