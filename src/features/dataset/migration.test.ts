import { describe, expect, it } from "vitest";
import type { InterviewDataset, InterviewQuestion } from "../../models/dataset";
import { appendMissingDefaultQuestions, isPreviousDefaultDataset } from "./migration";

function question(id: string, answer = "Original answer."): InterviewQuestion {
  return {
    id,
    category: "测试分类",
    question: { en: `Question ${id}?`, zh: `问题 ${id}？` },
    thinking: [],
    phrases: [],
    answer: { en: [answer], zh: ["原回答。"] },
    keywords: [],
    fallbacks: [],
    tags: [],
    favorite: false,
    mastery: 0,
  };
}

function previousDefault(): InterviewDataset {
  const middle = Array.from({ length: 140 }, (_, index) => question(`old-${index + 1}`));
  return {
    schemaVersion: 1,
    metadata: { name: "用户修改后的 142 题", updatedAt: "2026-08-21T00:00:00.000Z" },
    questions: [question("Q01", "My edited answer."), ...middle, question("1785238332870")],
    pronunciation: Array.from({ length: 42 }, (_, index) => ({
      id: `p${index + 1}`,
      en: `Word ${index + 1}`,
      zh: `词 ${index + 1}`,
      category: "Personal" as const,
      note: "",
      mastery: 0,
    })),
  };
}

describe("default dataset append migration", () => {
  it("recognizes only the previous 142-question default shape", () => {
    const previous = previousDefault();
    expect(isPreviousDefaultDataset(previous)).toBe(true);
    expect(isPreviousDefaultDataset({ ...previous, questions: previous.questions.slice(1) })).toBe(false);
    expect(isPreviousDefaultDataset({ ...previous, questions: [question("custom"), ...previous.questions.slice(1)] })).toBe(false);
    expect(isPreviousDefaultDataset({ ...previous, pronunciation: previous.pronunciation.slice(1) })).toBe(false);
  });

  it("appends missing defaults without replacing local edits or pronunciation", () => {
    const current = previousDefault();
    const nextDefault: InterviewDataset = {
      ...current,
      metadata: { name: "170 题默认库", updatedAt: "2026-08-22T00:00:00.000Z" },
      questions: [...current.questions, question("Q143"), question("Q144")],
    };

    const migrated = appendMissingDefaultQuestions(current, nextDefault);

    expect(migrated.questions).toHaveLength(144);
    expect(migrated.questions[0]).toBe(current.questions[0]);
    expect(migrated.questions[0].answer.en).toEqual(["My edited answer."]);
    expect(migrated.questions.slice(-2).map((item) => item.id)).toEqual(["Q143", "Q144"]);
    expect(migrated.metadata).toBe(current.metadata);
    expect(migrated.pronunciation).toBe(current.pronunciation);
  });
});
