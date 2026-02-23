import { env } from "@/lib/config/env";

export const currency = (value: number) =>
  new Intl.NumberFormat(env.locale, {
    style: "currency",
    currency: env.currency,
    maximumFractionDigits: 0
  }).format(value);

export const percent = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

export const dateTime = (iso: string) =>
  new Intl.DateTimeFormat(env.locale, { dateStyle: "short", timeStyle: "medium", timeZone: env.appTimezone }).format(
    new Date(iso)
  );
