import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchVideoMetrics } from "@/server/services/tiktok";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url } = await req.json();
  try {
    const metrics = await fetchVideoMetrics(url);
    return NextResponse.json(metrics);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
