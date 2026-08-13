import { beforeEach, describe, expect, it } from "vitest";
import { adaptCiciDataset } from "../adapters/ciciAdapter";
import { isLegacyDefaultDataset, loadDataset, resetDataset, saveDataset, STORAGE_KEYS } from "./storage";

describe("dataset storage", () => {
  beforeEach(() => localStorage.clear());

  it("round trips a valid dataset", () => {
    const dataset = adaptCiciDataset({ questions: [{ question: "Hello? / 你好？", answer: "Hello.\n\n你好。" }] });
    saveDataset(dataset);
    expect(loadDataset()?.questions[0].question.en).toBe("Hello?");
    resetDataset();
    expect(localStorage.getItem(STORAGE_KEYS.dataset)).toBeNull();
  });

  it("ignores corrupt local data", () => {
    localStorage.setItem(STORAGE_KEYS.dataset, "not-json");
    expect(loadDataset()).toBeNull();
  });

  it("recognizes only the shipped legacy default dataset for migration", () => {
    const questions = Array.from({ length: 98 }, (_, index) => ({
      question: `Question ${index + 1}? / 问题 ${index + 1}？`,
      answer: "Answer.\n\n回答。",
      id: String(1785238332773 + index),
      audioFile: `P${index + 1}`,
    }));
    const legacyDefault = adaptCiciDataset({ questions });
    expect(isLegacyDefaultDataset(legacyDefault)).toBe(true);
    expect(isLegacyDefaultDataset({ ...legacyDefault, questions: legacyDefault.questions.slice(0, 97) })).toBe(false);
    expect(isLegacyDefaultDataset({ ...legacyDefault, questions: legacyDefault.questions.map((question) => ({ ...question, legacy: undefined })) })).toBe(false);
  });
});
