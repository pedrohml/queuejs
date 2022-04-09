import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsAlphanumeric, IsNotEmpty } from 'class-validator';
import { ConsumerService } from '../services/consumer.service';
import * as consumerWire from '../wire/consumer.wire';
import * as messageWire from '../wire/message.wire';
import { ConsumerAdapter } from '../adapters/consumer.adapter';
import { MessageAdapter } from '../adapters/message.adapter';

class PathParams {
  @IsNotEmpty()
  @IsAlphanumeric()
  group: string;

  @IsNotEmpty()
  @IsAlphanumeric()
  topic: string;
}

class CommitPayload {
  @Type(() => Number)
  offset: number;
}

@Controller(':group')
export class ConsumerController {
  constructor(private readonly service: ConsumerService) {}

  @Post('topics/:topic/register')
  async register(
    @Param() { group, topic }: PathParams,
  ): Promise<consumerWire.Consumer> {
    return this.service
      .register(group, topic)
      .then(ConsumerAdapter.internalToWire);
  }

  @Put('topics/:topic/commit')
  async commit(
    @Param() { group, topic }: PathParams,
    @Body() { offset }: CommitPayload,
  ): Promise<consumerWire.Consumer> {
    return this.service
      .commit(group, topic, offset)
      .then(ConsumerAdapter.internalToWire);
  }

  @Get('topics/:topic/messages/:count')
  async consume(
    @Param() { group, topic }: PathParams,
  ): Promise<messageWire.MessageCollection> {
    return this.service
      .consume(group, topic, 256)
      .then(MessageAdapter.internalsToWire);
  }

  @Get('topics/:topic/next')
  async consumeNext(
    @Param() { group, topic }: PathParams,
  ): Promise<messageWire.MessageCollection> {
    return this.service
      .consume(group, topic)
      .then(MessageAdapter.internalsToWire);
  }
}
