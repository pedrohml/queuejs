import { Module } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TopicsController],
  providers: [PrismaService, TopicsService]
})
export class TopicsModule {}
