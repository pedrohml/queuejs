import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';

export class Message {
  @ApiProperty()
  @IsString()
  data: string;

  topic?: string;

  offset?: number;
}

export class MessageCollection {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Message)
  @ApiProperty({ type: [Message] })
  messages: Message[];

  constructor(messages: Message[] = null) {
    this.messages = messages || [];
  }

  isEmpty(): boolean {
    return this.messages.length === 0;
  }
}
