import { describe, expect, it } from "vitest";
import { mapDriverRecord, normalizeStatus } from "@/lib/utils/mapping";

describe("mapping", () => {
  it("normalizes source fields", () => {
    const mapped = mapDriverRecord(
      { id: "d1", full_name: "Test", state: "busy", earned: "42", trips_done: 3, online_at: "2024-01-01" },
      { driverId: "id", driverName: "full_name", status: "state", revenue: "earned", trips: "trips_done", onlineSince: "online_at" }
    );
    expect(mapped.status).toBe("on_trip");
    expect(mapped.revenue).toBe(42);
  });

  it("maps unknown statuses", () => {
    expect(normalizeStatus("zzz")).toBe("unknown");
  });
});
