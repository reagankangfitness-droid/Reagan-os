import { NextRequest, NextResponse } from "next/server";
import { kv, keys } from "@/lib/kv";
import { checkOrigin } from "@/lib/api-utils";
import { SaasIdea } from "@/lib/types";

export async function GET(req: NextRequest) {
  const blocked = checkOrigin(req);
  if (blocked) return blocked;
  const data = await kv.get<SaasIdea[]>(keys.saasIdeas());
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const blocked = checkOrigin(req);
  if (blocked) return blocked;
  const body: SaasIdea[] = await req.json();
  await kv.set(keys.saasIdeas(), body);
  return NextResponse.json(body);
}
