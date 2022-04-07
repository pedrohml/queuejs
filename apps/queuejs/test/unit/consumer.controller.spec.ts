import { Test, TestingModule } from '@nestjs/testing';
import { ConsumerController } from '../../src/controllers/consumer.controller';
import { ConsumerService } from '../../src/services/consumer.service';

describe('ConsumerController', () => {
  let controller: ConsumerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsumerController],
      providers: [ConsumerService],
    }).compile();

    controller = module.get<ConsumerController>(ConsumerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
