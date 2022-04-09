import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'apps/queuejs/src/app.module';
import { PrismaService } from 'apps/queuejs/src/prisma.service';
import { IntegrationUtils } from './utils';

describe('consumer e2e', () => {
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

  describe('/api/groups/:group/topics/:topic/register (POST)', () => {
    it('succeeds to register', () => {
      return request(app.getHttpServer())
        .post('/api/groups/group1/topics/topic1/register')
        .expect(201)
        .expect({ group: 'group1', topic: 'topic1', offset: 0 });
    });
  });
});
