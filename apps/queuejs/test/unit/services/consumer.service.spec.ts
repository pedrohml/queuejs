import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'apps/queuejs/src/prisma.service';
import { ConsumerService } from 'apps/queuejs/src/services/consumer.service';
import db from '@prisma/client';
import { HttpException } from '@nestjs/common';

describe('ConsumerService', () => {
  let service: ConsumerService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, ConsumerService],
    }).compile();

    service = module.get<ConsumerService>(ConsumerService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('register', () => {
    it('when consumer group already exists', async () => {
      const sampleConsumer: db.Consumer = { id: 1, group: 'group1', topic: 'topic1', offset: 5 };
      
      prisma.consumer.findFirst = jest.fn().mockResolvedValue(sampleConsumer);
      prisma.consumer.update = jest.fn();
      prisma.consumer.create = jest.fn();
      
      expect(await service.register('group1', 'topic1')).toBe(sampleConsumer);
  
      expect(prisma.consumer.findFirst).toBeCalledWith({ where: { group: 'group1', topic: 'topic1' }});
      expect(prisma.consumer.create).not.toBeCalled();
      expect(prisma.consumer.update).not.toBeCalled();
    });
  
    it('when consumer group does not exists', async () => {
      const createAttrs = { group: 'group1', topic: 'topic1', offset: 0 };
      const createdConsumer: db.Consumer = Object.assign({ id: 1 }, createAttrs);
      
      prisma.consumer.findFirst = jest.fn().mockResolvedValue(null);
      prisma.consumer.update = jest.fn();
      prisma.consumer.create = jest.fn().mockResolvedValue(createdConsumer);
  
      expect(await service.register('group1', 'topic1')).toBe(createdConsumer);
      expect(prisma.consumer.findFirst).toBeCalledWith({ where: { group: 'group1', topic: 'topic1' }});
      expect(prisma.consumer.update).not.toBeCalled();
      expect(prisma.consumer.create).toBeCalledWith({ data: createAttrs });
    });  
  });

  describe('commit', () => {
    it('when consumer group exists', async () => {
      const sampleConsumer: db.Consumer = { id: 2, group: 'group1', topic: 'topic1', offset: 4 };
      const updateAttrs = { offset: 5 };
      const updatedConsumer: db.Consumer = Object.assign({}, sampleConsumer, updateAttrs);
  
      prisma.consumer.findFirst = jest.fn().mockResolvedValue(sampleConsumer);
      prisma.consumer.update = jest.fn().mockResolvedValue(updatedConsumer);
      prisma.consumer.create = jest.fn();
  
      expect(await service.commit('group1', 'topic1', updateAttrs.offset)).toBe(updatedConsumer);
  
      expect(prisma.consumer.create).not.toBeCalled();
      expect(prisma.consumer.update).toBeCalledWith({ where: { id: 2 }, data: updateAttrs });
    });
  
    it('when consumer group does not exists', async () => {
      const createAttrs = { group: 'group1', topic: 'topic1', offset: 4 };
      const createdConsumer: db.Consumer = Object.assign({ id: 2 }, createAttrs);
  
      prisma.consumer.findFirst = jest.fn().mockResolvedValue(null);
      prisma.consumer.update = jest.fn()
      prisma.consumer.create = jest.fn().mockResolvedValue(createdConsumer);
  
      expect(await service.commit('group1', 'topic1', createdConsumer.offset)).toBe(createdConsumer);
  
      expect(prisma.consumer.update).not.toBeCalled();
      expect(prisma.consumer.create).toBeCalledWith({ data: createAttrs });
    });
  });

  describe('consume', () => {
    it('succeed when consumer group exists', async () => {
      const consumerDB: db.Consumer = { id: 2, group: 'group1', topic: 'topic1', offset: 3 };
      const messageDB1: db.Message = { id: 5, data: '123', topic: 'topic1', offset: 12 };
      const messageDB2: db.Message = { id: 6, data: '456', topic: 'topic1', offset: 13 };
      prisma.consumer.findFirst = jest.fn().mockResolvedValue(consumerDB);
      prisma.message.findMany = jest.fn().mockResolvedValue([messageDB1, messageDB2]);

      expect(await service.consume('group1', 'topic1', 3)).toStrictEqual([messageDB1, messageDB2]);
    });

    it('fail when consumer group does not exist', async () => {
      prisma.consumer.findFirst = jest.fn().mockResolvedValue(null);
      prisma.message.findMany = jest.fn();

      expect(service.consume('group1', 'topic1', 3)).rejects.toThrowError(HttpException);

      expect(prisma.message.findMany).toBeCalledTimes(0);
    });
  });
});
