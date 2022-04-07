import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsString, ValidateNested } from "class-validator";

export class Message {
    @IsString()
    data: string;
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
