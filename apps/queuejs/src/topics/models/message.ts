import { ArrayNotEmpty } from "class-validator";

export class Message {
    constructor(public data: string = '') {}
}

export class MessageCollection {
    @ArrayNotEmpty()
    messages: Message[];
    
    constructor(messages: Message[] = null) {
        this.messages = messages || [];
    }

    isEmpty(): boolean {
        return this.messages.length === 0;
    }
}
