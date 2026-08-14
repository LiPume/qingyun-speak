import { addLocalDays, getLocalDateKey } from "../../lib/localDate";
import type { InterviewQuestion } from "../../models/dataset";
import type { DailyPlan, PracticeRecord, TrainingHistory } from "../../models/training";

const chronological = (records: PracticeRecord[]) => [...records].sort((a, b) => a.practicedAt.localeCompare(b.practicedAt));

export function getPracticeCount(history: TrainingHistory, questionId: string): number {
  return history.records.filter((record) => record.questionId === questionId).length;
}

export function getFirstPracticedAt(history: TrainingHistory, questionId: string): string | undefined {
  return chronological(history.records.filter((record) => record.questionId === questionId))[0]?.practicedAt;
}

export function getLastPracticedAt(history: TrainingHistory, questionId: string): string | undefined {
  return chronological(history.records.filter((record) => record.questionId === questionId)).at(-1)?.practicedAt;
}

export function getRecordsForDate(history: TrainingHistory, dateKey: string): PracticeRecord[] {
  return history.records.filter((record) => getLocalDateKey(new Date(record.practicedAt)) === dateKey);
}

export function hasPracticedToday(history: TrainingHistory, questionId: string, now = new Date()): boolean {
  const today = getLocalDateKey(now);
  return history.records.some((record) => record.questionId === questionId && getLocalDateKey(new Date(record.practicedAt)) === today);
}

export function getTodayPracticeRecords(history: TrainingHistory, now = new Date()): PracticeRecord[] {
  return getRecordsForDate(history, getLocalDateKey(now));
}

export function getTodayUniqueQuestionIds(history: TrainingHistory, now = new Date()): string[] {
  return [...new Set(getTodayPracticeRecords(history, now).map((record) => record.questionId))];
}

export function getUnpracticedQuestionIds(history: TrainingHistory, questionIds: string[]): string[] {
  const practiced = new Set(history.records.map((record) => record.questionId));
  return questionIds.filter((id) => !practiced.has(id));
}

export interface DailyPracticeCount {
  date: string;
  totalRecords: number;
  uniqueQuestions: number;
}

export function getDailyPracticeCounts(history: TrainingHistory): DailyPracticeCount[] {
  const byDate = new Map<string, { totalRecords: number; questionIds: Set<string> }>();
  for (const record of history.records) {
    const date = getLocalDateKey(new Date(record.practicedAt));
    const current = byDate.get(date) ?? { totalRecords: 0, questionIds: new Set<string>() };
    current.totalRecords += 1;
    current.questionIds.add(record.questionId);
    byDate.set(date, current);
  }
  return [...byDate].map(([date, value]) => ({ date, totalRecords: value.totalRecords, uniqueQuestions: value.questionIds.size }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPracticeStreak(history: TrainingHistory, now = new Date()): number {
  const practicedDates = new Set(getDailyPracticeCounts(history).map((item) => item.date));
  const today = getLocalDateKey(now);
  let cursor = practicedDates.has(today) ? today : addLocalDays(today, -1);
  if (!practicedDates.has(cursor)) return 0;
  let streak = 0;
  while (practicedDates.has(cursor)) {
    streak += 1;
    cursor = addLocalDays(cursor, -1);
  }
  return streak;
}

export interface ModulePracticeProgress {
  category: string;
  practicedCount: number;
  totalCount: number;
}

export function getModulePracticeProgress(category: string, questions: InterviewQuestion[], history: TrainingHistory): ModulePracticeProgress {
  const moduleQuestions = questions.filter((question) => question.category === category);
  const practiced = new Set(history.records.map((record) => record.questionId));
  return { category, practicedCount: moduleQuestions.filter((question) => practiced.has(question.id)).length, totalCount: moduleQuestions.length };
}

export interface PlanModuleProgress {
  category: string;
  targetCount: number;
  completedCount: number;
}

export function getPlanModuleProgress(date: string, category: string, targetCount: number, questions: InterviewQuestion[], history: TrainingHistory): PlanModuleProgress {
  const moduleIds = new Set(questions.filter((question) => question.category === category).map((question) => question.id));
  const completedCount = new Set(getRecordsForDate(history, date).filter((record) => moduleIds.has(record.questionId)).map((record) => record.questionId)).size;
  return { category, targetCount, completedCount };
}

export interface DailyPlanProgress {
  targetCount: number;
  completedCount: number;
  modules: PlanModuleProgress[];
}

export function getDailyPlanProgress(plan: DailyPlan | undefined, questions: InterviewQuestion[], history: TrainingHistory): DailyPlanProgress {
  if (!plan) return { targetCount: 0, completedCount: 0, modules: [] };
  const modules = plan.moduleTargets.map((target) => getPlanModuleProgress(plan.date, target.category, target.targetCount, questions, history));
  return {
    targetCount: modules.reduce((sum, module) => sum + module.targetCount, 0),
    completedCount: modules.reduce((sum, module) => sum + Math.min(module.completedCount, module.targetCount), 0),
    modules,
  };
}

export interface DailyPracticeStats {
  totalRecords: number;
  uniqueQuestions: number;
  newQuestions: number;
  reviewQuestions: number;
}

export function getDailyPracticeStats(history: TrainingHistory, date = getLocalDateKey()): DailyPracticeStats {
  const records = getRecordsForDate(history, date);
  const questionIds = [...new Set(records.map((record) => record.questionId))];
  let newQuestions = 0;
  let reviewQuestions = 0;
  for (const questionId of questionIds) {
    const first = getFirstPracticedAt(history, questionId);
    if (first && getLocalDateKey(new Date(first)) === date) newQuestions += 1;
    else reviewQuestions += 1;
  }
  return { totalRecords: records.length, uniqueQuestions: questionIds.length, newQuestions, reviewQuestions };
}

export interface RecommendedQuestion {
  question: InterviewQuestion;
  reason: "未练" | string;
}

export function getDailyPlanRecommendations(plan: DailyPlan | undefined, questions: InterviewQuestion[], history: TrainingHistory): Map<string, RecommendedQuestion[]> {
  const result = new Map<string, RecommendedQuestion[]>();
  if (!plan) return result;
  const todayIds = new Set(getRecordsForDate(history, plan.date).map((record) => record.questionId));
  const lastByQuestion = new Map<string, string>();
  for (const record of history.records) {
    if (!lastByQuestion.has(record.questionId) || record.practicedAt > lastByQuestion.get(record.questionId)!) lastByQuestion.set(record.questionId, record.practicedAt);
  }
  for (const target of plan.moduleTargets) {
    const progress = getPlanModuleProgress(plan.date, target.category, target.targetCount, questions, history);
    const needed = Math.max(0, target.targetCount - progress.completedCount);
    const candidates = questions.filter((question) => question.category === target.category && !todayIds.has(question.id));
    candidates.sort((a, b) => {
      const rank = (question: InterviewQuestion) => {
        const core = question.tags.includes("核心题库");
        const extension = question.tags.includes("扩展题库");
        const practiced = lastByQuestion.has(question.id);
        if (core && !practiced) return 0;
        if (core) return 1;
        if (!extension && !practiced) return 2;
        if (!extension) return 3;
        if (!practiced) return 4;
        return 5;
      };
      const rankDiff = rank(a) - rank(b);
      if (rankDiff) return rankDiff;
      const aLast = lastByQuestion.get(a.id) ?? "";
      const bLast = lastByQuestion.get(b.id) ?? "";
      return aLast.localeCompare(bLast) || a.id.localeCompare(b.id, undefined, { numeric: true });
    });
    result.set(target.category, candidates.slice(0, needed).map((question) => {
      const last = lastByQuestion.get(question.id);
      if (!last) return { question, reason: "未练" };
      const days = Math.max(1, Math.round((new Date(`${plan.date}T12:00:00`).getTime() - new Date(last).getTime()) / 86_400_000));
      return { question, reason: `${days}天未练` };
    }));
  }
  return result;
}

export function sortQuestionsByPracticePriority(questions: InterviewQuestion[], history: TrainingHistory, now = new Date()): InterviewQuestion[] {
  return [...questions].sort((a, b) => {
    const aToday = hasPracticedToday(history, a.id, now);
    const bToday = hasPracticedToday(history, b.id, now);
    const aLast = getLastPracticedAt(history, a.id);
    const bLast = getLastPracticedAt(history, b.id);
    const rank = (last: string | undefined, today: boolean) => !last ? 0 : today ? 2 : 1;
    return rank(aLast, aToday) - rank(bLast, bToday) || (aLast ?? "").localeCompare(bLast ?? "") || a.id.localeCompare(b.id, undefined, { numeric: true });
  });
}
