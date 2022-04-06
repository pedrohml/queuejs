import { Body, Controller, Inject, Param, Post, Put } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { IGroupsService } from './groups.service';

class PathParams {
  @IsNotEmpty()
  group: string;
}

class RegisterPayload {
  @IsNotEmpty()
  topic: string;
}

class CommitPayload {
  @IsNotEmpty()
  topic: string;
  
  @Type(() => Number)
  offset: number;
}

@Controller(':group')
export class GroupsController {
  constructor(@Inject(IGroupsService) private readonly groupsService: IGroupsService) {}

  @Post('register')
  register(@Param() { group }: PathParams, @Body() { topic }: RegisterPayload) {
    return this.groupsService.register(group, topic);
  }

  @Put('commit')
  commit(@Param() { group }: PathParams, @Body() { topic, offset }: CommitPayload) {
    return this.groupsService.commit(group, topic, offset);
  }
}
