import { describe, expect, it, vi } from "vitest";
import { parseLegacyAnswer, splitBilingualQuestion, splitEnglishSentences } from "./sentence";

describe("text parsers", () => {
  it("splits on the bilingual delimiter without breaking an English slash", () => {
    expect(splitBilingualQuestion("AI/ML: why now? / 为什么现在研究 AI？")).toEqual({
      en: "AI/ML: why now?",
      zh: "为什么现在研究 AI？",
    });
  });

  it("segments English and preserves abbreviations in fallback mode", () => {
    vi.stubGlobal("Intl", {});
    expect(splitEnglishSentences("Dr. Li studies agents. They use tools!"))
      .toEqual(["Dr. Li studies agents.", "They use tools!"]);
    vi.unstubAllGlobals();
  });

  it("separates English answer and Chinese notes", () => {
    const result = parseLegacyAnswer("I enjoy research. It is creative.\n\n我喜欢科研。它很有创造性。 ");
    expect(result.en).toHaveLength(2);
    expect(result.zh).toEqual(["我喜欢科研。", "它很有创造性。"]);
  });
});
