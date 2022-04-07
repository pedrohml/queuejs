import { Module } from '@nestjs/common';
import { ProducerService } from '../services/producer.service';
import { ProducerController } from '../controllers/producer.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ProducerController],
  providers: [PrismaService, ProducerService],
})
export class ProducerModule {}
