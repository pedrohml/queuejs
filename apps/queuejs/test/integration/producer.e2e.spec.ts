import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'apps/queuejs/src/app.module';
import { PrismaService } from 'apps/queuejs/src/prisma.service';
import { IntegrationUtils } from './utils';

describe('producer e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
  
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();

    prisma = app.get<PrismaService>(PrismaService)
    
    await IntegrationUtils.resetDB(prisma);
  });

  describe('/api/topics/:topic/messages (POST)', () => {
    it('succeeds to produce one message', () => {
      return request(app.getHttpServer())
        .post('/api/topics/topic1/messages')
        .send({ messages: [ { data: '123' } ]})
        .expect(202)
        .expect({});
    });

    it('succeeds to produce more than one message', () => {
      return request(app.getHttpServer())
        .post('/api/topics/topic1/messages')
        .send({ messages: [ { data: '123' }, { data: '456' } ]})
        .expect(202)
        .expect({});
    });

    it('succeeds to produce message with empty data', () => {
      return request(app.getHttpServer())
        .post('/api/topics/topic1/messages')
        .send({ messages: [ { data: '' } ]})
        .expect(202)
        .expect({});
    });

    it('fails to produce zero messages', () => {
      return request(app.getHttpServer())
        .post('/api/topics/topic1/messages')
        .send({ messages: []})
        .expect(400)
        .expect({
          statusCode: 400,
          message: [ 'messages should not be empty' ],
          error: 'Bad Request'
        });
    });
  });
});
