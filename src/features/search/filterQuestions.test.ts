import { describe, expect, it } from "vitest";
import { adaptCiciDataset } from "../../adapters/ciciAdapter";
import { filterQuestions } from "./filterQuestions";

describe("filterQuestions", () => {
  it("combines text and favorite filters", () => {
    const [question] = adaptCiciDataset({ questions: [{ question: "Research? / 科研？", answer: "Agents help.\n\n智能体。" }] }).questions;
    question.favorite = true;
    expect(filterQuestions([question], {
      search: "agents", category: "", tag: "", favoriteOnly: true, mastery: "all", practice: "all",
    })).toEqual([question]);
  });

  it("combines module and practice coverage filters", () => {
    const questions = adaptCiciDataset({ questions: [
      { id: "Q1", category: "项目与论文类", question: "Paper? / 论文？", answer: "Answer.\n\n回答。" },
      { id: "Q2", category: "自我情况类", question: "You? / 你？", answer: "Answer.\n\n回答。" },
    ] }).questions;
    questions[0].category = "项目与论文类";
    questions[1].category = "自我情况类";
    const history = { schemaVersion: 1 as const, records: [{ id: "r1", questionId: "Q1", practicedAt: new Date(2026, 7, 14, 9).toISOString() }] };
    expect(filterQuestions(questions, {
      search: "", category: "项目与论文类", tag: "", favoriteOnly: false, mastery: "all", practice: "today",
    }, history, new Date(2026, 7, 14, 12))).toEqual([questions[0]]);
    expect(filterQuestions(questions, {
      search: "", category: "", tag: "", favoriteOnly: false, mastery: "all", practice: "unpracticed",
    }, history)).toEqual([questions[1]]);
  });
});
