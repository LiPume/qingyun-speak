import { isLocalDateKey } from "../lib/localDate";
import type { DailyPlan, DailyPlanStore, PracticeRecord, TrainingHistory } from "../models/training";
import { STORAGE_KEYS } from "./storage";

export const EMPTY_TRAINING_HISTORY: TrainingHistory = { schemaVersion: 1, records: [] };
export const EMPTY_DAILY_PLAN_STORE: DailyPlanStore = { schemaVersion: 1, plans: [] };

function isIsoDateTime(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && !Number.isNaN(Date.parse(value));
}

function isPracticeRecord(value: unknown): value is PracticeRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<PracticeRecord>;
  return typeof record.id === "string" && record.id.length > 0 &&
    typeof record.questionId === "string" && record.questionId.length > 0 &&
    isIsoDateTime(record.practicedAt);
}

export function validateTrainingHistory(value: unknown): TrainingHistory {
  if (!value || typeof value !== "object") throw new Error("练习历史必须是对象。");
  const history = value as Partial<TrainingHistory>;
  if (history.schemaVersion !== 1 || !Array.isArray(history.records) || !history.records.every(isPracticeRecord)) {
    throw new Error("练习历史格式无效。");
  }
  return { schemaVersion: 1, records: [...history.records] };
}

function isDailyPlan(value: unknown): value is DailyPlan {
  if (!value || typeof value !== "object") return false;
  const plan = value as Partial<DailyPlan>;
  return typeof plan.date === "string" && isLocalDateKey(plan.date) &&
    Array.isArray(plan.moduleTargets) &&
    plan.moduleTargets.every((target) => Boolean(target) && typeof target.category === "string" && target.category.trim().length > 0 && Number.isInteger(target.targetCount) && target.targetCount > 0) &&
    (plan.totalTarget === undefined || (Number.isInteger(plan.totalTarget) && plan.totalTarget >= 0)) &&
    isIsoDateTime(plan.createdAt) && isIsoDateTime(plan.updatedAt);
}

export function validateDailyPlanStore(value: unknown): DailyPlanStore {
  if (!value || typeof value !== "object") throw new Error("每日计划必须是对象。");
  const store = value as Partial<DailyPlanStore>;
  if (store.schemaVersion !== 1 || !Array.isArray(store.plans) || !store.plans.every(isDailyPlan)) {
    throw new Error("每日计划格式无效。");
  }
  return { schemaVersion: 1, plans: [...store.plans] };
}

function safeRead(key: string): unknown {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

function safeWrite(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The in-memory React state remains usable when storage is unavailable.
  }
}

export function loadTrainingHistory(): TrainingHistory {
  try {
    const value = safeRead(STORAGE_KEYS.training);
    return value ? validateTrainingHistory(value) : { ...EMPTY_TRAINING_HISTORY, records: [] };
  } catch {
    return { ...EMPTY_TRAINING_HISTORY, records: [] };
  }
}

export function saveTrainingHistory(history: TrainingHistory): void {
  safeWrite(STORAGE_KEYS.training, validateTrainingHistory(history));
}

export function addPracticeRecord(questionId: string, practicedAt = new Date()): PracticeRecord {
  const record: PracticeRecord = {
    id: crypto.randomUUID(),
    questionId,
    practicedAt: practicedAt.toISOString(),
  };
  const history = loadTrainingHistory();
  saveTrainingHistory({ schemaVersion: 1, records: [...history.records, record] });
  return record;
}

export function removePracticeRecord(recordId: string): void {
  const history = loadTrainingHistory();
  saveTrainingHistory({ schemaVersion: 1, records: history.records.filter((record) => record.id !== recordId) });
}

export function clearTrainingHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.training);
  } catch {
    // Keep destructive settings actions safe in restricted storage environments.
  }
}

export function loadDailyPlanStore(): DailyPlanStore {
  try {
    const value = safeRead(STORAGE_KEYS.dailyPlan);
    return value ? validateDailyPlanStore(value) : { ...EMPTY_DAILY_PLAN_STORE, plans: [] };
  } catch {
    return { ...EMPTY_DAILY_PLAN_STORE, plans: [] };
  }
}

export function saveDailyPlanStore(store: DailyPlanStore): void {
  safeWrite(STORAGE_KEYS.dailyPlan, validateDailyPlanStore(store));
}

export function normalizeDailyPlan(plan: DailyPlan): DailyPlan {
  const targets = new Map<string, number>();
  for (const target of plan.moduleTargets) {
    const category = target.category.trim();
    if (category && target.targetCount > 0) targets.set(category, Math.round(target.targetCount));
  }
  const moduleTargets = [...targets].map(([category, targetCount]) => ({ category, targetCount }));
  return {
    ...plan,
    moduleTargets,
    totalTarget: moduleTargets.reduce((sum, target) => sum + target.targetCount, 0),
  };
}

export function saveDailyPlan(plan: DailyPlan): DailyPlanStore {
  const normalized = normalizeDailyPlan(plan);
  const current = loadDailyPlanStore();
  const plans = [...current.plans.filter((item) => item.date !== normalized.date), normalized]
    .sort((a, b) => b.date.localeCompare(a.date));
  const next: DailyPlanStore = { schemaVersion: 1, plans };
  saveDailyPlanStore(next);
  return next;
}

export function removeDailyPlan(date: string): DailyPlanStore {
  const current = loadDailyPlanStore();
  const next: DailyPlanStore = { schemaVersion: 1, plans: current.plans.filter((plan) => plan.date !== date) };
  saveDailyPlanStore(next);
  return next;
}

export function clearDailyPlans(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.dailyPlan);
  } catch {
    // Keep destructive settings actions safe in restricted storage environments.
  }
}
