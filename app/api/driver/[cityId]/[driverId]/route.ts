import { NextResponse } from "next/server";
import { boltAdapter } from "@/lib/integrations/bolt";

export async function GET(_: Request, { params }: { params: { cityId: string; driverId: string } }) {
  const detail = await boltAdapter.fetchDriverDetail(params.cityId, params.driverId);
  return NextResponse.json(detail);
}
