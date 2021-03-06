import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ProducerService } from '../services/producer.service';
import { MessageCollection } from '../wire/message.wire';

class PathParams {
  @ApiProperty()
  @IsNotEmpty()
  topic: string;
}

@Controller(':topic')
export class ProducerController {
  constructor(private readonly service: ProducerService) {}

  @Post('messages')
  async produce(
    @Param() { topic }: PathParams,
    @Body() { messages }: MessageCollection,
  ) {
    await this.service.produce(topic, messages);
  }
}
