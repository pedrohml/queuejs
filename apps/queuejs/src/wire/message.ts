import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsNumber, IsPositive, IsString, ValidateNested } from "class-validator";

export class Message {
    @IsString()
    data: string;

    topic?: String;
    
    offset?: number;
}

export class MessageCollection {
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => Message)
    messages: Message[];
    
    constructor(messages: Message[] = null) {
        this.messages = messages || [];
    }

    isEmpty(): boolean {
        return this.messages.length === 0;
    }
}

export default { Message, MessageCollection }