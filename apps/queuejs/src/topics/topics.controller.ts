import { Controller, Post, Body, Param } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { TopicsService } from './topics.service';
import { MessageCollection } from './models/message';

class PathParams {
  @IsNotEmpty()
  topic: string;
}

@Controller(':topic')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post('messages')
  async produce(@Param() params: PathParams, @Body() messageCollection: MessageCollection) {
    this.topicsService.produce(params.topic, messageCollection.messages);
  }
}
