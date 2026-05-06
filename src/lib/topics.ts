import data from '@/data/topics.json';
import type { Topic, TopicsData } from './types';

const TOPICS_DATA = data as TopicsData;

export function getAllTopics(): Topic[] {
  return TOPICS_DATA.topics;
}

export function getTopicByFileId(fileId: string): Topic | undefined {
  return TOPICS_DATA.topics.find((t) => t.fileId === fileId);
}
