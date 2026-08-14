import { describe, expect, it } from "vitest";
import { addLocalDays, getLocalDateKey, isLocalDateKey, parseLocalDateKey } from "./localDate";

describe("local date helpers", () => {
  it("uses the user's calendar date instead of slicing UTC ISO", () => {
    const lateLocalTime = new Date(2026, 7, 14, 23, 45);
    expect(getLocalDateKey(lateLocalTime)).toBe("2026-08-14");
  });

  it("adds days across month boundaries and rejects impossible dates", () => {
    expect(addLocalDays("2026-08-31", 1)).toBe("2026-09-01");
    expect(getLocalDateKey(parseLocalDateKey("2026-02-28"))).toBe("2026-02-28");
    expect(isLocalDateKey("2026-02-30")).toBe(false);
  });
});
