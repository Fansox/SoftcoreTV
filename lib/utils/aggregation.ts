import type { CityPeriodSummary } from "@/lib/types/domain";

export const aggregateCitySummaries = (period: "day" | "week" | "month", summaries: CityPeriodSummary[]): CityPeriodSummary => ({
  cityId: "global",
  period,
  grossRevenue: summaries.reduce((a, s) => a + s.grossRevenue, 0),
  netRevenue: summaries.reduce((a, s) => a + s.netRevenue, 0),
  tripsCompleted: summaries.reduce((a, s) => a + s.tripsCompleted, 0),
  onlineDrivers: summaries.reduce((a, s) => a + s.onlineDrivers, 0),
  activeTrips: summaries.reduce((a, s) => a + s.activeTrips, 0),
  totalDrivers: summaries.reduce((a, s) => a + s.totalDrivers, 0),
  refreshedAt: new Date().toISOString()
});
