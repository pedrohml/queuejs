import { Test, TestingModule } from '@nestjs/testing';
import { ITopicsService, TopicsServiceProvider } from './topics.service';

describe('MessagesService', () => {
  let service: ITopicsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TopicsServiceProvider],
    }).compile();

    service = module.get<ITopicsService>(IMessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
