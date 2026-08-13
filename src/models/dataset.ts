export type MasteryLevel = 0 | 1 | 2 | 3 | 4;

export interface Phrase {
  id: string;
  en: string;
  zh?: string;
}

export interface FallbackExpression {
  term?: string;
  preferred?: string;
  fallback: string;
  zh?: string;
}

export interface InterviewQuestion {
  id: string;
  category: string;
  question: { en: string; zh: string };
  thinking: string[];
  phrases: Phrase[];
  answer: { en: string[]; zh: string[] };
  keywords: string[];
  fallbacks: FallbackExpression[];
  tags: string[];
  favorite: boolean;
  mastery: MasteryLevel;
  createdAt?: string;
  updatedAt?: string;
  legacy?: { audioFile?: string };
}

export type PronunciationCategory = "Personal" | "Research" | "Paper";

export interface PronunciationItem {
  id: string;
  en: string;
  zh: string;
  category: PronunciationCategory;
  note: string;
  mastery: MasteryLevel;
}

export interface InterviewDataset {
  schemaVersion: 1;
  metadata: { name: string; updatedAt: string };
  questions: InterviewQuestion[];
  pronunciation: PronunciationItem[];
}

export interface SpeechSettings {
  voiceURI?: string;
  rate: 0.75 | 0.9 | 1 | 1.1;
}

export const DEFAULT_PRONUNCIATION: PronunciationItem[] = [
  ["p1", "Hangzhou Dianzi University", "杭州电子科技大学", "Personal"],
  ["p2", "multi-agent systems", "多智能体系统", "Personal"],
  ["p3", "autonomous driving", "自动驾驶", "Personal"],
  ["r1", "methodology", "方法论", "Research"],
  ["r2", "evaluation", "评估", "Research"],
  ["r3", "empirical", "实证的", "Research"],
].map(([id, en, zh, category]) => ({
  id,
  en,
  zh,
  category: category as PronunciationCategory,
  note: "",
  mastery: 0,
}));
