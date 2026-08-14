export interface PracticeRecord {
  id: string;
  questionId: string;
  practicedAt: string;
}

export interface TrainingHistory {
  schemaVersion: 1;
  records: PracticeRecord[];
}

export interface DailyPlanModuleTarget {
  category: string;
  targetCount: number;
}

export interface DailyPlan {
  date: string;
  moduleTargets: DailyPlanModuleTarget[];
  totalTarget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyPlanStore {
  schemaVersion: 1;
  plans: DailyPlan[];
}

export interface FullTrainingBackup {
  schemaVersion: 1;
  app: "Qingyun Speak";
  exportedAt: string;
  dataset: import("./dataset").InterviewDataset;
  trainingHistory: TrainingHistory;
  dailyPlans: DailyPlanStore;
  settings: import("./dataset").SpeechSettings;
}
