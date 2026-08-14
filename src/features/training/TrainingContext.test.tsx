import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { addLocalDays, getLocalDateKey } from "../../lib/localDate";
import { saveDailyPlanStore } from "../../storage/trainingStorage";
import { TrainingProvider, useTraining } from "./TrainingContext";

describe("TrainingContext daily plan actions", () => {
  beforeEach(() => localStorage.clear());
  const wrapper = ({ children }: { children: ReactNode }) => <TrainingProvider>{children}</TrainingProvider>;

  it("copies yesterday's module targets into today while retaining old plan history", () => {
    const today = getLocalDateKey();
    const yesterday = addLocalDays(today, -1);
    const timestamp = new Date().toISOString();
    saveDailyPlanStore({ schemaVersion: 1, plans: [{
      date: yesterday,
      moduleTargets: [{ category: "项目与论文类", targetCount: 3 }],
      totalTarget: 3,
      createdAt: timestamp,
      updatedAt: timestamp,
    }] });
    const { result } = renderHook(() => useTraining(), { wrapper });
    act(() => { result.current.copyYesterdayPlan(today); });
    expect(result.current.dailyPlans.plans.find((plan) => plan.date === today)?.moduleTargets).toEqual([{ category: "项目与论文类", targetCount: 3 }]);
    expect(result.current.dailyPlans.plans.some((plan) => plan.date === yesterday)).toBe(true);
  });
});
