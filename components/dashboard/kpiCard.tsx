"use client";

import { motion } from "framer-motion";

export function KpiCard({ title, value, subtitle }: { title: string; value: string; subtitle?: React.ReactNode }) {
  return (
    <motion.div layout className="kpi-card" initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}>
      <p className="text-sm uppercase text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {subtitle ? <div className="mt-2">{subtitle}</div> : null}
    </motion.div>
  );
}
