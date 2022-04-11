import db from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as AsyncLock from "async-lock";

@Injectable()
export class ConsumerService {
  asyncLock: AsyncLock;

  constructor(private readonly prismaService: PrismaService) {
    this.asyncLock = new AsyncLock();
  }

  private async getConsumer(
    group: string,
    topic: string,
  ): Promise<db.Consumer> {
    return this.prismaService.consumer.findFirst({ where: { group, topic } });
  }

  private async setOffset(
    group: string,
    topic: string,
    offset: number,
  ): Promise<db.Consumer> {
    return this.prismaService.consumer.upsert({
      where: { group_topic: { group, topic } },
      create: { group, topic, offset },
      update: { offset }
    });
  }

  async register(group: string, topic: string): Promise<db.Consumer> {
    return (
      (await this.getConsumer(group, topic)) ||
      (await this.setOffset(group, topic, 0))
    );
  }

  async commit(
    group: string,
    topic: string,
    offset: number,
  ): Promise<db.Consumer> {
    // Ensuring we don't have concurrency on the same group and topic

    return this.asyncLock.acquire(`${group}:${topic}`, async () => {
      const consumer: db.Consumer = await this.getConsumer(group, topic);

      if (consumer && consumer.offset >= offset)
        return consumer;
      else
        return this.setOffset(group, topic, offset);
    });
  }

  async consume(
    group: string,
    topic: string,
    count = 1,
  ): Promise<db.Message[] | null> {
    return this.asyncLock.acquire(`${group}:${topic}`, async () => {
      const groupDB: db.Consumer = await this.getConsumer(group, topic);

      if (groupDB) {
        const offset = groupDB.offset;

        return this.prismaService.message.findMany({
          take: count,
          where: { offset: { gt: offset } },
          orderBy: { offset: 'asc' },
        });
      } else {
        return null;
      }
    });
  }
}
