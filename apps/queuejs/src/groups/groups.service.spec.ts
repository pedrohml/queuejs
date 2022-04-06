import { Test, TestingModule } from '@nestjs/testing';
import { GroupsServiceProvider, IGroupsService } from './groups.service';

describe('ConsumersService', () => {
  let service: IGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [new GroupsServiceProvider],
    }).compile();

    service = module.get<IGroupsService>(IGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
