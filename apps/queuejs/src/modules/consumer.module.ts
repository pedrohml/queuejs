import { Module } from '@nestjs/common';
import { ConsumerService } from '../services/consumer.service';
import { ConsumerController } from '../controllers/consumer.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ConsumerController],
  providers: [PrismaService, ConsumerService]
})
export class ConsumerModule {}
