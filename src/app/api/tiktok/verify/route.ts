import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyTikTokHandle } from "@/server/services/tiktok";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { handle } = await req.json();
  if (!handle) return NextResponse.json({ error: "handle required" }, { status: 400 });
  try {
    const stats = await verifyTikTokHandle(handle);
    return NextResponse.json(stats);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
