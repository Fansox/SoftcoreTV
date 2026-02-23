import { NextResponse } from "next/server";
import { dashboardState } from "@/server/store/state";
import { bootstrapSync } from "@/server/jobs/sync";

export async function GET() {
  await bootstrapSync();
  const data = dashboardState.payload ?? (await dashboardState.refresh());
  return NextResponse.json(data);
}
