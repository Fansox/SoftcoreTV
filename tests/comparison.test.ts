import { describe, expect, it } from "vitest";
import { compareTodayVsYesterday, compareWeekVsLastWeek } from "@/lib/utils/comparison";

describe("comparison utilities", () => {
  it("compares today vs yesterday using same elapsed window", () => {
    const now = new Date("2024-07-15T14:35:00+02:00");
    const points = [
      { timestamp: "2024-07-15T10:00:00+02:00", value: 100 },
      { timestamp: "2024-07-15T14:00:00+02:00", value: 100 },
      { timestamp: "2024-07-14T10:00:00+02:00", value: 50 },
      { timestamp: "2024-07-14T14:00:00+02:00", value: 50 },
      { timestamp: "2024-07-14T20:00:00+02:00", value: 1000 }
    ];
    const result = compareTodayVsYesterday(points, now, "Europe/Bratislava");
    expect(result.currentValue).toBe(200);
    expect(result.previousValue).toBe(100);
    expect(result.trend).toBe("up");
  });

  it("compares week vs last week with monday week start", () => {
    const now = new Date("2024-07-17T12:00:00+02:00");
    const points = [
      { timestamp: "2024-07-15T09:00:00+02:00", value: 100 },
      { timestamp: "2024-07-16T09:00:00+02:00", value: 100 },
      { timestamp: "2024-07-08T09:00:00+02:00", value: 80 },
      { timestamp: "2024-07-09T09:00:00+02:00", value: 70 }
    ];
    const result = compareWeekVsLastWeek(points, now, "Europe/Bratislava");
    expect(result.currentValue).toBe(200);
    expect(result.previousValue).toBe(150);
  });
});
