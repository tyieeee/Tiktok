import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { notify } from "../services/notifications";
import { TRPCError } from "@trpc/server";

export const messageRouter = router({
  list: protectedProcedure
    .input(z.object({ collaborationId: z.string().optional(), campaignId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (!input.collaborationId && !input.campaignId) throw new TRPCError({ code: "BAD_REQUEST" });
      return ctx.db.message.findMany({
        where: {
          collaborationId: input.collaborationId,
          campaignId: input.campaignId,
        },
        include: { sender: true },
        orderBy: { createdAt: "asc" },
        take: 200,
      });
    }),

  send: protectedProcedure
    .input(
      z.object({
        collaborationId: z.string().optional(),
        campaignId: z.string().optional(),
        content: z.string().min(1).max(4000),
        attachments: z.array(z.string().url()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const msg = await ctx.db.message.create({
        data: {
          collaborationId: input.collaborationId,
          campaignId: input.campaignId,
          senderId: ctx.session!.user.id,
          content: input.content,
          attachments: input.attachments,
        },
      });
      // Best-effort notify counterparty
      if (input.collaborationId) {
        const collab = await ctx.db.collaboration.findUnique({
          where: { id: input.collaborationId },
          include: {
            application: {
              include: {
                campaign: { include: { brand: true } },
                creator: { include: { user: true } },
              },
            },
          },
        });
        if (collab) {
          const recipient =
            ctx.session!.user.id === collab.application.campaign.brand.userId
              ? collab.application.creator.user.id
              : collab.application.campaign.brand.userId;
          await notify(ctx.db, {
            userId: recipient,
            type: "MESSAGE_RECEIVED",
            title: "New message",
            body: input.content.slice(0, 120),
            linkUrl: `/${ctx.session!.user.role === "BRAND" ? "creator" : "brand"}/collaborations/${collab.id}`,
          });
        }
      }
      return msg;
    }),
});
