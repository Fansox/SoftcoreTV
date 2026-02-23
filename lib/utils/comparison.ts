import { addDays, addMonths, addWeeks, differenceInMilliseconds, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import type { ColorToken, ComparisonResult, Trend } from "@/lib/types/domain";

export interface TimePoint {
  timestamp: string;
  value: number;
}

const summarize = (currentValue: number, previousValue: number): ComparisonResult => {
  const absoluteDiff = currentValue - previousValue;
  const percentDiff = previousValue === 0 ? (currentValue === 0 ? 0 : 100) : (absoluteDiff / previousValue) * 100;
  const trend: Trend = absoluteDiff > 0 ? "up" : absoluteDiff < 0 ? "down" : "flat";
  const colorToken: ColorToken = trend === "up" ? "green" : trend === "down" ? "red" : "neutral";

  return { currentValue, previousValue, absoluteDiff, percentDiff, trend, colorToken };
};

const sumWindow = (points: TimePoint[], from: Date, to: Date) =>
  points
    .filter((point) => {
      const ts = new Date(point.timestamp).getTime();
      return ts >= from.getTime() && ts <= to.getTime();
    })
    .reduce((acc, point) => acc + point.value, 0);

export const compareTodayVsYesterday = (points: TimePoint[], now = new Date(), timezone = "Europe/Bratislava") => {
  const zonedNow = toZonedTime(now, timezone);
  const todayStart = startOfDay(zonedNow);
  const elapsed = differenceInMilliseconds(zonedNow, todayStart);
  const yesterdayStart = addDays(todayStart, -1);
  const current = sumWindow(points, todayStart, zonedNow);
  const previous = sumWindow(points, yesterdayStart, new Date(yesterdayStart.getTime() + elapsed));
  return summarize(current, previous);
};

export const compareWeekVsLastWeek = (points: TimePoint[], now = new Date(), timezone = "Europe/Bratislava") => {
  const zonedNow = toZonedTime(now, timezone);
  const weekStart = startOfWeek(zonedNow, { weekStartsOn: 1 });
  const elapsed = differenceInMilliseconds(zonedNow, weekStart);
  const lastWeekStart = addWeeks(weekStart, -1);
  const current = sumWindow(points, weekStart, zonedNow);
  const previous = sumWindow(points, lastWeekStart, new Date(lastWeekStart.getTime() + elapsed));
  return summarize(current, previous);
};

export const compareMonthVsLastMonth = (points: TimePoint[], now = new Date(), timezone = "Europe/Bratislava") => {
  const zonedNow = toZonedTime(now, timezone);
  const monthStart = startOfMonth(zonedNow);
  const elapsed = differenceInMilliseconds(zonedNow, monthStart);
  const lastMonthStart = addMonths(monthStart, -1);
  const current = sumWindow(points, monthStart, zonedNow);
  const previous = sumWindow(points, lastMonthStart, new Date(lastMonthStart.getTime() + elapsed));
  return summarize(current, previous);
};
