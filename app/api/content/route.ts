import { NextRequest, NextResponse } from "next/server";
import { kv, keys } from "@/lib/kv";
import { checkOrigin } from "@/lib/api-utils";
import { ContentIdea } from "@/lib/types";

export async function GET(req: NextRequest) {
  const blocked = checkOrigin(req);
  if (blocked) return blocked;
  const data = await kv.get<ContentIdea[]>(keys.contentBank());
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const blocked = checkOrigin(req);
  if (blocked) return blocked;
  const body: ContentIdea[] = await req.json();
  await kv.set(keys.contentBank(), body);
  return NextResponse.json(body);
}
