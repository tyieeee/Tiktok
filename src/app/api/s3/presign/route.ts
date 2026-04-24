import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createUploadUrl } from "@/server/services/s3";
import { z } from "zod";

const schema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  prefix: z.string().default("uploads"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const key = `${parsed.data.prefix}/${session.user.id}/${Date.now()}-${parsed.data.filename}`;
  const res = await createUploadUrl({ key, contentType: parsed.data.contentType });
  return NextResponse.json(res);
}
