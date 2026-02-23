import type { City, CityPeriodSummary, Driver, DriverLiveStatusSnapshot, RevenuePeriod } from "@/lib/types/domain";

export interface BoltFieldMapping {
  driverId: string;
  driverName: string;
  status: string;
  revenue: string;
  trips: string;
  onlineSince: string;
}

export interface BoltAdapter {
  fetchCities(): Promise<City[]>;
  fetchCitySummary(cityId: string, range: RevenuePeriod): Promise<CityPeriodSummary>;
  fetchCityDrivers(cityId: string): Promise<Driver[]>;
  fetchDriverDetail(cityId: string, driverId: string): Promise<Driver & { status: DriverLiveStatusSnapshot }>;
  fetchLiveStatuses(cityId: string): Promise<DriverLiveStatusSnapshot[]>;
  fetchRevenueSeries(
    cityId: string,
    range: RevenuePeriod,
    granularity: "hour" | "day"
  ): Promise<Array<{ timestamp: string; revenue: number; trips: number }>>;
}
