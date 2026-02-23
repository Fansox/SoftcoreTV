"use client";

import { useEffect, useMemo, useState } from "react";
import { CityGrid } from "@/components/dashboard/cityGrid";
import { KpiCard } from "@/components/dashboard/kpiCard";
import { RevenueChart } from "@/components/dashboard/revenueChart";
import { TrendBadge } from "@/components/ui/trendBadge";
import type { DashboardPayload } from "@/lib/types/domain";
import { currency, dateTime } from "@/lib/utils/format";

export default function HomePage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [mode, setMode] = useState<"tv" | "operator">("tv");

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
    const evt = new EventSource("/api/stream");
    evt.onmessage = (e) => setData(JSON.parse(e.data));
    return () => evt.close();
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "f") document.documentElement.requestFullscreen();
      if (event.key.toLowerCase() === "r") fetch("/api/dashboard").then((r) => r.json()).then(setData);
      if (event.key.toLowerCase() === "g") window.location.href = "/";
      if (event.key === "Escape") document.exitFullscreen();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const kpis = useMemo(() => {
    if (!data) return [];
    return [
      { label: "Tržba dnes", val: currency(data.globalSummary.day.grossRevenue), cmp: data.comparisons.day },
      { label: "Tržba tento týždeň", val: currency(data.globalSummary.week.grossRevenue), cmp: data.comparisons.week },
      { label: "Tržba tento mesiac", val: currency(data.globalSummary.month.grossRevenue), cmp: data.comparisons.month },
      { label: "Online vodiči", val: String(data.globalSummary.day.onlineDrivers) },
      { label: "Aktívne jazdy", val: String(data.globalSummary.day.activeTrips) },
      { label: "Objednávky dnes", val: String(data.globalSummary.totalOrdersToday) }
    ];
  }, [data]);

  if (!data) return <div className="p-8 text-2xl">Načítavam dáta...</div>;

  return (
    <main className="min-h-screen p-6 lg:p-10">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Bolt Fleet TV Dashboard</h1>
          <p className="mt-2 text-slate-400">Posledná synchronizácia: {dateTime(data.lastSyncAt)}</p>
        </div>
        <button className="rounded-xl border border-slate-700 px-4 py-2" onClick={() => setMode(mode === "tv" ? "operator" : "tv")}>
          Režim: {mode === "tv" ? "TV" : "Operator"}
        </button>
      </header>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-6">
        {kpis.map((k) => (
          <KpiCard key={k.label} title={k.label} value={k.val} subtitle={k.cmp ? <TrendBadge value={k.cmp} /> : undefined} />
        ))}
      </section>

      <section className="mt-6">
        <RevenueChart data={data.hourlySeries} />
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-2xl font-semibold">Mestá</h2>
        <CityGrid cities={data.cities} daySummaries={data.citySummaries} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="kpi-card">
          <h3 className="mb-2 text-lg">Aktuálne online vodiči</h3>
          <div className="space-y-1 text-sm">
            {data.onlineDrivers.map((d) => (
              <p key={d.driverId}>
                {d.name} · {d.city} · {currency(d.sessionRevenue)}
              </p>
            ))}
          </div>
        </div>
        <div className="kpi-card">
          <h3 className="mb-2 text-lg">Upozornenia</h3>
          <ul className="list-inside list-disc text-sm text-amber-300">
            {data.alerts.map((alert) => (
              <li key={alert}>{alert}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
