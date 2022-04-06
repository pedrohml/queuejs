export class TopicSettings {
    constructor(public offset: number) {}
}
export type TopicSettingsMap = Map<string, TopicSettings>;
export type GroupMap = Map<string, TopicSettingsMap>;