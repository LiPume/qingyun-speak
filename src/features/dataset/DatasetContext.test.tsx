import { StrictMode } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import previousDefaultJson from "../../../fixtures/青云研语_QingyunSpeak_Native_V1.json";
import nextDefaultJson from "../../../public/data/default-dataset.json";
import { loadDataset, saveDataset } from "../../storage/storage";
import { DatasetProvider, useDataset } from "./DatasetContext";
import { validateDataset } from "./validation";

function QuestionCount() {
  const { dataset } = useDataset();
  return <span>{dataset?.questions.length ?? 0}</span>;
}

describe("DatasetProvider startup migration", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("appends new defaults in StrictMode while preserving an edited old question", async () => {
    const current = validateDataset(structuredClone(previousDefaultJson));
    current.questions[0] = {
      ...current.questions[0],
      answer: { en: ["My browser edit."], zh: ["我的网页修改。"] },
    };
    saveDataset(current);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => structuredClone(nextDefaultJson),
    }));

    render(<StrictMode><DatasetProvider><QuestionCount /></DatasetProvider></StrictMode>);

    expect(await screen.findByText("170")).toBeVisible();
    expect(loadDataset()?.questions[0].answer.en).toEqual(["My browser edit."]);
    expect(loadDataset()?.questions.at(-1)?.id).toBe("Q170");
  });
});
