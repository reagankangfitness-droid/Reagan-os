import { NextRequest, NextResponse } from "next/server";
import { kv, keys } from "@/lib/kv";
import { checkOrigin } from "@/lib/api-utils";
import { IncomeMonth } from "@/lib/types";

export async function GET(req: NextRequest) {
  const blocked = checkOrigin(req);
  if (blocked) return blocked;
  const month = req.nextUrl.searchParams.get("month");
  if (!month) return NextResponse.json({ error: "month required" }, { status: 400 });
  const data = await kv.get<IncomeMonth>(keys.income(month));
  return NextResponse.json(data || { month, pillar2_actual: 0, pillar3_actual: 0, pillar2_notes: "", pillar3_notes: "" });
}

export async function POST(req: NextRequest) {
  const blocked = checkOrigin(req);
  if (blocked) return blocked;
  const body: IncomeMonth = await req.json();
  await kv.set(keys.income(body.month), body);
  return NextResponse.json(body);
}
