import { Test, TestingModule } from '@nestjs/testing';
import db from '@prisma/client';
import { PrismaService } from 'apps/queuejs/src/prisma.service';
import { ProducerService } from 'apps/queuejs/src/services/producer.service';

describe('ProducerService', () => {
  let service: ProducerService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, ProducerService],
    }).compile();

    service = module.get<ProducerService>(ProducerService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  async function assertProduce(oldTopicDB: db.Topic | void, newTopicDB: db.Topic) {
    let updatedTopic = Object.assign({}, newTopicDB, oldTopicDB);

    let message1 = { data: '123' };
    let message2 = { data: '456' };

    let createAttrs1 = Object.assign({topic: 'topic1', offset: 1}, message1);
    let createAttrs2 = Object.assign({topic: 'topic1', offset: 2}, message2);

    let createdMessage1 = Object.assign({ id: 1 }, message1, createAttrs1);
    let createdMessage2 = Object.assign({ id: 2 }, message2, createAttrs2);

    prisma.topic.findUnique = jest.fn().mockResolvedValue(oldTopicDB);
    prisma.topic.upsert = jest.fn().mockReturnValue(updatedTopic);
    prisma.message.create = jest.fn().mockReturnValueOnce(createdMessage1).mockReturnValueOnce(createdMessage2);
    prisma.$transaction = jest.fn();

    await service.produce('topic1', [message1, message2]);

    expect(prisma.topic.findUnique).toBeCalledWith({ where: { topic: 'topic1' }});
    expect(prisma.topic.upsert).toBeCalledWith({ where: { topic: 'topic1' }, create: { topic: 'topic1', last_offset: 2 }, update: { last_offset: 2 }});
    expect(prisma.message.create).toBeCalledTimes(2);
    expect(prisma.message.create).toBeCalledWith({ data: createAttrs1 });
    expect(prisma.message.create).toBeCalledWith({ data: createAttrs2 });

    expect(prisma.$transaction).toBeCalledWith([updatedTopic, createdMessage1, createdMessage2]);
  }

  describe('produce', () => {
    it('when topic info already exists', async () => {
      let oldTopic = { topic: 'topic1', last_offset: 0 };
      let newTopic = Object.assign({ last_offset: 2 }, oldTopic);
  
      await assertProduce(oldTopic, newTopic);
    });
  
    it('when topic info does not exists', async () => {
      let newTopic: db.Topic = { topic: 'topic1', last_offset: 2 };
  
      await assertProduce(null, newTopic);
    });

  })
  
});
