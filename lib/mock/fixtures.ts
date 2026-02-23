import { CITY_NAMES, type City, type Driver, type DriverLiveStatusSnapshot, type DriverStatus } from "@/lib/types/domain";

const rand = (min: number, max: number) => Math.round(Math.random() * (max - min) + min);

export const citiesFixture: City[] = CITY_NAMES.map((name, idx) => ({
  id: `city_${idx + 1}`,
  name,
  timezone: "Europe/Bratislava",
  connectorId: "mock_default"
}));

const statuses: DriverStatus[] = ["online", "offline", "on_trip"];

export const driversFixture: Driver[] = citiesFixture.flatMap((city) =>
  Array.from({ length: rand(18, 35) }).map((_, i) => ({
    id: `${city.id}_drv_${i + 1}`,
    cityId: city.id,
    name: `Vodič ${city.name.slice(0, 3).toUpperCase()} ${i + 1}`,
    vehicle: ["Škoda Octavia", "Toyota Corolla", "Kia Ceed"][i % 3]
  }))
);

export const initialLiveStatuses = (): DriverLiveStatusSnapshot[] =>
  driversFixture.map((driver) => {
    const status = statuses[rand(0, statuses.length - 1)];
    const now = new Date();
    return {
      driverId: driver.id,
      cityId: driver.cityId,
      status,
      onlineSince: status === "offline" ? undefined : new Date(now.getTime() - rand(5, 200) * 60000).toISOString(),
      lastActivityAt: new Date(now.getTime() - rand(1, 20) * 60000).toISOString(),
      sessionRevenue: status === "offline" ? 0 : rand(5, 180),
      sessionTrips: status === "offline" ? 0 : rand(0, 14),
      updatedAt: now.toISOString()
    };
  });
