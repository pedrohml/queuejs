class Strategy {
    constructor(api, topic, group, handlerFn) {
        this.api = api;
        this.topic = topic;
        this.group = group;
        this.handlerFn = handlerFn;
    }

    async consumeMessages() {
        const consumeResponse = await this.api.consume(this.group, this.topic);
        const docResponse = JSON.parse(consumeResponse.text);
        return docResponse.messages;
    }

    async commitOffset(messages) {
        let maxOffset = 0;

        for (let message of messages)
            maxOffset = Math.max(message.offset, maxOffset);

        return await this.api.commit(this.group, this.topic, maxOffset);
    }

    async consume() {
        throw new ReferenceError('Strategy class cannot be instantiated.');
    }
}

class AtMostOnceStrategy extends Strategy {
    constructor(...args) {
        super(...args);
    }

    async consume() {
        const messages = await this.consumeMessages();

        if (messages.length > 0) {
            let commitReponse = await this.commitOffset(messages);
            if (commitReponse.statusCode === 200)
                this.handlerFn(messages);
        }
    }
}

class AtLeastOnceStrategy extends Strategy {
    constructor(...args) {
        super(...args);
    }

    async consume() {
        const messages = await this.consumeMessages();

        if (messages.length > 0) {
            this.handlerFn(messages);
            await this.commitOffset(messages);
        }
    }
}

module.exports = {
    Strategy, AtMostOnceStrategy, AtLeastOnceStrategy
}