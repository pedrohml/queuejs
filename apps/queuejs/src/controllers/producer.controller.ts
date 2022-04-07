import { Controller, Post, Body, Param } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { ProducerService } from '../services/producer.service';
import { MessageCollection } from '../wire/message';

class PathParams {
  @IsNotEmpty()
  topic: string;
}

@Controller(':topic')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Post('messages')
  async produce(@Param() params: PathParams, @Body() messageCollection: MessageCollection) {
    this.producerService.produce(params.topic, messageCollection.messages);
  }
}
