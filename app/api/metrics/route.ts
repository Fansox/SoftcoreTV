import { NextResponse } from "next/server";
import { dashboardState } from "@/server/store/state";

export async function GET() {
  const snapshot = dashboardState.payload;
  return NextResponse.json({
    app_uptime_sec: Math.floor(process.uptime()),
    dashboard_last_sync: snapshot?.lastSyncAt,
    global_online_drivers: snapshot?.globalSummary.day.onlineDrivers ?? 0
  });
}
