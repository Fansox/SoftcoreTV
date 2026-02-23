"use client";

import { ResponsiveContainer, LineChart, Line, Tooltip, CartesianGrid, XAxis, YAxis, BarChart, Bar } from "recharts";

export function RevenueChart({ data }: { data: { hour: string; revenue: number; trips: number }[] }) {
  const prepared = data.map((row) => ({ ...row, hourLabel: new Date(row.hour).getHours().toString().padStart(2, "0") }));
  return (
    <div className="grid h-[340px] grid-cols-2 gap-4">
      <div className="kpi-card h-full">
        <p className="mb-3 text-sm text-slate-400">Kumulatívna tržba dnes</p>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={prepared}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="hourLabel" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="kpi-card h-full">
        <p className="mb-3 text-sm text-slate-400">Jazdy za hodinu</p>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={prepared}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="hourLabel" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="trips" fill="#38bdf8" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
