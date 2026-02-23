export const CITY_NAMES = [
  "Bratislava",
  "Trnava",
  "Nitra",
  "Nové Zámky",
  "Dunajská Streda",
  "Piešťany",
  "Prievidza",
  "Trenčín",
  "Považská Bystrica",
  "Žilina",
  "Martin",
  "Zvolen",
  "Banská Bystrica",
  "Poprad",
  "Liptovský Mikuláš",
  "Prešov",
  "Košice"
] as const;

export type DriverStatus = "offline" | "online" | "on_trip" | "unknown";
export type RevenuePeriod = "day" | "week" | "month";
export type Trend = "up" | "down" | "flat";
export type ColorToken = "green" | "red" | "neutral";

export interface City {
  id: string;
  name: string;
  timezone: string;
  connectorId?: string;
}

export interface Connector {
  id: string;
  name: string;
  provider: "mock" | "bolt";
  cityIds: string[];
  pollingRevenueSec: number;
  pollingLiveSec: number;
  enabled: boolean;
}

export interface Driver {
  id: string;
  cityId: string;
  name: string;
  vehicle?: string;
}

export interface DriverLiveStatusSnapshot {
  driverId: string;
  cityId: string;
  status: DriverStatus;
  onlineSince?: string;
  lastActivityAt: string;
  sessionRevenue: number;
  sessionTrips: number;
  updatedAt: string;
}

export interface DriverDailyMetrics {
  driverId: string;
  cityId: string;
  date: string;
  revenue: number;
  tripsCompleted: number;
  accepted: number;
  rejected: number;
  onlineDurationSec: number;
}

export interface CityPeriodSummary {
  cityId: string;
  period: RevenuePeriod;
  grossRevenue: number;
  netRevenue: number;
  tripsCompleted: number;
  onlineDrivers: number;
  activeTrips: number;
  totalDrivers: number;
  refreshedAt: string;
}

export interface ComparisonResult {
  currentValue: number;
  previousValue: number;
  absoluteDiff: number;
  percentDiff: number;
  trend: Trend;
  colorToken: ColorToken;
}

export interface FleetGlobalSummary {
  day: CityPeriodSummary;
  week: CityPeriodSummary;
  month: CityPeriodSummary;
  totalOrdersToday: number;
  refreshedAt: string;
}

export interface SyncRun {
  id: string;
  startedAt: string;
  finishedAt?: string;
  status: "ok" | "partial" | "failed";
  details?: string;
}

export interface SyncErrorLog {
  id: string;
  connectorId: string;
  cityId?: string;
  message: string;
  createdAt: string;
}

export interface DashboardPayload {
  cities: City[];
  globalSummary: FleetGlobalSummary;
  citySummaries: CityPeriodSummary[];
  comparisons: {
    day: ComparisonResult;
    week: ComparisonResult;
    month: ComparisonResult;
  };
  hourlySeries: { hour: string; revenue: number; trips: number }[];
  onlineDrivers: Array<{
    driverId: string;
    name: string;
    city: string;
    onlineSince?: string;
    sessionRevenue: number;
  }>;
  alerts: string[];
  lastSyncAt: string;
}
