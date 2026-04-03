import { NextRequest, NextResponse } from "next/server";
import { kv, keys } from "@/lib/kv";
import { checkOrigin } from "@/lib/api-utils";
import { TrainingConfig } from "@/lib/types";

export async function GET(req: NextRequest) {
  const blocked = checkOrigin(req);
  if (blocked) return blocked;
  const data = await kv.get<TrainingConfig>(keys.trainingConfig());
  return NextResponse.json(data || { start_date: "", current_week_override: null });
}

export async function POST(req: NextRequest) {
  const blocked = checkOrigin(req);
  if (blocked) return blocked;
  const body: TrainingConfig = await req.json();
  await kv.set(keys.trainingConfig(), body);
  return NextResponse.json(body);
}
