import { NextResponse } from "next/server";
import { signSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  const body = (await req.json()) as { username: string; password: string };
  if (body.username === "admin" && body.password === "admin") {
    return NextResponse.json({ token: signSession(body.username) });
  }
  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
