export interface Sentence {
  en: string;
  ja: string;
}

export interface Block {
  id: number;
  slug: string;
  enTitle: string;
  jaTitle: string;
  sentences: Sentence[];
}

export interface Topic {
  fileId: string;
  slug: string;
  title: string;
  jaTitle: string;
  blocks: Block[];
}

export interface TopicsData {
  topics: Topic[];
}

export interface BlockProgress {
  memorized: boolean;
  lastReviewedAt: number;
  reviewCount: number;
}

export interface TopicProgress {
  topicId: string;
  blocks: Record<number, BlockProgress>;
  updatedAt: number;
}

export type Speed = 1.0 | 0.75 | 0.5;
export type SubtitleMode = 'en' | 'ja' | 'both' | 'none';
export type LearningMode = 'shadowing' | 'recitation' | 'autoloop' | 'srs';
