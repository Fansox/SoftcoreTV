import type { BoltFieldMapping } from "@/lib/integrations/bolt/adapter";
import type { DriverStatus } from "@/lib/types/domain";

export const normalizeStatus = (value: string): DriverStatus => {
  const input = value.toLowerCase();
  if (["online", "available"].includes(input)) return "online";
  if (["on_trip", "busy", "trip"].includes(input)) return "on_trip";
  if (["offline", "inactive"].includes(input)) return "offline";
  return "unknown";
};

export const mapDriverRecord = (source: Record<string, unknown>, mapping: BoltFieldMapping) => ({
  driverId: String(source[mapping.driverId] ?? ""),
  driverName: String(source[mapping.driverName] ?? ""),
  status: normalizeStatus(String(source[mapping.status] ?? "unknown")),
  revenue: Number(source[mapping.revenue] ?? 0),
  trips: Number(source[mapping.trips] ?? 0),
  onlineSince: source[mapping.onlineSince] ? String(source[mapping.onlineSince]) : undefined
});
