import DB from '@prisma/client';
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsAlphanumeric, IsNotEmpty } from 'class-validator';
import { GroupsService } from './groups.service';

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
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post('topics/:topic/register')
  async register(@Param() { group, topic }: PathParams): Promise<DB.ConsumerGroup> {
    return this.groupsService.register(group, topic);
  }

  @Put('topics/:topic/commit')
  async commit(@Param() { group, topic }: PathParams, @Body() { offset }: CommitPayload): Promise<DB.ConsumerGroup> {
    return this.groupsService.commit(group, topic, offset);
  }

  @Get('topics/:topic/messages/:count')
  async messages(@Param() { group, topic }: PathParams): Promise<DB.Message[]> {
    return this.groupsService.getMessages(group, topic);
  }

  @Get('topics/:topic/next')
  async next(@Param() { group, topic }: PathParams): Promise<DB.Message[]> {
    return this.groupsService.getMessages(group, topic, 1);
  }
}
