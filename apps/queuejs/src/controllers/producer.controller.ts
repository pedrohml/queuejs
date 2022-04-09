import { Controller, Post, Body, Param, HttpStatus, HttpCode } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { ProducerService } from '../services/producer.service';
import { Message, MessageCollection } from '../wire/message.wire';

class PathParams {
  @IsNotEmpty()
  topic: string;
}

@Controller(':topic')
export class ProducerController {
  constructor(private readonly service: ProducerService) {}

  @Post('messages')
  @HttpCode(HttpStatus.ACCEPTED)
  async produce(
    @Param() { topic }: PathParams,
    @Body() { messages }: MessageCollection,
  ) {
    this.service.produce(topic, messages);
  }
}
