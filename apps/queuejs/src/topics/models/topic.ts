import { Message } from "./message";

export class Topic {
    name: string;
    messages: Message[];
}

export type TopicMap = Map<string, Message[]>;
export const TopicMap = Symbol('TopicMap');
