import { Injectable } from '@nestjs/common';
import db from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { Message } from '../wire/message.wire';

@Injectable()
export class ProducerService {
  constructor(private readonly prismaService: PrismaService) {}

  private async getTopicDB(topic: string): Promise<db.Topic> {
    return this.prismaService.topic.findUnique({ where: { topic } });
  }

  async produce(topic: string, messages: Message[]): Promise<any> {
    // TODO: Miss protection against concurrent producers

    const topicDB = await this.getTopicDB(topic);
    const lastOffset = (topicDB && topicDB.last_offset) || 0;
    const nextOffset = lastOffset + 1;
    const messagesDB: db.Message[] = messages.map(({ data }, idx) => {
      return { id: undefined, topic, data, offset: nextOffset + idx };
    });
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

    return this.prismaService.$transaction(transactions);
  }
}
