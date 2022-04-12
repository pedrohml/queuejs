import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'apps/queuejs/src/prisma.service';
import { ConsumerService } from 'apps/queuejs/src/services/consumer.service';
import db from '@prisma/client';

describe('ConsumerService', () => {
  let service: ConsumerService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, ConsumerService],
    }).compile();

    service = module.get<ConsumerService>(ConsumerService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('register', () => {
    it('when consumer group already exists', async () => {
      const sampleConsumer: db.Consumer = {
        id: 1,
        group: 'group1',
        topic: 'topic1',
        offset: 5,
      };

      prisma.consumer.findFirst = jest.fn().mockResolvedValue(sampleConsumer);
      prisma.consumer.update = jest.fn();
      prisma.consumer.create = jest.fn();

      expect(await service.register('group1', 'topic1')).toBe(sampleConsumer);

      expect(prisma.consumer.findFirst).toBeCalledWith({
        where: { group: 'group1', topic: 'topic1' },
      });
      expect(prisma.consumer.create).not.toBeCalled();
      expect(prisma.consumer.update).not.toBeCalled();
    });

    it('when consumer group does not exists', async () => {
      const createAttrs = { group: 'group1', topic: 'topic1', offset: 0 };
      const createdConsumer: db.Consumer = Object.assign(
        { id: 1 },
        createAttrs,
      );

      prisma.consumer.findFirst = jest.fn().mockResolvedValue(null);
      prisma.consumer.upsert = jest.fn().mockResolvedValue(createdConsumer);

      expect(await service.register('group1', 'topic1')).toStrictEqual(createdConsumer);
      expect(prisma.consumer.findFirst).toBeCalledWith({
        where: { group: 'group1', topic: 'topic1' },
      });
      expect(prisma.consumer.upsert).toBeCalledWith({
        where: { group_topic: { group: 'group1', topic: 'topic1' } },
        create: createAttrs,
        update: { offset: 0 } });
    });
  });

  describe('commit', () => {
    it('when consumer group exists', async () => {
      const sampleConsumer: db.Consumer = {
        id: 2,
        group: 'group1',
        topic: 'topic1',
        offset: 4,
      };
      const updateAttrs = { offset: 5 };
      const updatedConsumer: db.Consumer = Object.assign(
        {},
        sampleConsumer,
        updateAttrs,
      );

      prisma.consumer.findFirst = jest.fn().mockResolvedValue(sampleConsumer);
      prisma.consumer.upsert = jest.fn().mockResolvedValue(updatedConsumer);

      expect(await service.commit('group1', 'topic1', updateAttrs.offset))
        .toStrictEqual(updatedConsumer);

      expect(prisma.consumer.upsert).toBeCalledTimes(1);
    });

    it('when consumer group does not exists', async () => {
      const createAttrs = { group: 'group1', topic: 'topic1', offset: 4 };
      const createdConsumer: db.Consumer = Object.assign(
        { id: 2 },
        createAttrs,
      );

      prisma.consumer.findFirst = jest.fn().mockResolvedValue(null);
      prisma.consumer.upsert = jest.fn().mockResolvedValue(createdConsumer);

      expect(
        await service.commit('group1', 'topic1', createdConsumer.offset),
      ).toBe(createdConsumer);

      expect(prisma.consumer.upsert).toBeCalledTimes(1);
    });

    it('when tries to rollback commit respond with existing consumer', async () => {
      const existingConsumer: db.Consumer = {
        id: 2,
        group: 'group1',
        topic: 'topic1',
        offset: 4,
      };
      const updateAttrs = { offset: 5 };
      const updatedConsumer = Object.assign({}, updateAttrs, existingConsumer);

      prisma.consumer.findFirst = jest.fn().mockResolvedValue(existingConsumer);
      prisma.consumer.upsert = jest.fn();

      // not commiting with offset less than or equal 4
      expect(await service.commit('group1', 'topic1', 4)).toStrictEqual(
        existingConsumer,
      );
      expect(await service.commit('group1', 'topic1', 3)).toStrictEqual(
        existingConsumer,
      );

      expect(prisma.consumer.upsert).not.toBeCalled();
      expect(prisma.consumer.findFirst).toBeCalledTimes(2);

      prisma.consumer.upsert = jest.fn().mockResolvedValue(updatedConsumer);

      // commiting with offset greater than 4
      expect(await service.commit('group1', 'topic1', 5)).toStrictEqual(
        updatedConsumer,
      );

      expect(prisma.consumer.upsert).toBeCalledTimes(1);
    });
  });

  describe('consume', () => {
    it('succeed when consumer group exists', async () => {
      const consumerDB: db.Consumer = {
        id: 2,
        group: 'group1',
        topic: 'topic1',
        offset: 3,
      };
      const messageDB1: db.Message = {
        id: 5,
        data: '123',
        topic: 'topic1',
        offset: 12,
      };
      const messageDB2: db.Message = {
        id: 6,
        data: '456',
        topic: 'topic1',
        offset: 13,
      };
      prisma.consumer.findFirst = jest.fn().mockResolvedValue(consumerDB);
      prisma.message.findMany = jest
        .fn()
        .mockResolvedValue([messageDB1, messageDB2]);

      expect(await service.consume('group1', 'topic1', 3)).toStrictEqual([
        messageDB1,
        messageDB2,
      ]);
    });

    it('fail when consumer group does not exist', async () => {
      prisma.consumer.findFirst = jest.fn().mockResolvedValue(null);
      prisma.message.findMany = jest.fn();

      expect(await service.consume('group1', 'topic1', 3)).toBe(null);

      expect(prisma.message.findMany).toBeCalledTimes(0);
    });
  });
});
