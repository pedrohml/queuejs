import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TopicsModule } from './topics/topics.module';
import { GroupsModule } from './groups/groups.module';
import routes from './routes';

@Module({
  imports: [
    TopicsModule,
    GroupsModule,
    RouterModule.register(routes)]
})
export class AppModule {}
