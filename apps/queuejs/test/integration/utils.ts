import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'apps/queuejs/src/app.module';
import { PrismaService } from 'apps/queuejs/src/prisma.service';
import { MessageCollection } from 'apps/queuejs/src/wire/message.wire';
import * as request from 'supertest';

export class IntegrationUtils {
  static async resetDB(prisma: PrismaService): Promise<any> {
    return prisma.$transaction([
      prisma.topic.deleteMany(),
      prisma.consumer.deleteMany(),
      prisma.message.deleteMany(),
    ]);
  }

  static async getPrisma(app: INestApplication): Promise<PrismaService> {
    return app.get<PrismaService>(PrismaService);
  }

  static async startApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app: INestApplication = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();

    return app;
  }
}

export class API {
  static produce(
    app: INestApplication,
    topic: string,
    payload: MessageCollection,
  ): request.Test {
    return request(app.getHttpServer())
      .post(`/api/topics/${topic}/messages`)
      .send(payload)
      .expect(201, {});
  }

  static register(
    app: INestApplication,
    group: string,
    topic: string,
  ): request.Test {
    return request(app.getHttpServer())
      .post(`/api/groups/${group}/topics/${topic}/register`)
      .expect(201);
  }

  static commit(
    app: INestApplication,
    group: string,
    topic: string,
    offset: number,
  ): request.Test {
    return request(app.getHttpServer())
      .put(`/api/groups/${group}/topics/${topic}/commit`)
      .send({ offset })
      .expect(200);
  }

  static consume(
    app: INestApplication,
    group: string,
    topic: string,
    count: number,
  ): request.Test {
    return request(app.getHttpServer())
      .get(`/api/groups/${group}/topics/${topic}/messages/${count}`)
      .expect(200);
  }

  static consumeNext(
    app: INestApplication,
    group: string,
    topic: string,
  ): request.Test {
    return request(app.getHttpServer())
      .get(`/api/groups/${group}/topics/${topic}/next`)
      .expect(200);
  }
}
