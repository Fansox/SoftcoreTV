"use client";

import { useEffect, useMemo, useState } from "react";
import type { FinanceBridgeOverview } from "@/lib/finance/types";
import { currency, dateTime } from "@/lib/utils/format";

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function FinanceBridgePage() {
  const [data, setData] = useState<FinanceBridgeOverview | null>(null);
  const [from, setFrom] = useState(todayIso());
  const [to, setTo] = useState(todayIso());
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qs = useMemo(() => new URLSearchParams({ from, to }).toString(), [from, to]);

  const load = async () => {
    setError(null);
    const res = await fetch(`/api/finance/overview?${qs}`);
    if (!res.ok) throw new Error(`Overview failed: ${res.status}`);
    setData(await res.json());
  };

  const sync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch(`/api/finance/sync?${qs}`, { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Overview failed"));
  }, [qs]);

  return (
    <main className="min-h-screen p-6 lg:p-10">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Softcore Finance Bridge</p>
          <h1 className="mt-2 text-4xl font-bold">Finančný prehľad pre Vladimíru</h1>
          <p className="mt-2 max-w-3xl text-slate-400">
            Read-only finančný most z Bolt Fleet dát. Slúži na kontrolu tržieb, čistých výnosov, provízií,
            tipov, hotovostných rozdielov a interných podkladov po vodičoch.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm text-slate-300">
            Od
            <input className="mt-1 block rounded-xl border border-slate-700 bg-slate-900 px-3 py-2" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </label>
          <label className="text-sm text-slate-300">
            Do
            <input className="mt-1 block rounded-xl border border-slate-700 bg-slate-900 px-3 py-2" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </label>
          <button className="rounded-xl bg-emerald-500 px-5 py-2 font-semibold text-slate-950 disabled:opacity-50" onClick={sync} disabled={syncing}>
            {syncing ? "Synchronizujem..." : "Sync z Bolt Fleet"}
          </button>
        </div>
      </header>

      {error ? <div className="mb-4 rounded-2xl border border-red-500/50 bg-red-950/50 p-4 text-red-200">{error}</div> : null}

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-6">
        <Card label="Jazdy" value={String(data?.totals.orders ?? 0)} />
        <Card label="Vodiči" value={String(data?.totals.drivers ?? 0)} />
        <Card label="Gross" value={currency(data?.totals.grossRevenue ?? 0)} />
        <Card label="Net earnings" value={currency(data?.totals.netEarnings ?? 0)} />
        <Card label="Tipy" value={currency(data?.totals.tips ?? 0)} />
        <Card label="Odhad výplaty" value={currency(data?.totals.payableEstimate ?? 0)} />
      </section>

      <section className="mt-6 rounded-2xl border border-slate-700/60 bg-slate-900/75 shadow-xl">
        <div className="flex flex-col gap-2 border-b border-slate-700/60 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Súhrn po vodičoch</h2>
            <p className="text-sm text-slate-400">
              Posledný sync: {data?.lastSync ? `${data.lastSync.status} · ${dateTime(data.lastSync.startedAt)}` : "zatiaľ bez synchronizácie"}
            </p>
          </div>
          <p className="text-sm text-slate-400">Rozsah: {data ? `${dateTime(data.range.startIso)} – ${dateTime(data.range.endIso)}` : "—"}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-slate-300">
              <tr>
                <Th>Vodič</Th>
                <Th>Vozidlá</Th>
                <Th>Jazdy</Th>
                <Th>Gross</Th>
                <Th>Net</Th>
                <Th>Provízia</Th>
                <Th>Tipy</Th>
                <Th>Cash discount</Th>
                <Th>Úpravy</Th>
                <Th>Odhad výplaty</Th>
              </tr>
            </thead>
            <tbody>
              {(data?.drivers ?? []).map((driver) => (
                <tr key={driver.driverUuid} className="border-t border-slate-800/80 hover:bg-slate-800/50">
                  <Td>
                    <div className="font-semibold">{driver.driverName}</div>
                    <div className="text-xs text-slate-500">{driver.driverPhone ?? driver.driverUuid}</div>
                  </Td>
                  <Td>{driver.vehicles.join(", ") || "—"}</Td>
                  <Td>{driver.rides}</Td>
                  <Td>{currency(driver.grossRevenue)}</Td>
                  <Td>{currency(driver.netEarnings)}</Td>
                  <Td>{currency(driver.commission)}</Td>
                  <Td>{currency(driver.tips)}</Td>
                  <Td>{currency(driver.cashDiscount)}</Td>
                  <Td>{currency(driver.adjustments)}</Td>
                  <Td><span className="font-semibold text-emerald-300">{currency(driver.payableEstimate)}</span></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="kpi-card">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 font-semibold">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="whitespace-nowrap px-4 py-3">{children}</td>;
}
