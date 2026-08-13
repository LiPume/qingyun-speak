import { describe, expect, it } from "vitest";
import { adaptCiciDataset, detectSchema } from "./ciciAdapter";

const legacy = {
  appName: "Cici",
  questions: [{
    id: "1",
    question: "What is AI/ML? / 什么是人工智能？",
    answer: "It is a broad field.\n\n这是一个广泛领域。",
    tags: ["P01 学术动机"],
    audioFile: "old.mp3",
  }],
};

describe("Cici adapter", () => {
  it("detects and adapts a legacy envelope", () => {
    expect(detectSchema(legacy)).toBe("cici");
    const dataset = adaptCiciDataset(legacy);
    expect(dataset.schemaVersion).toBe(1);
    expect(dataset.questions[0]).toMatchObject({
      id: "1",
      category: "学术动机",
      question: { en: "What is AI/ML?", zh: "什么是人工智能？" },
      legacy: { audioFile: "old.mp3" },
    });
  });

  it("reports an understandable malformed record", () => {
    expect(() => adaptCiciDataset({ questions: [{}] })).toThrow("第 1 道题缺少有效的 question");
  });
});
