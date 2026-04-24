import { z } from "zod";
import { router, protectedProcedure, creatorProcedure, brandProcedure } from "../trpc";

export const analyticsRouter = router({
  creatorGrowth: creatorProcedure.query(async ({ ctx }) => {
    const creator = await ctx.db.creatorProfile.findUnique({ where: { userId: ctx.session!.user.id } });
    if (!creator) return [];
    return ctx.db.analyticsSnapshot.findMany({
      where: { creatorId: creator.id },
      orderBy: { date: "asc" },
      take: 90,
    });
  }),

  creatorEarnings: creatorProcedure.query(async ({ ctx }) => {
    const creator = await ctx.db.creatorProfile.findUnique({ where: { userId: ctx.session!.user.id } });
    if (!creator) return { total: 0, released: 0, held: 0, byMonth: [] as { month: string; amount: number }[] };
    const payments = await ctx.db.payment.findMany({
      where: { collaboration: { application: { creatorId: creator.id } } },
    });
    const total = payments.reduce((s, p) => s + p.amount, 0);
    const released = payments.filter((p) => p.status === "RELEASED").reduce((s, p) => s + p.amount, 0);
    const held = payments.filter((p) => p.status === "HELD").reduce((s, p) => s + p.amount, 0);
    const byMonth = new Map<string, number>();
    for (const p of payments) {
      const k = p.createdAt.toISOString().slice(0, 7);
      byMonth.set(k, (byMonth.get(k) ?? 0) + p.amount);
    }
    return {
      total,
      released,
      held,
      byMonth: [...byMonth.entries()].sort().map(([month, amount]) => ({ month, amount })),
    };
  }),

  brandCampaignROI: brandProcedure.input(z.object({ campaignId: z.string().optional() }).default({})).query(
    async ({ ctx, input }) => {
      const brand = await ctx.db.brandProfile.findUnique({ where: { userId: ctx.session!.user.id } });
      if (!brand) return [];
      const campaigns = await ctx.db.campaign.findMany({
        where: { brandId: brand.id, id: input.campaignId },
        include: {
          applications: {
            include: {
              collaboration: {
                include: { deliverables: true, payments: true },
              },
            },
          },
        },
      });
      return campaigns.map((c) => {
        const deliverables = c.applications.flatMap((a) => a.collaboration?.deliverables ?? []);
        const totalViews = deliverables.reduce((s, d) => s + (d.metricsViews ?? 0), 0);
        const totalSpend = c.applications
          .flatMap((a) => a.collaboration?.payments ?? [])
          .reduce((s, p) => s + p.amount + p.platformFee, 0);
        const cpm = totalViews > 0 ? (totalSpend / totalViews) * 1000 : 0;
        return {
          id: c.id,
          title: c.title,
          budget: c.budget,
          totalSpend,
          totalViews,
          cpm,
          acceptedApplications: c.applications.filter((a) => a.status === "ACCEPTED").length,
        };
      });
    }
  ),
});
