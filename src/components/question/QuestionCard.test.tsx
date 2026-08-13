import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { adaptCiciDataset } from "../../adapters/ciciAdapter";
import { QuestionCard } from "./QuestionCard";

describe("QuestionCard", () => {
  it("shows bilingual content and accessible actions", () => {
    const question = adaptCiciDataset({ questions: [{ question: "Why research? / 为什么做科研？", answer: "I enjoy it.\n\n我喜欢。" }] }).questions[0];
    const speech = { speak: vi.fn(), rate: 0.9, status: "idle", voices: [], selectedVoice: null, supported: true, activeId: null, stop: vi.fn(), pause: vi.fn(), resume: vi.fn(), setVoice: vi.fn(), setRate: vi.fn() } as never;
    render(<MemoryRouter><QuestionCard question={question} speech={speech} onFavorite={vi.fn()} /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Why research?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /朗读问题/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "收藏题目" })).toBeInTheDocument();
  });
});
