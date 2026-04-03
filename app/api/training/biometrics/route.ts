import { NextRequest, NextResponse } from "next/server";
import { kv, keys } from "@/lib/kv";
import { checkOrigin } from "@/lib/api-utils";
import { BiometricCheckin } from "@/lib/types";

export async function GET(req: NextRequest) {
  const blocked = checkOrigin(req);
  if (blocked) return blocked;
  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
  const data = await kv.get<BiometricCheckin>(keys.trainingBiometrics(date));
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const blocked = checkOrigin(req);
  if (blocked) return blocked;
  const body: BiometricCheckin = await req.json();
  await kv.set(keys.trainingBiometrics(body.date), body);
  return NextResponse.json(body);
}
