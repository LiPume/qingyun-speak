import { describe, expect, it } from "vitest";
import { adaptCiciDataset } from "../../adapters/ciciAdapter";
import { createFullTrainingBackup, parseFullTrainingBackup } from "./backup";

describe("full training backup", () => {
  it("round trips dataset, practice history, plans, and settings", () => {
    const dataset = adaptCiciDataset({ questions: [{ question: "Why? / 为什么？", answer: "Because.\n\n因为。" }] });
    const history = { schemaVersion: 1 as const, records: [{ id: "r1", questionId: dataset.questions[0].id, practicedAt: new Date().toISOString() }] };
    const plans = { schemaVersion: 1 as const, plans: [{ date: "2026-08-14", moduleTargets: [{ category: "未分类", targetCount: 1 }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] };
    const backup = createFullTrainingBackup(dataset, history, plans, { rate: 0.9 });
    expect(parseFullTrainingBackup(JSON.parse(JSON.stringify(backup)))).toEqual(backup);
  });

  it("rejects a file that only looks like a backup", () => {
    expect(() => parseFullTrainingBackup({ schemaVersion: 1, app: "Qingyun Speak" })).toThrow(/无法识别/);
  });
});
