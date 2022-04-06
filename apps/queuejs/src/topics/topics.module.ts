import { Module } from '@nestjs/common';
import { TopicsServiceProvider } from './topics.service';
import { TopicsController } from './topics.controller';

@Module({
  controllers: [TopicsController],
  providers: [new TopicsServiceProvider()]
})
export class TopicsModule {}
