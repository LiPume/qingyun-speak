import { describe, expect, it } from "vitest";
import type { InterviewQuestion } from "../../models/dataset";
import type { DailyPlan, TrainingHistory } from "../../models/training";
import {
  getDailyPlanProgress,
  getDailyPlanRecommendations,
  getDailyPracticeCounts,
  getDailyPracticeStats,
  getFirstPracticedAt,
  getLastPracticedAt,
  getPracticeCount,
  getPracticeStreak,
  getTodayUniqueQuestionIds,
  getUnpracticedQuestionIds,
  hasPracticedToday,
} from "./selectors";

const at = (day: number, hour: number) => new Date(2026, 7, day, hour).toISOString();
const history: TrainingHistory = {
  schemaVersion: 1,
  records: [
    { id: "r1", questionId: "Q1", practicedAt: at(12, 10) },
    { id: "r2", questionId: "Q1", practicedAt: at(14, 9) },
    { id: "r3", questionId: "Q1", practicedAt: at(14, 10) },
    { id: "r4", questionId: "Q2", practicedAt: at(14, 11) },
  ],
};

const question = (id: string, category: string): InterviewQuestion => ({
  id,
  category,
  question: { en: id, zh: id },
  thinking: [],
  phrases: [],
  answer: { en: [], zh: [] },
  keywords: [],
  fallbacks: [],
  tags: ["核心题库"],
  favorite: false,
  mastery: 0,
});

describe("training selectors", () => {
  it("derives count, first, last, today, unique, and unpracticed questions", () => {
    const now = new Date(2026, 7, 14, 15);
    expect(getPracticeCount(history, "Q1")).toBe(3);
    expect(getFirstPracticedAt(history, "Q1")).toBe(at(12, 10));
    expect(getLastPracticedAt(history, "Q1")).toBe(at(14, 10));
    expect(hasPracticedToday(history, "Q1", now)).toBe(true);
    expect(getTodayUniqueQuestionIds(history, now)).toEqual(["Q1", "Q2"]);
    expect(getUnpracticedQuestionIds(history, ["Q1", "Q2", "Q3"])).toEqual(["Q3"]);
  });

  it("counts total records separately from unique new and review questions", () => {
    expect(getDailyPracticeStats(history, "2026-08-14")).toEqual({
      totalRecords: 3,
      uniqueQuestions: 2,
      newQuestions: 1,
      reviewQuestions: 1,
    });
    expect(getDailyPracticeCounts(history)[0]).toEqual({ date: "2026-08-14", totalRecords: 3, uniqueQuestions: 2 });
  });

  it("keeps yesterday's active streak when today has no record and resets after a missed day", () => {
    const streakHistory: TrainingHistory = { schemaVersion: 1, records: [
      { id: "a", questionId: "Q1", practicedAt: at(11, 9) },
      { id: "b", questionId: "Q1", practicedAt: at(12, 9) },
      { id: "c", questionId: "Q2", practicedAt: at(13, 9) },
    ] };
    expect(getPracticeStreak(streakHistory, new Date(2026, 7, 14, 8))).toBe(3);
    expect(getPracticeStreak(streakHistory, new Date(2026, 7, 15, 8))).toBe(0);
  });

  it("computes module and total plan completion from unique questions", () => {
    const questions = [question("Q1", "项目与论文类"), question("Q2", "项目与论文类"), question("Q3", "自我情况类")];
    const plan: DailyPlan = {
      date: "2026-08-14",
      moduleTargets: [
        { category: "项目与论文类", targetCount: 3 },
        { category: "自我情况类", targetCount: 1 },
      ],
      createdAt: at(14, 8),
      updatedAt: at(14, 8),
    };
    const progress = getDailyPlanProgress(plan, questions, history);
    expect(progress.targetCount).toBe(4);
    expect(progress.completedCount).toBe(2);
    expect(progress.modules[0]).toMatchObject({ completedCount: 2, targetCount: 3 });
  });

  it("recommends core unpracticed, then older core, with extension questions last", () => {
    const questions = [
      { ...question("Q1", "项目与论文类"), tags: ["核心题库"] },
      { ...question("Q2", "项目与论文类"), tags: ["核心题库"] },
      { ...question("Q3", "项目与论文类"), tags: ["扩展题库"] },
    ];
    const recommendationHistory: TrainingHistory = { schemaVersion: 1, records: [
      { id: "old", questionId: "Q2", practicedAt: at(1, 9) },
    ] };
    const plan: DailyPlan = { date: "2026-08-14", moduleTargets: [{ category: "项目与论文类", targetCount: 3 }], createdAt: at(14, 8), updatedAt: at(14, 8) };
    expect(getDailyPlanRecommendations(plan, questions, recommendationHistory).get("项目与论文类")?.map((item) => item.question.id)).toEqual(["Q1", "Q2", "Q3"]);
  });
});
