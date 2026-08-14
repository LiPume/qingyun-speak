import { beforeEach, describe, expect, it } from "vitest";
import type { DailyPlan } from "../models/training";
import { STORAGE_KEYS } from "./storage";
import {
  addPracticeRecord,
  loadDailyPlanStore,
  loadTrainingHistory,
  removePracticeRecord,
  saveDailyPlan,
} from "./trainingStorage";

describe("training storage", () => {
  beforeEach(() => localStorage.clear());

  it("adds and removes a practice record", () => {
    const record = addPracticeRecord("Q01", new Date(2026, 7, 14, 9, 30));
    expect(loadTrainingHistory().records).toEqual([record]);
    removePracticeRecord(record.id);
    expect(loadTrainingHistory().records).toEqual([]);
  });

  it("falls back safely when training localStorage is damaged", () => {
    localStorage.setItem(STORAGE_KEYS.training, "{damaged");
    expect(loadTrainingHistory()).toEqual({ schemaVersion: 1, records: [] });
  });

  it("saves, edits, and preserves plans from older days", () => {
    const createPlan = (date: string, targetCount: number): DailyPlan => ({
      date,
      moduleTargets: [{ category: "项目与论文类", targetCount }],
      createdAt: `${date}T08:00:00+08:00`,
      updatedAt: `${date}T08:00:00+08:00`,
    });
    saveDailyPlan(createPlan("2026-08-13", 2));
    saveDailyPlan(createPlan("2026-08-14", 3));
    saveDailyPlan(createPlan("2026-08-14", 4));
    const store = loadDailyPlanStore();
    expect(store.plans).toHaveLength(2);
    expect(store.plans.find((plan) => plan.date === "2026-08-14")?.totalTarget).toBe(4);
    expect(store.plans.some((plan) => plan.date === "2026-08-13")).toBe(true);
  });

  it("falls back safely when daily plan localStorage is damaged", () => {
    localStorage.setItem(STORAGE_KEYS.dailyPlan, JSON.stringify({ schemaVersion: 1, plans: [{ date: "nope" }] }));
    expect(loadDailyPlanStore()).toEqual({ schemaVersion: 1, plans: [] });
  });
});
