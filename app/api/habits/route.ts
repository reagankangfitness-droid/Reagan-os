import { NextRequest, NextResponse } from "next/server";
import { kv, keys } from "@/lib/kv";
import { checkOrigin } from "@/lib/api-utils";
import { HabitDay } from "@/lib/types";

export async function GET(req: NextRequest) {
  const blocked = checkOrigin(req);
  if (blocked) return blocked;
  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
  const data = await kv.get<HabitDay>(keys.habits(date));
  return NextResponse.json(data || { date, habits: { content: false, saas_task: false, outreach: false, batch_content: false, review_metrics: false, saas_focus: false } });
}

export async function POST(req: NextRequest) {
  const blocked = checkOrigin(req);
  if (blocked) return blocked;
  const body: HabitDay = await req.json();
  await kv.set(keys.habits(body.date), body);
  return NextResponse.json(body);
}
