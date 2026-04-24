import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const notificationRouter = router({
  list: protectedProcedure.query(({ ctx }) =>
    ctx.db.notification.findMany({
      where: { userId: ctx.session!.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
  ),
  unreadCount: protectedProcedure.query(({ ctx }) =>
    ctx.db.notification.count({ where: { userId: ctx.session!.user.id, readAt: null } })
  ),
  markRead: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) =>
    ctx.db.notification.update({
      where: { id: input.id },
      data: { readAt: new Date() },
    })
  ),
  markAllRead: protectedProcedure.mutation(({ ctx }) =>
    ctx.db.notification.updateMany({
      where: { userId: ctx.session!.user.id, readAt: null },
      data: { readAt: new Date() },
    })
  ),
});
