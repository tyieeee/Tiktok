import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, creatorProcedure, brandProcedure } from "../trpc";
import { computeMatchScore } from "../services/match-score";
import { notify } from "../services/notifications";

export const applicationRouter = router({
  submit: creatorProcedure
    .input(
      z.object({
        campaignId: z.string(),
        coverLetter: z.string().min(10).max(2000),
        proposedPrice: z.number().int().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const creator = await ctx.db.creatorProfile.findUnique({ where: { userId: ctx.session!.user.id } });
      if (!creator) throw new TRPCError({ code: "PRECONDITION_FAILED" });
      const campaign = await ctx.db.campaign.findUnique({ where: { id: input.campaignId }, include: { brand: true } });
      if (!campaign || campaign.status !== "OPEN") throw new TRPCError({ code: "BAD_REQUEST", message: "Campaign closed" });

      const matchScore = computeMatchScore({
        creator: {
          niche: creator.niche,
          engagementRate: creator.engagementRate,
          followerCount: creator.followerCount,
          location: creator.location,
          pricePerPost: input.proposedPrice,
        },
        campaign: {
          targetNiche: campaign.targetNiche,
          budget: campaign.budget,
          location: campaign.location,
        },
      });

      const app = await ctx.db.application.create({
        data: {
          campaignId: input.campaignId,
          creatorId: creator.id,
          coverLetter: input.coverLetter,
          proposedPrice: input.proposedPrice,
          matchScore,
        },
      });

      await notify(ctx.db, {
        userId: campaign.brand.userId,
        type: "APPLICATION_NEW",
        title: "New application",
        body: `A creator applied to "${campaign.title}"`,
        linkUrl: `/brand/campaigns/${campaign.id}/applications`,
      });

      return app;
    }),

  listForCampaign: brandProcedure.input(z.object({ campaignId: z.string() })).query(async ({ ctx, input }) => {
    const brand = await ctx.db.brandProfile.findUnique({ where: { userId: ctx.session!.user.id } });
    const campaign = await ctx.db.campaign.findUnique({ where: { id: input.campaignId } });
    if (!campaign || campaign.brandId !== brand?.id) throw new TRPCError({ code: "FORBIDDEN" });
    return ctx.db.application.findMany({
      where: { campaignId: input.campaignId },
      include: { creator: { include: { user: true } } },
      orderBy: [{ matchScore: "desc" }, { createdAt: "desc" }],
    });
  }),

  creatorProfile: brandProcedure.input(z.object({ creatorId: z.string() })).query(async ({ ctx, input }) => {
    const brand = await ctx.db.brandProfile.findUnique({ where: { userId: ctx.session!.user.id } });
    if (!brand) throw new TRPCError({ code: "FORBIDDEN" });
    // Brand can view any creator who has applied to any of their campaigns
    const hasApplied = await ctx.db.application.findFirst({
      where: { creatorId: input.creatorId, campaign: { brandId: brand.id } },
      select: { id: true },
    });
    if (!hasApplied) throw new TRPCError({ code: "FORBIDDEN", message: "You can only view creators who applied to your campaigns" });
    const creator = await ctx.db.creatorProfile.findUnique({
      where: { id: input.creatorId },
      include: {
        user: true,
        analytics: { orderBy: { date: "desc" }, take: 12 },
      },
    });
    if (!creator) throw new TRPCError({ code: "NOT_FOUND" });
    return creator;
  }),

  applicantDetail: brandProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const brand = await ctx.db.brandProfile.findUnique({ where: { userId: ctx.session!.user.id } });
    const app = await ctx.db.application.findUnique({
      where: { id: input.id },
      include: {
        campaign: true,
        creator: {
          include: {
            user: true,
            analytics: { orderBy: { date: "desc" }, take: 12 },
          },
        },
      },
    });
    if (!app || app.campaign.brandId !== brand?.id) throw new TRPCError({ code: "FORBIDDEN" });
    return app;
  }),

  listMine: creatorProcedure.query(async ({ ctx }) => {
    const creator = await ctx.db.creatorProfile.findUnique({ where: { userId: ctx.session!.user.id } });
    if (!creator) return [];
    return ctx.db.application.findMany({
      where: { creatorId: creator.id },
      include: { campaign: { include: { brand: true } }, collaboration: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  accept: brandProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const brand = await ctx.db.brandProfile.findUnique({ where: { userId: ctx.session!.user.id } });
    const app = await ctx.db.application.findUnique({
      where: { id: input.id },
      include: { campaign: true, creator: { include: { user: true } } },
    });
    if (!app || app.campaign.brandId !== brand?.id) throw new TRPCError({ code: "FORBIDDEN" });

    const [updated] = await ctx.db.$transaction([
      ctx.db.application.update({ where: { id: input.id }, data: { status: "ACCEPTED" } }),
      ctx.db.collaboration.create({
        data: {
          applicationId: input.id,
          status: "CONTRACT_PENDING",
          deliverables: {
            create: [
              {
                type: "VIDEO",
                dueDate: app.campaign.deadline,
                captionRequirements: "",
                hashtags: [],
              },
            ],
          },
        },
      }),
      ctx.db.campaign.update({ where: { id: app.campaignId }, data: { status: "IN_PROGRESS" } }),
    ]);

    await notify(ctx.db, {
      userId: app.creator.userId,
      type: "APPLICATION_ACCEPTED",
      title: "Application accepted!",
      body: `"${app.campaign.title}" accepted your application`,
      linkUrl: `/creator/collaborations`,
    });

    return updated;
  }),

  reject: brandProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const brand = await ctx.db.brandProfile.findUnique({ where: { userId: ctx.session!.user.id } });
    const app = await ctx.db.application.findUnique({
      where: { id: input.id },
      include: { campaign: true, creator: true },
    });
    if (!app || app.campaign.brandId !== brand?.id) throw new TRPCError({ code: "FORBIDDEN" });
    const updated = await ctx.db.application.update({ where: { id: input.id }, data: { status: "REJECTED" } });
    await notify(ctx.db, {
      userId: (await ctx.db.creatorProfile.findUnique({ where: { id: app.creatorId }, include: { user: true } }))!
        .user.id,
      type: "APPLICATION_REJECTED",
      title: "Application update",
      body: `Your application to "${app.campaign.title}" was not selected`,
    });
    return updated;
  }),
});
