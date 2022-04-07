import db from '@prisma/client';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ConsumerService {
    constructor(private readonly prismaService: PrismaService) {}

    private async getConsumer(group: string, topic: string): Promise<db.Consumer> {
        return this.prismaService.consumer.findFirst({ where: { group, topic } });
    }

    private async setOffset(group: string, topic: string, offset: number): Promise<db.Consumer> {
        let existingGroupDB = await this.getConsumer(group, topic);
        if (existingGroupDB)
            return this.prismaService.consumer.update({ where: { id: existingGroupDB.id }, data: { offset }});
        else
            return this.prismaService.consumer.create({ data: { group, topic, offset}});
    }

    async register(group: string, topic: string): Promise<db.Consumer> {
        return (await this.getConsumer(group, topic)) || (await this.setOffset(group, topic, 0));
    }

    async commit(group: string, topic: string, offset: number): Promise<db.Consumer> {
        return this.setOffset(group, topic, offset);
    }

    async consume(group: string, topic: string, count: number = 1): Promise<db.Message[]> {
        let groupDB: db.Consumer = await this.getConsumer(group, topic);
        if (!groupDB)
            throw new HttpException(`There is no a consumer group '${group}' registered for the topic '${topic}'`, HttpStatus.BAD_REQUEST);
        let offset = groupDB.offset;
        return this.prismaService.message.findMany({ take: count, where: { offset: { gt: offset } }, orderBy: { offset: 'asc' }});
    }
}
