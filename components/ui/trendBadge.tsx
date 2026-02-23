import { percent } from "@/lib/utils/format";
import type { ComparisonResult } from "@/lib/types/domain";

const tone = {
  green: "text-emerald-300 bg-emerald-500/10 border-emerald-500/40",
  red: "text-rose-300 bg-rose-500/10 border-rose-500/40",
  neutral: "text-slate-300 bg-slate-500/10 border-slate-500/40"
};

export function TrendBadge({ value }: { value: ComparisonResult }) {
  return <span className={`rounded-full border px-3 py-1 text-sm ${tone[value.colorToken]}`}>{percent(value.percentDiff)}</span>;
}
