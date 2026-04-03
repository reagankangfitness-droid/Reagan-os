import { NextRequest, NextResponse } from "next/server";
import { kv, keys } from "@/lib/kv";
import { checkOrigin } from "@/lib/api-utils";
import { SessionLog } from "@/lib/types";

export async function GET(req: NextRequest) {
  const blocked = checkOrigin(req);
  if (blocked) return blocked;
  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
  const data = await kv.get<SessionLog>(keys.trainingSessions(date));
  return NextResponse.json(data || { date, sessions: {}, protein_hit: false });
}

export async function POST(req: NextRequest) {
  const blocked = checkOrigin(req);
  if (blocked) return blocked;
  const body: SessionLog = await req.json();
  await kv.set(keys.trainingSessions(body.date), body);
  return NextResponse.json(body);
}
