import { NextResponse } from "next/server";
import { boltTokenManager } from "@/lib/services/boltTokenManager";
import { env } from "@/lib/config/env";

export async function GET() {
  try {
    if (env.dataProvider === "bolt") await boltTokenManager.getToken();
    return NextResponse.json({ ok: true, bolt: boltTokenManager.getHealth(), provider: env.dataProvider });
  } catch (error) {
    return NextResponse.json({ ok: false, message: (error as Error).message }, { status: 503 });
  }
}
