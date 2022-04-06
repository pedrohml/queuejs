import { Module } from '@nestjs/common';
import { GroupsServiceProvider } from './groups.service';
import { GroupsController } from './groups.controller';

@Module({
  controllers: [GroupsController],
  providers: [new GroupsServiceProvider()]
})
export class GroupsModule {}
