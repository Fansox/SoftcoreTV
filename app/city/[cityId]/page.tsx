"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { currency } from "@/lib/utils/format";
import Link from "next/link";

type CityApi = {
  day: { grossRevenue: number; onlineDrivers: number; activeTrips: number };
  week: { grossRevenue: number };
  month: { grossRevenue: number };
  drivers: Array<{ id: string; name: string; vehicle?: string }>;
};

export default function CityPage() {
  const params = useParams<{ cityId: string }>();
  const [data, setData] = useState<CityApi | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(`/api/city/${params.cityId}`).then((r) => r.json()).then(setData);
  }, [params.cityId]);

  const filtered = useMemo(
    () => data?.drivers.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()) || d.id.includes(query)) ?? [],
    [data, query]
  );

  if (!data) return <div className="p-8">Načítavam mesto...</div>;

  return (
    <main className="min-h-screen p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Detail mesta</h1>
        <Link href="/" className="rounded-lg border border-slate-700 px-3 py-2">Globálny pohľad</Link>
      </div>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="kpi-card">Tržba dnes: {currency(data.day.grossRevenue)}</div>
        <div className="kpi-card">Tržba týždeň: {currency(data.week.grossRevenue)}</div>
        <div className="kpi-card">Tržba mesiac: {currency(data.month.grossRevenue)}</div>
      </section>
      <section className="mt-6 kpi-card">
        <h2 className="text-xl">Vodiči</h2>
        <input className="mt-3 w-full rounded bg-slate-800 p-2" placeholder="Hľadať vodiča /" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          {filtered.slice(0, 30).map((driver) => (
            <Link key={driver.id} href={`/driver/${params.cityId}/${driver.id}`} className="rounded border border-slate-700 p-3 hover:border-sky-400">
              <p>{driver.name}</p>
              <p className="text-xs text-slate-400">{driver.vehicle}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
