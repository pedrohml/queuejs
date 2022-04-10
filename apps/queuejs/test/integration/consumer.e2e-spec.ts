import { INestApplication } from '@nestjs/common';
import { API, IntegrationUtils } from './utils';
import * as request from 'supertest';

describe('consumer (e2e)', () => {
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

  describe('/api/groups/:group/topics/:topic/register (POST)', () => {
    it('succeeds to register', async () => {
      await API.register(app, 'group1', 'topic1')
        .expect({ group: 'group1', topic: 'topic1', offset: 0 });
    });
  });

  describe('/api/groups/:group/topics/:topic/commit (PUT)', () => {
    it('succeeds to commit', async () => {
      await API.commit(app, 'group1', 'topic1', 10)
        .expect({ group: 'group1', topic: 'topic1', offset: 10 });
    });
  });

  describe('/api/groups/:group/topics/:topic/messages/10 (GET)', () => {
    it('fails when consumer group does not exists', async () => {
      await request(app.getHttpServer())
        .get('/api/groups/group1/topics/topic1/messages/10')
        .expect(400)
        .expect({
          statusCode: 400,
          message: "There is not a consumer group 'group1' registered for the topic 'topic1'"
        });
    });
  });
});
