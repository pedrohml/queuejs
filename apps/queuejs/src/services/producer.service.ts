import { Injectable } from '@nestjs/common';
import db from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { Message } from '../wire/message.wire';
import * as AsyncLock from "async-lock";
@Injectable()
export class ProducerService {
  asyncLock: AsyncLock;

  constructor(private readonly prismaService: PrismaService) {
    this.asyncLock = new AsyncLock();
  }

  private async getTopicDB(topic: string): Promise<db.Topic> {
    return this.prismaService.topic.findUnique({ where: { topic } });
  }

  async produce(topic: string, messages: Message[]) {
    // Ensuring we don't have concurrency on the same topic

    await this.asyncLock.acquire(topic, async () => {
      const topicDB = await this.getTopicDB(topic);
      const lastOffset = (topicDB && topicDB.last_offset) || 0;
      const nextOffset = lastOffset + 1;
      const messagesDB: db.Message[] = messages.map(({ data }, idx) => (
        { id: undefined, topic, data, offset: nextOffset + idx }
      ));
      const nextLastOffset = lastOffset + messagesDB.length;

      const topicTransaction: db.PrismaPromise<db.Topic> =
        this.prismaService.topic.upsert({
          where: { topic },
          create: { topic, last_offset: nextLastOffset },
          update: { last_offset: nextLastOffset },
        });
      const messageTransactions: db.PrismaPromise<db.Message>[] = messagesDB.map(
        (m) => this.prismaService.message.create({ data: m }),
      );

      const transactions = Array<db.PrismaPromise<any>>();
      transactions.push(topicTransaction);
      transactions.push(...messageTransactions);

      await this.prismaService.$transaction(transactions);
    });
  }
}
