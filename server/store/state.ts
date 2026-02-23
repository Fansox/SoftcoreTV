import { boltAdapter } from "@/lib/integrations/bolt";
import { compareMonthVsLastMonth, compareTodayVsYesterday, compareWeekVsLastWeek } from "@/lib/utils/comparison";
import type { DashboardPayload, FleetGlobalSummary, RevenuePeriod } from "@/lib/types/domain";
import { citiesFixture, driversFixture } from "@/lib/mock/fixtures";

const sumBy = <T>(arr: T[], pick: (item: T) => number) => arr.reduce((acc, i) => acc + pick(i), 0);

class DashboardState {
  payload?: DashboardPayload;

  async refresh() {
    const cities = await boltAdapter.fetchCities();
    const day = await Promise.all(cities.map((c) => boltAdapter.fetchCitySummary(c.id, "day")));
    const week = await Promise.all(cities.map((c) => boltAdapter.fetchCitySummary(c.id, "week")));
    const month = await Promise.all(cities.map((c) => boltAdapter.fetchCitySummary(c.id, "month")));

    const aggregate = (period: RevenuePeriod, summaries: typeof day): FleetGlobalSummary[RevenuePeriod] => ({
      cityId: "global",
      period,
      grossRevenue: sumBy(summaries, (s) => s.grossRevenue),
      netRevenue: sumBy(summaries, (s) => s.netRevenue),
      tripsCompleted: sumBy(summaries, (s) => s.tripsCompleted),
      onlineDrivers: sumBy(summaries, (s) => s.onlineDrivers),
      activeTrips: sumBy(summaries, (s) => s.activeTrips),
      totalDrivers: sumBy(summaries, (s) => s.totalDrivers),
      refreshedAt: new Date().toISOString()
    });

    const globalSummary = {
      day: aggregate("day", day),
      week: aggregate("week", week),
      month: aggregate("month", month),
      totalOrdersToday: sumBy(day, (s) => s.tripsCompleted),
      refreshedAt: new Date().toISOString()
    };

    const hourlySeries = (await boltAdapter.fetchRevenueSeries(cities[0]?.id ?? "city_1", "day", "hour")).map((row) => ({
      hour: row.timestamp,
      revenue: row.revenue,
      trips: row.trips
    }));

    const points = hourlySeries.map((h) => ({ timestamp: h.hour, value: h.revenue }));
    this.payload = {
      cities,
      globalSummary,
      citySummaries: day,
      comparisons: {
        day: compareTodayVsYesterday(points),
        week: compareWeekVsLastWeek(points),
        month: compareMonthVsLastMonth(points)
      },
      hourlySeries,
      onlineDrivers: driversFixture.slice(0, 12).map((d) => ({
        driverId: d.id,
        name: d.name,
        city: citiesFixture.find((c) => c.id === d.cityId)?.name ?? d.cityId,
        onlineSince: new Date(Date.now() - Math.random() * 1000 * 60 * 120).toISOString(),
        sessionRevenue: Math.round(Math.random() * 200)
      })),
      alerts: ["Token connectora vyprší o 2 dni", "Mesto Poprad má spomalenú synchronizáciu"],
      lastSyncAt: new Date().toISOString()
    };
    return this.payload;
  }
}

export const dashboardState = new DashboardState();
