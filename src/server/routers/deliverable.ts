import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { fetchVideoMetrics } from "../services/tiktok";
import { notify } from "../services/notifications";

const MAX_REVISIONS = 3;

export const deliverableRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        collaborationId: z.string(),
        type: z.enum(["VIDEO", "STORY", "LIVE"]).default("VIDEO"),
        dueDate: z.coerce.date(),
        captionRequirements: z.string().optional(),
        hashtags: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const collab = await ctx.db.collaboration.findUnique({
        where: { id: input.collaborationId },
        include: { application: { include: { campaign: { include: { brand: true } } } } },
      });
      if (!collab) throw new TRPCError({ code: "NOT_FOUND" });
      if (collab.application.campaign.brand.userId !== ctx.session!.user.id)
        throw new TRPCError({ code: "FORBIDDEN" });
      return ctx.db.deliverable.create({ data: input });
    }),

  submit: protectedProcedure
    .input(z.object({ id: z.string(), contentUrl: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const d = await ctx.db.deliverable.findUnique({
        where: { id: input.id },
        include: {
          collaboration: { include: { application: { include: { campaign: { include: { brand: true } }, creator: { include: { user: true } } } } } },
        },
      });
      if (!d) throw new TRPCError({ code: "NOT_FOUND" });
      if (d.collaboration.application.creator.user.id !== ctx.session!.user.id)
        throw new TRPCError({ code: "FORBIDDEN" });
      const updated = await ctx.db.deliverable.update({
        where: { id: input.id },
        data: { contentUrl: input.contentUrl, status: "SUBMITTED", submittedAt: new Date() },
      });
      await notify(ctx.db, {
        userId: d.collaboration.application.campaign.brand.userId,
        type: "DELIVERABLE_SUBMITTED",
        title: "Deliverable submitted",
        linkUrl: `/brand/collaborations/${d.collaborationId}`,
      });
      return updated;
    }),

  approve: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const d = await ctx.db.deliverable.findUnique({
      where: { id: input.id },
      include: { collaboration: { include: { application: { include: { campaign: { include: { brand: true } }, creator: { include: { user: true } } } } } } },
    });
    if (!d) throw new TRPCError({ code: "NOT_FOUND" });
    if (d.collaboration.application.campaign.brand.userId !== ctx.session!.user.id)
      throw new TRPCError({ code: "FORBIDDEN" });
    const updated = await ctx.db.deliverable.update({
      where: { id: input.id },
      data: { status: "APPROVED", approvedAt: new Date() },
    });
    await notify(ctx.db, {
      userId: d.collaboration.application.creator.user.id,
      type: "DELIVERABLE_APPROVED",
      title: "Deliverable approved",
      linkUrl: `/creator/collaborations/${d.collaborationId}`,
    });
    return updated;
  }),

  requestRevision: protectedProcedure
    .input(z.object({ id: z.string(), feedback: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const d = await ctx.db.deliverable.findUnique({
        where: { id: input.id },
        include: { collaboration: { include: { application: { include: { campaign: { include: { brand: true } }, creator: { include: { user: true } } } } } } },
      });
      if (!d) throw new TRPCError({ code: "NOT_FOUND" });
      if (d.collaboration.application.campaign.brand.userId !== ctx.session!.user.id)
        throw new TRPCError({ code: "FORBIDDEN" });
      if (d.revisionCount >= MAX_REVISIONS)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Max revisions reached" });
      const updated = await ctx.db.deliverable.update({
        where: { id: input.id },
        data: {
          status: "REVISION_REQUESTED",
          feedback: input.feedback,
          revisionCount: { increment: 1 },
        },
      });
      await notify(ctx.db, {
        userId: d.collaboration.application.creator.user.id,
        type: "DELIVERABLE_REVISION",
        title: "Revision requested",
        body: input.feedback.slice(0, 120),
        linkUrl: `/creator/collaborations/${d.collaborationId}`,
      });
      return updated;
    }),

  linkTikTokAndFetchMetrics: protectedProcedure
    .input(z.object({ id: z.string(), tikTokVideoUrl: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const metrics = await fetchVideoMetrics(input.tikTokVideoUrl);
      return ctx.db.deliverable.update({
        where: { id: input.id },
        data: {
          tikTokVideoUrl: input.tikTokVideoUrl,
          metricsViews: metrics.views,
          metricsLikes: metrics.likes,
          metricsShares: metrics.shares,
          metricsComments: metrics.comments,
          metricsFetchedAt: new Date(),
        },
      });
    }),
});
