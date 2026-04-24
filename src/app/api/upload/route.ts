import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB

export async function POST(req: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 100 MB)" }, { status: 413 });
  }
  if (!file.type.startsWith("video/") && !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only video or image files allowed" }, { status: 400 });
  }

  const ext = (file.name.match(/\.[a-z0-9]+$/i)?.[0] ?? "").toLowerCase() || ".bin";
  const filename = `${randomUUID()}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "portfolio");
  if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  const url = `/uploads/portfolio/${filename}`;
  return NextResponse.json({ url, type: file.type, size: file.size });
}
