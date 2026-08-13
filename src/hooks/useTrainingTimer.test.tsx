import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTrainingTimer } from "./useTrainingTimer";

describe("useTrainingTimer", () => {
  afterEach(() => vi.useRealTimers());
  it("counts down, pauses and changes rounds", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTrainingTimer());
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.remaining).toBe(88);
    act(() => result.current.pause());
    act(() => result.current.selectDuration(60));
    expect(result.current).toMatchObject({ duration: 60, remaining: 60, running: false });
  });
});
