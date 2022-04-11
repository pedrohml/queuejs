import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsAlphanumeric, IsNotEmpty, IsPositive } from 'class-validator';
import { ConsumerService } from '../services/consumer.service';
import * as consumerWire from '../wire/consumer.wire';
import * as messageWire from '../wire/message.wire';
import { ConsumerAdapter } from '../adapters/consumer.adapter';
import { MessageAdapter } from '../adapters/message.adapter';
import db from '@prisma/client';

class PathParams {
  @IsNotEmpty()
  @IsAlphanumeric()
  group: string;

  @IsNotEmpty()
  @IsAlphanumeric()
  topic: string;
}

class PathWithCountParams extends PathParams {
  @IsPositive()
  @Type(() => Number)
  count: number;
}

class CommitPayload {
  @Type(() => Number)
  offset: number;
}

@Controller(':group')
export class ConsumerController {
  constructor(private readonly service: ConsumerService) {}

  private sendGroupNotRegisteredError(group: string, topic: string) {
    throw new HttpException(
      `There is not a consumer group '${group}' registered for the topic '${topic}'`,
      HttpStatus.BAD_REQUEST,
    );
  }

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
    const consumer: db.Consumer = await this.service.commit(group, topic, offset);
    const isConflict: boolean = consumer.offset != offset;
    const wire = ConsumerAdapter.internalToWire(consumer);

    if (!isConflict)
      return wire;
    else
      throw new HttpException(wire, HttpStatus.CONFLICT);
  }

  @Get('topics/:topic/messages/:count')
  async consume(
    @Param() { group, topic, count }: PathWithCountParams,
  ): Promise<messageWire.MessageCollection> {
    return this.service
      .consume(group, topic, count)
      .then((messages) =>
        messages !== null
          ? messages
          : this.sendGroupNotRegisteredError(group, topic),
      )
      .then(MessageAdapter.internalsToWire);
  }

  @Get('topics/:topic/next')
  async consumeNext(
    @Param() { group, topic }: PathParams,
  ): Promise<messageWire.MessageCollection> {
    return this.service
      .consume(group, topic)
      .then((messages) =>
        messages !== null
          ? messages
          : this.sendGroupNotRegisteredError(group, topic),
      )
      .then(MessageAdapter.internalsToWire);
  }
}
