import Link from "next/link";
import { currency } from "@/lib/utils/format";
import { isStale } from "@/lib/utils/stale";

export function CityGrid({
  cities,
  daySummaries
}: {
  cities: { id: string; name: string }[];
  daySummaries: {
    cityId: string;
    grossRevenue: number;
    onlineDrivers: number;
    totalDrivers: number;
    refreshedAt: string;
  }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {cities.map((city) => {
        const summary = daySummaries.find((s) => s.cityId === city.id);
        if (!summary) return null;
        const stale = isStale(summary.refreshedAt, 300);
        return (
          <Link href={`/city/${city.id}`} key={city.id} className="kpi-card block transition hover:border-sky-400/60">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-medium">{city.name}</h3>
              <span className={`h-3 w-3 rounded-full ${stale ? "bg-amber-400" : "bg-emerald-400"}`} />
            </div>
            <p className="mt-3 text-2xl font-semibold">{currency(summary.grossRevenue)}</p>
            <p className="mt-1 text-sm text-slate-400">
              Online: {summary.onlineDrivers}/{summary.totalDrivers}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
