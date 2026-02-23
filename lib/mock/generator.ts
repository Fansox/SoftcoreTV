import { addHours } from "date-fns";

export const generateHourlySeries = (base = 300): { hour: string; revenue: number; trips: number }[] => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  let cumulative = 0;
  return Array.from({ length: 24 }).map((_, i) => {
    const lift = Math.max(0, Math.sin((i / 24) * Math.PI * 1.8) * base + Math.random() * 120);
    cumulative += lift;
    return {
      hour: addHours(start, i).toISOString(),
      revenue: Math.round(cumulative),
      trips: Math.round(lift / 12)
    };
  });
};
