import { NextRequest, NextResponse } from "next/server";

export function checkOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  const host = req.headers.get("host") || "";
  const isAllowed =
    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    origin.includes(".vercel.app") ||
    origin.includes(host) ||
    !origin; // Allow same-origin (no origin header)
  if (!isAllowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
