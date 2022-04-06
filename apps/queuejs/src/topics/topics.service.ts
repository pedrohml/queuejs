import { FactoryProvider, Injectable } from '@nestjs/common';
import { Message, MessageCollection } from './models/message';
import { TopicMap } from './models/topic';

export interface ITopicsService {
  produce(topic: string, messageCollection: MessageCollection): void;

  consume(topic: string, count: number): MessageCollection;

  consumeNext(topic: string): MessageCollection;
}

export const ITopicsService = Symbol('ITopicsService');

@Injectable()
export class TopicsServiceMock implements ITopicsService {
  private topicMap: TopicMap;

  constructor() {
    this.topicMap = new Map<string, Message[]>();
  }

  private enforceTopicCreation(topic: string): void {
    this.topicMap[topic] ||= [];
  }

  produce(topic: string, messageCollection: MessageCollection): void {
    this.enforceTopicCreation(topic);
    for (let m of messageCollection.messages)
      this.topicMap[topic].push(m);
  }

  consume(topic: string, count: number): MessageCollection {
    let messages = [];
    this.enforceTopicCreation(topic);
    while (count-- && this.topicMap[topic].length)
      messages.push(this.topicMap[topic].shift());
    return new MessageCollection(messages);
  }

  consumeNext(topic: string): MessageCollection {
    return this.consume(topic, 1);
  }
}

export class TopicsServiceProvider implements FactoryProvider<ITopicsService> {
  provide = ITopicsService;
  
  useFactory (...args: any[]): ITopicsService {
    return new TopicsServiceMock();
  };
}
