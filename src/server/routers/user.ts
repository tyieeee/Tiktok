import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { verifyTikTokHandle, fetchUserVideos } from "../services/tiktok";

export const userRouter = router({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(1),
        role: z.enum(["CREATOR", "BRAND"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.user.findUnique({ where: { email: input.email } });
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
      const passwordHash = await bcrypt.hash(input.password, 10);
      const user = await ctx.db.user.create({
        data: {
          email: input.email,
          name: input.name,
          role: input.role,
          passwordHash,
        },
      });
      return { id: user.id };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.session!.user.id },
      include: { creatorProfile: true, brandProfile: true },
    });
  }),

  onboardCreator: protectedProcedure
    .input(
      z.object({
        tikTokHandle: z.string().min(1),
        bio: z.string().max(500).optional(),
        niche: z.array(z.string()).min(1),
        categories: z.array(z.string()).default([]),
        location: z.string().optional(),
        languages: z.array(z.string()).default([]),
        pricePerPost: z.number().int().min(0),
        portfolioMedia: z.array(z.string().url()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session!.user.role !== "CREATOR") throw new TRPCError({ code: "FORBIDDEN" });
      const stats = await verifyTikTokHandle(input.tikTokHandle).catch(() => null);
      const profile = await ctx.db.creatorProfile.upsert({
        where: { userId: ctx.session!.user.id },
        create: {
          userId: ctx.session!.user.id,
          tikTokHandle: stats?.handle ?? input.tikTokHandle.replace(/^@/, ""),
          tikTokVerified: !!stats?.verified,
          bio: input.bio,
          niche: input.niche,
          categories: input.categories,
          location: input.location,
          languages: input.languages,
          pricePerPost: input.pricePerPost,
          portfolioMedia: input.portfolioMedia,
          followerCount: stats?.followerCount ?? 0,
          avgViews: stats?.avgViews ?? 0,
          engagementRate: stats?.engagementRate ?? 0,
        },
        update: {
          tikTokHandle: stats?.handle ?? input.tikTokHandle.replace(/^@/, ""),
          tikTokVerified: !!stats?.verified,
          bio: input.bio,
          niche: input.niche,
          categories: input.categories,
          location: input.location,
          languages: input.languages,
          pricePerPost: input.pricePerPost,
          portfolioMedia: input.portfolioMedia,
          followerCount: stats?.followerCount ?? 0,
          avgViews: stats?.avgViews ?? 0,
          engagementRate: stats?.engagementRate ?? 0,
        },
      });
      await ctx.db.user.update({
        where: { id: ctx.session!.user.id },
        data: { onboardedAt: new Date() },
      });
      return profile;
    }),

  connectTikTok: protectedProcedure
    .input(z.object({ handle: z.string().min(1).max(64) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session!.user.role !== "CREATOR") throw new TRPCError({ code: "FORBIDDEN" });
      const [stats, videos] = await Promise.all([
        verifyTikTokHandle(input.handle).catch(() => null),
        fetchUserVideos(input.handle, 9).catch(() => [] as string[]),
      ]);
      if (!stats) throw new TRPCError({ code: "BAD_REQUEST", message: "Could not verify TikTok handle" });

      const existing = await ctx.db.creatorProfile.findUnique({
        where: { userId: ctx.session!.user.id },
        select: { portfolioMedia: true },
      });
      // Merge: keep existing media first, then append any new TikTok videos not already present
      const merged = [
        ...(existing?.portfolioMedia ?? []),
        ...videos.filter((v) => !(existing?.portfolioMedia ?? []).includes(v)),
      ].slice(0, 20);

      const profile = await ctx.db.creatorProfile.upsert({
        where: { userId: ctx.session!.user.id },
        create: {
          userId: ctx.session!.user.id,
          tikTokHandle: stats.handle,
          tikTokVerified: stats.verified,
          followerCount: stats.followerCount,
          avgViews: stats.avgViews,
          engagementRate: stats.engagementRate,
          portfolioMedia: merged,
          niche: [],
          categories: [],
          languages: [],
        },
        update: {
          tikTokHandle: stats.handle,
          tikTokVerified: stats.verified,
          followerCount: stats.followerCount,
          avgViews: stats.avgViews,
          engagementRate: stats.engagementRate,
          portfolioMedia: merged,
        },
      });
      return { profile, videosImported: videos.length };
    }),

  updatePortfolio: protectedProcedure
    .input(z.object({ portfolioMedia: z.array(z.string().url()).max(20) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session!.user.role !== "CREATOR") throw new TRPCError({ code: "FORBIDDEN" });
      const profile = await ctx.db.creatorProfile.update({
        where: { userId: ctx.session!.user.id },
        data: { portfolioMedia: input.portfolioMedia },
      });
      return profile;
    }),

  onboardBrand: protectedProcedure
    .input(
      z.object({
        companyName: z.string().min(1),
        website: z.string().url().optional(),
        industry: z.string().optional(),
        description: z.string().max(1000).optional(),
        logo: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session!.user.role !== "BRAND") throw new TRPCError({ code: "FORBIDDEN" });
      const profile = await ctx.db.brandProfile.upsert({
        where: { userId: ctx.session!.user.id },
        create: { userId: ctx.session!.user.id, ...input },
        update: { ...input },
      });
      await ctx.db.user.update({
        where: { id: ctx.session!.user.id },
        data: { onboardedAt: new Date() },
      });
      return profile;
    }),
});
