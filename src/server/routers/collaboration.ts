import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

async function assertAccess(db: any, userId: string, collaborationId: string) {
  const collab = await db.collaboration.findUnique({
    where: { id: collaborationId },
    include: {
      application: {
        include: {
          campaign: { include: { brand: true } },
          creator: true,
        },
      },
    },
  });
  if (!collab) throw new TRPCError({ code: "NOT_FOUND" });
  const brandUserId = collab.application.campaign.brand.userId;
  const creatorUserId = (await db.creatorProfile.findUnique({ where: { id: collab.application.creatorId } }))?.userId;
  if (userId !== brandUserId && userId !== creatorUserId) throw new TRPCError({ code: "FORBIDDEN" });
  return collab;
}

export const collaborationRouter = router({
  listMine: protectedProcedure.query(async ({ ctx }) => {
    const role = ctx.session!.user.role;
    if (role === "CREATOR") {
      const creator = await ctx.db.creatorProfile.findUnique({ where: { userId: ctx.session!.user.id } });
      if (!creator) return [];
      return ctx.db.collaboration.findMany({
        where: { application: { creatorId: creator.id } },
        include: {
          application: { include: { campaign: { include: { brand: true } } } },
          deliverables: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }
    if (role === "BRAND") {
      const brand = await ctx.db.brandProfile.findUnique({ where: { userId: ctx.session!.user.id } });
      if (!brand) return [];
      return ctx.db.collaboration.findMany({
        where: { application: { campaign: { brandId: brand.id } } },
        include: {
          application: { include: { campaign: true, creator: { include: { user: true } } } },
          deliverables: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }
    return [];
  }),

  byId: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    await assertAccess(ctx.db, ctx.session!.user.id, input.id);
    return ctx.db.collaboration.findUnique({
      where: { id: input.id },
      include: {
        application: {
          include: {
            campaign: { include: { brand: { include: { user: true } } } },
            creator: { include: { user: true } },
          },
        },
        deliverables: { orderBy: { dueDate: "asc" } },
        payments: true,
        messages: { orderBy: { createdAt: "asc" }, take: 200, include: { sender: true } },
      },
    });
  }),

  setContract: protectedProcedure
    .input(z.object({ id: z.string(), contractUrl: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      await assertAccess(ctx.db, ctx.session!.user.id, input.id);
      return ctx.db.collaboration.update({
        where: { id: input.id },
        data: { contractUrl: input.contractUrl, status: "IN_PROGRESS", startedAt: new Date() },
      });
    }),

  complete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await assertAccess(ctx.db, ctx.session!.user.id, input.id);
    return ctx.db.collaboration.update({
      where: { id: input.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  }),
});
