import { Injectable } from '@nestjs/common';
import db from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { Message } from '../wire/message';

@Injectable()
export class ProducerService {
  constructor(private readonly prismaService: PrismaService) {}

  private async getLastMessage(topic: string): Promise<db.Message> {
    return this.prismaService.message.findFirst({ where: { topic }, orderBy: { offset: 'desc' } })
  }

  async produce(topic: string, messages: Message[]): Promise<void> {
    let lastMessage = await this.getLastMessage(topic);
    let lastOffset = (lastMessage && lastMessage.offset) || 0;
    let nextOffset = lastOffset + 1;
    let messagesDB: db.Message[] = messages.map(({ data }, idx) => { return { id: undefined, topic, data, offset: nextOffset + idx } });
    await this.prismaService.$transaction(messagesDB.map((m) => this.prismaService.message.create({ data: m })));
  }
}