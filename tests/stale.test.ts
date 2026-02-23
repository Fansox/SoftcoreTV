import { describe, expect, it } from "vitest";
import { isStale } from "@/lib/utils/stale";

describe("stale detector", () => {
  it("detects stale values", () => {
    expect(isStale(new Date(Date.now() - 200000).toISOString(), 120)).toBe(true);
  });
});
