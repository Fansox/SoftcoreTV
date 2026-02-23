import { NextResponse } from "next/server";
import { boltAdapter } from "@/lib/integrations/bolt";

export async function GET(_: Request, { params }: { params: { cityId: string } }) {
  const [day, week, month, drivers] = await Promise.all([
    boltAdapter.fetchCitySummary(params.cityId, "day"),
    boltAdapter.fetchCitySummary(params.cityId, "week"),
    boltAdapter.fetchCitySummary(params.cityId, "month"),
    boltAdapter.fetchCityDrivers(params.cityId)
  ]);
  return NextResponse.json({ day, week, month, drivers });
}
