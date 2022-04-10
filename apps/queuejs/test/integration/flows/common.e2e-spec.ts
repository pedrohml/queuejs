import { INestApplication } from '@nestjs/common';
import { API, IntegrationUtils } from '../utils';
import { MessageCollection } from 'apps/queuejs/src/wire/message.wire';

describe('producer + consumer (e2e)', () => {
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

  it('produce 1, consume 1', async () => {
    const topic = 'topic1';
    const group = 'group1';
    const data1 = '123';

    await API.produce(app, topic, {
      messages: [{ data: data1 }],
    } as MessageCollection);

    await API.register(app, group, topic).expect({ group, topic, offset: 0 });

    await API.consumeNext(app, group, topic).expect({
      messages: [{ data: data1, topic, offset: 1 }],
    });
  });

  it('produce 1, consume 1, missed commit, consume 1', async () => {
    const topic = 'topic1';
    const group = 'group1';
    const data1 = '123';

    await API.produce(app, topic, {
      messages: [{ data: data1 }],
    } as MessageCollection);

    await API.register(app, group, topic).expect({ group, topic, offset: 0 });

    await API.consumeNext(app, group, topic).expect({
      messages: [{ data: data1, topic, offset: 1 }],
    });

    // missed to commit offset 1

    await API.consumeNext(app, group, topic).expect({
      messages: [{ data: data1, topic, offset: 1 }],
    });
  });

  it('produce 1, consume 1, commit 1, consume none', async () => {
    const topic = 'topic1';
    const group = 'group1';
    const data1 = '123';

    await API.produce(app, topic, {
      messages: [{ data: data1 }],
    } as MessageCollection);

    await API.register(app, group, topic).expect({ group, topic, offset: 0 });

    await API.consumeNext(app, group, topic).expect({
      messages: [{ data: data1, topic, offset: 1 }],
    });

    await API.commit(app, group, topic, 1).expect({ group, topic, offset: 1 });

    await API.consumeNext(app, group, topic).expect({ messages: [] });
  });

  it('produce 1, consume 1, missed commit, consume 1, commit 1, consume 2', async () => {
    const topic = 'topic1';
    const group = 'group1';
    const data1 = '123';
    const data2 = '456';

    await API.produce(app, topic, {
      messages: [{ data: data1 }],
    } as MessageCollection);
    await API.produce(app, topic, {
      messages: [{ data: data2 }],
    } as MessageCollection);

    await API.register(app, group, topic).expect({ group, topic, offset: 0 });

    await API.consumeNext(app, group, topic).expect({
      messages: [{ data: data1, topic, offset: 1 }],
    });

    // missed to commit offset 1

    await API.consumeNext(app, group, topic).expect({
      messages: [{ data: data1, topic, offset: 1 }],
    });

    await API.commit(app, group, topic, 1).expect({ group, topic, offset: 1 });

    await API.consumeNext(app, group, topic).expect({
      messages: [{ data: data2, topic, offset: 2 }],
    });
  });

  it('produce 1, consume [1, 2]', async () => {
    const topic = 'topic1';
    const group = 'group1';
    const data1 = '123';
    const data2 = '456';

    await API.produce(app, topic, {
      messages: [{ data: data1 }],
    } as MessageCollection);
    await API.produce(app, topic, {
      messages: [{ data: data2 }],
    } as MessageCollection);

    await API.register(app, group, topic).expect({ group, topic, offset: 0 });

    await API.consume(app, group, topic, 10).expect({
      messages: [
        { data: data1, topic, offset: 1 },
        { data: data2, topic, offset: 2 },
      ],
    });
  });

  it('produce 1, consume [1, 2], commit 2, consume [3, 4]', async () => {
    const topic = 'topic1';
    const group = 'group1';
    const data1 = '123';
    const data2 = '456';
    const data3 = '789';
    const data4 = '321';
    const datas = [data1, data2, data3, data4];

    for (const data of datas)
      await API.produce(app, topic, {
        messages: [{ data: data }],
      } as MessageCollection);

    await API.register(app, group, topic).expect({ group, topic, offset: 0 });

    await API.consume(app, group, topic, 1).expect({
      messages: [{ data: data1, topic, offset: 1 }],
    });

    await API.commit(app, group, topic, 1).expect({ group, topic, offset: 1 });

    await API.consume(app, group, topic, 3).expect({
      messages: [
        { data: data2, topic, offset: 2 },
        { data: data3, topic, offset: 3 },
        { data: data4, topic, offset: 4 },
      ],
    });
  });

  it('produce 1, consume [1, 2], commit 3 (skip), consume 4', async () => {
    const topic = 'topic1';
    const group = 'group1';
    const data1 = '123';
    const data2 = '456';
    const data3 = '789';
    const data4 = '321';
    const datas = [data1, data2, data3, data4];

    for (const data of datas)
      await API.produce(app, topic, {
        messages: [{ data: data }],
      } as MessageCollection);

    await API.register(app, group, topic).expect({ group, topic, offset: 0 });

    await API.consume(app, group, topic, 2).expect({
      messages: [
        { data: data1, topic, offset: 1 },
        { data: data2, topic, offset: 2 },
      ],
    });

    await API.commit(app, group, topic, 3) // skip 3
      .expect({ group, topic, offset: 3 });

    await API.consume(app, group, topic, 10).expect({
      messages: [{ data: data4, topic, offset: 4 }],
    });
  });

  it('register none if already registered', async () => {
    const topic = 'topic1';
    const group = 'group1';

    await API.register(app, group, topic).expect({ group, topic, offset: 0 });

    await API.register(app, group, topic).expect({ group, topic, offset: 0 });
  });

  it('register none if already commited', async () => {
    const topic = 'topic1';
    const group = 'group1';

    await API.commit(app, group, topic, 5);

    await API.register(app, group, topic).expect({ group, topic, offset: 5 });
  });
});
