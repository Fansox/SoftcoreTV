import type { BoltAdapter } from "@/lib/integrations/bolt/adapter";
import { citiesFixture, driversFixture, initialLiveStatuses } from "@/lib/mock/fixtures";
import { generateHourlySeries } from "@/lib/mock/generator";
import type { CityPeriodSummary, DriverLiveStatusSnapshot, RevenuePeriod } from "@/lib/types/domain";

let liveStatuses = initialLiveStatuses();

const mutateStatuses = () => {
  liveStatuses = liveStatuses.map((status) => {
    const n = Math.random();
    const next = n > 0.88 ? "on_trip" : n > 0.35 ? "online" : "offline";
    return {
      ...status,
      status: next,
      sessionRevenue: next === "offline" ? 0 : Math.max(0, status.sessionRevenue + Math.random() * 8),
      sessionTrips: next === "offline" ? 0 : status.sessionTrips + (Math.random() > 0.86 ? 1 : 0),
      updatedAt: new Date().toISOString()
    };
  });
};

const mkSummary = (cityId: string, period: RevenuePeriod): CityPeriodSummary => {
  const cityDrivers = liveStatuses.filter((s) => s.cityId === cityId);
  const multiplier = period === "day" ? 1 : period === "week" ? 6.2 : 24;
  const gross = cityDrivers.reduce((acc, d) => acc + d.sessionRevenue, 0) * multiplier;
  const online = cityDrivers.filter((d) => d.status !== "offline").length;
  const trips = cityDrivers.reduce((acc, d) => acc + d.sessionTrips, 0);
  return {
    cityId,
    period,
    grossRevenue: Math.round(gross),
    netRevenue: Math.round(gross * 0.84),
    tripsCompleted: Math.round(trips * multiplier),
    onlineDrivers: online,
    activeTrips: cityDrivers.filter((d) => d.status === "on_trip").length,
    totalDrivers: cityDrivers.length,
    refreshedAt: new Date().toISOString()
  };
};

export class MockBoltProvider implements BoltAdapter {
  async fetchCities() {
    return citiesFixture;
  }

  async fetchCitySummary(cityId: string, range: RevenuePeriod) {
    mutateStatuses();
    return mkSummary(cityId, range);
  }

  async fetchCityDrivers(cityId: string) {
    return driversFixture.filter((driver) => driver.cityId === cityId);
  }

  async fetchDriverDetail(cityId: string, driverId: string) {
    const driver = driversFixture.find((d) => d.cityId === cityId && d.id === driverId);
    const status = liveStatuses.find((s) => s.cityId === cityId && s.driverId === driverId) as DriverLiveStatusSnapshot;
    if (!driver || !status) throw new Error("Driver not found");
    return { ...driver, status };
  }

  async fetchLiveStatuses(cityId: string) {
    mutateStatuses();
    return liveStatuses.filter((s) => s.cityId === cityId);
  }

  async fetchRevenueSeries() {
    return generateHourlySeries().map((h) => ({ timestamp: h.hour, revenue: h.revenue, trips: h.trips }));
  }
}
