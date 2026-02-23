import { describe, expect, it } from "vitest";
import { compareTodayVsYesterday } from "@/lib/utils/comparison";

describe("trend indicator states", () => {
  it("returns flat when equal", () => {
    const now = new Date("2024-07-15T12:00:00+02:00");
    const points = [
      { timestamp: "2024-07-15T10:00:00+02:00", value: 100 },
      { timestamp: "2024-07-14T10:00:00+02:00", value: 100 }
    ];
    const result = compareTodayVsYesterday(points, now, "Europe/Bratislava");
    expect(result.trend).toBe("flat");
    expect(result.colorToken).toBe("neutral");
  });
});
