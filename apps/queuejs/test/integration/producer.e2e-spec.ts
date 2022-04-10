import { INestApplication } from '@nestjs/common';
import { API, IntegrationUtils } from './utils';
import * as request from 'supertest';
import { MessageCollection } from 'apps/queuejs/src/wire/message.wire';

describe('producer (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await IntegrationUtils.startApp();
  });

  beforeEach(async () => {
    return IntegrationUtils.resetDB(await IntegrationUtils.getPrisma(app));
  });

  afterEach(async () => {
    return IntegrationUtils.resetDB(await IntegrationUtils.getPrisma(app));
  });

  describe('/api/topics/:topic/messages (POST)', () => {
    it('succeeds to produce one message', async () => {
      await API.produce(app, 'topic1', {
        messages: [{ data: '123' }],
      } as MessageCollection).expect({});
    });

    it('succeeds to produce more than one message', async () => {
      await API.produce(app, 'topic1', {
        messages: [{ data: '123' }, { data: '456' }],
      } as MessageCollection).expect({});
    });

    it('succeeds to produce message with empty data', async () => {
      await API.produce(app, 'topic1', {
        messages: [{ data: '' }],
      } as MessageCollection).expect({});
    });

    it('fails to produce zero messages', async () => {
      await request(app.getHttpServer())
        .post('/api/topics/topic1/messages')
        .send({ messages: [] })
        .expect(400)
        .expect({
          statusCode: 400,
          message: ['messages should not be empty'],
          error: 'Bad Request',
        });
    });
  });
});
