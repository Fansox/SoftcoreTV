"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { currency, dateTime } from "@/lib/utils/format";

export default function DriverPage() {
  const params = useParams<{ cityId: string; driverId: string }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/driver/${params.cityId}/${params.driverId}`).then((r) => r.json()).then(setData);
  }, [params.cityId, params.driverId]);

  if (!data) return <div className="p-8">Načítavam vodiča...</div>;

  return (
    <main className="min-h-screen p-6">
      <Link href={`/city/${params.cityId}`} className="text-sky-300">← späť na mesto</Link>
      <div className="mt-4 kpi-card max-w-2xl">
        <h1 className="text-3xl font-bold">{data.name}</h1>
        <p className="mt-2 text-slate-300">Stav: {data.status.status}</p>
        <p>Online od: {data.status.onlineSince ? dateTime(data.status.onlineSince) : "-"}</p>
        <p>Dnešná session tržba: {currency(data.status.sessionRevenue)}</p>
        <p>Dnešné jazdy: {data.status.sessionTrips}</p>
        <p>Stav dát: {dateTime(data.status.updatedAt)}</p>
      </div>
    </main>
  );
}
