import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsNotEmpty, Max } from 'class-validator';
import { ITopicsService } from './topics.service';
import { MessageCollection } from './models/message';

class PathParams {
  @IsNotEmpty()
  topic: string;
}

class PathParamsWithCount extends PathParams {
  @Max(256)
  @Type(() => Number)
  count: number;
}

@Controller(':topic')
export class TopicsController {
  constructor(@Inject(ITopicsService) private readonly topicsService: ITopicsService) {}

  @Post('messages')
  produce(@Param() params: PathParams, @Body() messageCollection: MessageCollection) {
    console.log(params);
    this.topicsService.produce(params.topic, messageCollection);
  }
  
  @Get('messages/:count')
  consume(@Param() params: PathParamsWithCount) {
    console.log(params);
    return this.topicsService.consume(params.topic, params.count);
  }

  @Get('messages')
  consumeNext(@Param() params: PathParams) {
    console.log(params);
    return this.topicsService.consumeNext(params.topic);
  }
}
