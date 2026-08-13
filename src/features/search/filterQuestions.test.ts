import { describe, expect, it } from "vitest";
import { adaptCiciDataset } from "../../adapters/ciciAdapter";
import { filterQuestions } from "./filterQuestions";

describe("filterQuestions", () => {
  it("combines text and favorite filters", () => {
    const [question] = adaptCiciDataset({ questions: [{ question: "Research? / 科研？", answer: "Agents help.\n\n智能体。" }] }).questions;
    question.favorite = true;
    expect(filterQuestions([question], {
      search: "agents", category: "", tag: "", favoriteOnly: true, mastery: "all",
    })).toEqual([question]);
  });
});
