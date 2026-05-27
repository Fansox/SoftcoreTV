import { NextResponse } from "next/server";
import { parseFinanceRange, syncFinanceBridge } from "@/lib/finance/financeBridge";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = parseFinanceRange(searchParams);
  const result = await syncFinanceBridge(range);
  return NextResponse.json({ ok: true, ...result });
}
