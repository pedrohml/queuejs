import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ProducerModule } from './modules/producer.module';
import { ConsumerModule } from './modules/consumer.module';
import routes from './routes';

@Module({
  imports: [
    ProducerModule,
    ConsumerModule,
    RouterModule.register(routes)]
})
export class AppModule {}
