import { beforeEach, describe, expect, it } from "vitest";
import { adaptCiciDataset } from "../adapters/ciciAdapter";
import { loadDataset, resetDataset, saveDataset, STORAGE_KEYS } from "./storage";

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
});
