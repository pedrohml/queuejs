import DB from '@prisma/client';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GroupsService {
    constructor(private readonly prismaService: PrismaService) {}

    private async getGroupByTuple(group: string, topic: string): Promise<DB.ConsumerGroup> {
        let groupDB: DB.ConsumerGroup = await this.prismaService.consumerGroup.findFirst({ where: { name: group, topic: topic } });
        return groupDB;
    }

    private async setGroupOffset(group: string, topic: string, offset: number): Promise<DB.ConsumerGroup> {
        let existingGroupDB = await this.getGroupByTuple(group, topic);
        if (existingGroupDB)
            return this.prismaService.consumerGroup.update({ where: { id: existingGroupDB.id }, data: { offset }})
        else
            return this.prismaService.consumerGroup.create({ data: { name: group, topic, offset}});
    }

    async register(group: string, topic: string): Promise<DB.ConsumerGroup> {
        return (await this.getGroupByTuple(group, topic)) || (await this.setGroupOffset(group, topic, 0));
    }

    async commit(group: string, topic: string, offset: number): Promise<DB.ConsumerGroup> {
        return this.setGroupOffset(group, topic, offset);
    }

    async getMessages(group: string, topic: string, count: number = 256): Promise<DB.Message[]> {
        let groupDB: DB.ConsumerGroup = await this.getGroupByTuple(group, topic);
        if (!groupDB)
            throw new HttpException(`There is no a consumer group '${group}' registered for the topic '${topic}'`, HttpStatus.BAD_REQUEST);
        let offset = groupDB.offset;
        return this.prismaService.message.findMany({ take: count, where: { offset: { gt: offset } }, orderBy: { offset: 'asc' }});
    }
}
