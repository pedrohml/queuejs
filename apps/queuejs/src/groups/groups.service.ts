import { FactoryProvider, Injectable } from '@nestjs/common';
import { GroupMap, TopicSettings, TopicSettingsMap } from './models/groups'

export interface IGroupsService {
    register(group: string, topic: string): TopicSettings;
    commit(group: string, topic: string, offset: number): TopicSettings;
}

export const IGroupsService = Symbol('IGroupsService');

@Injectable()
class GroupsServiceMock implements IGroupsService {
    groups: GroupMap;

    constructor() {
        this.groups = new Map();
    }

    private getSettings(group: string, topic: string): TopicSettings {
        let topicSettingsMap: TopicSettingsMap = this.groups[group] || new Map();
        let settings: TopicSettings = topicSettingsMap[topic] || new TopicSettings(0);
        return settings;
    }

    private setSettings(group: string, topic: string, settings: TopicSettings): void {
        let topicSettingsMap: TopicSettingsMap = this.groups[group] || new Map();
        topicSettingsMap[topic] = settings;
    }

    register(group: string, topic: string): TopicSettings {
        let topicSettingsMap: TopicSettingsMap = this.groups[group] || new Map();
        let settings: TopicSettings = this.getSettings(group, topic);
        topicSettingsMap[topic] ||= settings;
        this.groups[group] = topicSettingsMap;
        return settings;
    }

    commit(group: string, topic: string, offset: number): TopicSettings {
        this.setSettings(group, topic, { offset });
        return this.getSettings(group, topic);
    }
}

export class GroupsServiceProvider implements FactoryProvider<IGroupsService> {
    provide = IGroupsService;

    useFactory(...args: any[]): IGroupsService {
        return new GroupsServiceMock();
    }
}
