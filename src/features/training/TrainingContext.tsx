import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { addLocalDays, getLocalDateKey } from "../../lib/localDate";
import type { DailyPlan, DailyPlanModuleTarget, DailyPlanStore, PracticeRecord, TrainingHistory } from "../../models/training";
import {
  clearDailyPlans as clearStoredDailyPlans,
  clearTrainingHistory as clearStoredTrainingHistory,
  loadDailyPlanStore,
  loadTrainingHistory,
  saveDailyPlanStore,
  saveTrainingHistory,
} from "../../storage/trainingStorage";

interface TrainingContextValue {
  history: TrainingHistory;
  dailyPlans: DailyPlanStore;
  addPractice: (questionId: string, practicedAt?: Date) => PracticeRecord;
  undoPractice: (recordId: string) => void;
  savePlan: (date: string, moduleTargets: DailyPlanModuleTarget[]) => DailyPlan;
  removePlan: (date: string) => void;
  copyYesterdayPlan: (date?: string) => DailyPlan | null;
  clearTrainingHistory: () => void;
  clearDailyPlans: () => void;
  replaceTrainingData: (history: TrainingHistory, dailyPlans: DailyPlanStore) => void;
}

const TrainingContext = createContext<TrainingContextValue | null>(null);

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<TrainingHistory>(loadTrainingHistory);
  const [dailyPlans, setDailyPlans] = useState<DailyPlanStore>(loadDailyPlanStore);

  const addPractice = useCallback((questionId: string, practicedAt = new Date()) => {
    const record: PracticeRecord = { id: crypto.randomUUID(), questionId, practicedAt: practicedAt.toISOString() };
    setHistory((current) => {
      const next = { schemaVersion: 1 as const, records: [...current.records, record] };
      saveTrainingHistory(next);
      return next;
    });
    return record;
  }, []);

  const undoPractice = useCallback((recordId: string) => {
    setHistory((current) => {
      const next = { schemaVersion: 1 as const, records: current.records.filter((record) => record.id !== recordId) };
      saveTrainingHistory(next);
      return next;
    });
  }, []);

  const savePlan = useCallback((date: string, moduleTargets: DailyPlanModuleTarget[]) => {
    const now = new Date().toISOString();
    const existing = dailyPlans.plans.find((plan) => plan.date === date);
    const targets = new Map(moduleTargets.filter((target) => target.targetCount > 0).map((target) => [target.category, Math.round(target.targetCount)]));
    const normalizedTargets = [...targets].map(([category, targetCount]) => ({ category, targetCount }));
    const plan: DailyPlan = {
      date,
      moduleTargets: normalizedTargets,
      totalTarget: normalizedTargets.reduce((sum, target) => sum + target.targetCount, 0),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    const next: DailyPlanStore = { schemaVersion: 1, plans: [...dailyPlans.plans.filter((item) => item.date !== date), plan].sort((a, b) => b.date.localeCompare(a.date)) };
    saveDailyPlanStore(next);
    setDailyPlans(next);
    return plan;
  }, [dailyPlans]);

  const removePlan = useCallback((date: string) => {
    setDailyPlans((current) => {
      const next = { schemaVersion: 1 as const, plans: current.plans.filter((plan) => plan.date !== date) };
      saveDailyPlanStore(next);
      return next;
    });
  }, []);

  const copyYesterdayPlan = useCallback((date = getLocalDateKey()) => {
    const yesterday = dailyPlans.plans.find((plan) => plan.date === addLocalDays(date, -1));
    return yesterday ? savePlan(date, yesterday.moduleTargets) : null;
  }, [dailyPlans, savePlan]);

  const clearTrainingHistory = useCallback(() => {
    clearStoredTrainingHistory();
    setHistory({ schemaVersion: 1, records: [] });
  }, []);

  const clearDailyPlans = useCallback(() => {
    clearStoredDailyPlans();
    setDailyPlans({ schemaVersion: 1, plans: [] });
  }, []);

  const replaceTrainingData = useCallback((nextHistory: TrainingHistory, nextDailyPlans: DailyPlanStore) => {
    saveTrainingHistory(nextHistory);
    saveDailyPlanStore(nextDailyPlans);
    setHistory(nextHistory);
    setDailyPlans(nextDailyPlans);
  }, []);

  const value = useMemo<TrainingContextValue>(() => ({
    history,
    dailyPlans,
    addPractice,
    undoPractice,
    savePlan,
    removePlan,
    copyYesterdayPlan,
    clearTrainingHistory,
    clearDailyPlans,
    replaceTrainingData,
  }), [addPractice, clearDailyPlans, clearTrainingHistory, copyYesterdayPlan, dailyPlans, history, removePlan, replaceTrainingData, savePlan, undoPractice]);

  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
}

export function useTraining() {
  const context = useContext(TrainingContext);
  if (!context) throw new Error("useTraining must be used inside TrainingProvider");
  return context;
}
