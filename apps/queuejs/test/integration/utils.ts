import { PrismaPromise } from "@prisma/client";
import { PrismaService } from "apps/queuejs/src/prisma.service";

export class IntegrationUtils {
    static async resetDB(prisma: PrismaService): Promise<any> {
        return prisma.$transaction([
            prisma.topic.deleteMany(),
            prisma.consumer.deleteMany(),
            prisma.message.deleteMany(),
        ]);
    }
}