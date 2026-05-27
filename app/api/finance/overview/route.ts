import { NextResponse } from "next/server";
import { getFinanceOverview, parseFinanceRange } from "@/lib/finance/financeBridge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = parseFinanceRange(searchParams);
  const overview = await getFinanceOverview(range);
  return NextResponse.json(overview);
}
