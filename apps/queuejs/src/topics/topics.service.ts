import { Injectable } from '@nestjs/common';
import DB from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { Message, MessageCollection } from './models/message';

@Injectable()
export class TopicsService {
  constructor(private readonly prismaService: PrismaService) {}

  private async getLastMessage(topic: string): Promise<DB.Message> {
    return this.prismaService.message.findFirst({ where: { topic }, orderBy: { offset: 'desc' } })
  }

  async produce(topic: string, messages: Message[]): Promise<void> {
    let lastMessage = await this.getLastMessage(topic);
    let lastOffset = (lastMessage && lastMessage.offset) || 0;
    let nextOffset = lastOffset + 1;
    let messagesDB: DB.Message[] = messages.map(({ data }, idx) => { return { id: undefined, topic, data, offset: nextOffset + idx } });
    await Promise.all(messagesDB.map(async (mDB) => await this.prismaService.message.create({ data: mDB })));
  }
}