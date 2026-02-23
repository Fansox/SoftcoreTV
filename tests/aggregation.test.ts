import { describe, expect, it } from "vitest";
import { aggregateCitySummaries } from "@/lib/utils/aggregation";

describe("aggregation", () => {
  it("aggregates city summaries", () => {
    const result = aggregateCitySummaries("day", [
      { cityId: "a", period: "day", grossRevenue: 100, netRevenue: 90, tripsCompleted: 10, onlineDrivers: 2, activeTrips: 1, totalDrivers: 3, refreshedAt: "2024" },
      { cityId: "b", period: "day", grossRevenue: 200, netRevenue: 180, tripsCompleted: 20, onlineDrivers: 3, activeTrips: 2, totalDrivers: 4, refreshedAt: "2024" }
    ]);
    expect(result.grossRevenue).toBe(300);
    expect(result.onlineDrivers).toBe(5);
  });
});
