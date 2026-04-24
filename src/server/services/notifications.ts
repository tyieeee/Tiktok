import type { NotificationType, PrismaClient } from "@prisma/client";

export async function notify(
  db: PrismaClient,
  params: { userId: string; type: NotificationType; title: string; body?: string; linkUrl?: string }
) {
  return db.notification.create({ data: params });
}
