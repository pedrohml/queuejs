import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsAlphanumeric, IsNotEmpty } from 'class-validator';
import { ConsumerService } from '../services/consumer.service';
import * as consumerWire from '../wire/consumer';
import * as messageWire from '../wire/message';
import * as consumerAdapter from '../adapters/consumer';
import * as messageAdapter from '../adapters/message';

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
  constructor(private readonly consumerService: ConsumerService) {}

  @Post('topics/:topic/register')
  async register(
    @Param() { group, topic }: PathParams,
  ): Promise<consumerWire.Consumer> {
    return this.consumerService
      .register(group, topic)
      .then(consumerAdapter.internalToWire);
  }

  @Put('topics/:topic/commit')
  async commit(
    @Param() { group, topic }: PathParams,
    @Body() { offset }: CommitPayload,
  ): Promise<consumerWire.Consumer> {
    return this.consumerService
      .commit(group, topic, offset)
      .then(consumerAdapter.internalToWire);
  }

  @Get('topics/:topic/messages/:count')
  async consume(
    @Param() { group, topic }: PathParams,
  ): Promise<messageWire.MessageCollection> {
    return this.consumerService
      .consume(group, topic, 256)
      .then(messageAdapter.internalsToWire);
  }

  @Get('topics/:topic/next')
  async consumeNext(
    @Param() { group, topic }: PathParams,
  ): Promise<messageWire.MessageCollection> {
    return this.consumerService
      .consume(group, topic)
      .then(messageAdapter.internalsToWire);
  }
}
