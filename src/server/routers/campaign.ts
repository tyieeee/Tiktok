import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure, brandProcedure } from "../trpc";
import { sanitizeHtml } from "../services/sanitize";

const compensationEnum = z.enum(["FIXED", "REVENUE", "PRODUCT"]);
const statusEnum = z.enum(["DRAFT", "OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);

export const campaignRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          status: statusEnum.optional(),
          niche: z.array(z.string()).optional(),
          minBudget: z.number().int().optional(),
          maxBudget: z.number().int().optional(),
          compensationType: compensationEnum.optional(),
          location: z.string().optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(50).default(20),
          cursor: z.string().optional(),
        })
        .default({})
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        status: input.status ?? "OPEN",
      };
      if (input.niche?.length) where.targetNiche = { hasSome: input.niche };
      if (input.minBudget !== undefined) where.budget = { ...(where.budget ?? {}), gte: input.minBudget };
      if (input.maxBudget !== undefined) where.budget = { ...(where.budget ?? {}), lte: input.maxBudget };
      if (input.compensationType) where.compensationType = input.compensationType;
      if (input.location) where.location = { contains: input.location, mode: "insensitive" };
      if (input.search) where.title = { contains: input.search, mode: "insensitive" };

      const items = await ctx.db.campaign.findMany({
        where,
        include: { brand: true, _count: { select: { applications: true } } },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });
      let nextCursor: string | undefined;
      if (items.length > input.limit) nextCursor = items.pop()!.id;
      return { items, nextCursor };
    }),

  byId: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const c = await ctx.db.campaign.findUnique({
      where: { id: input.id },
      include: { brand: { include: { user: true } }, _count: { select: { applications: true } } },
    });
    if (!c) throw new TRPCError({ code: "NOT_FOUND" });
    return c;
  }),

  listMine: brandProcedure.query(async ({ ctx }) => {
    const brand = await ctx.db.brandProfile.findUnique({ where: { userId: ctx.session!.user.id } });
    if (!brand) return [];
    return ctx.db.campaign.findMany({
      where: { brandId: brand.id },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: brandProcedure
    .input(
      z.object({
        title: z.string().min(3),
        description: z.string().min(10),
        brief: z.string().min(10),
        briefAttachments: z.array(z.string().url()).default([]),
        requirements: z.record(z.any()).default({}),
        budget: z.number().int().min(100),
        compensationType: compensationEnum,
        deadline: z.coerce.date(),
        targetNiche: z.array(z.string()).default([]),
        location: z.string().optional(),
        publish: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const brand = await ctx.db.brandProfile.findUnique({ where: { userId: ctx.session!.user.id } });
      if (!brand) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Complete brand onboarding first" });
      const { publish, ...rest } = input;
      return ctx.db.campaign.create({
        data: {
          ...rest,
          brief: sanitizeHtml(rest.brief),
          description: sanitizeHtml(rest.description),
          brandId: brand.id,
          status: publish ? "OPEN" : "DRAFT",
        },
      });
    }),

  update: brandProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          brief: z.string().optional(),
          budget: z.number().int().optional(),
          status: statusEnum.optional(),
          deadline: z.coerce.date().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const brand = await ctx.db.brandProfile.findUnique({ where: { userId: ctx.session!.user.id } });
      const campaign = await ctx.db.campaign.findUnique({ where: { id: input.id } });
      if (!campaign || campaign.brandId !== brand?.id) throw new TRPCError({ code: "FORBIDDEN" });
      return ctx.db.campaign.update({ where: { id: input.id }, data: input.data });
    }),

  delete: brandProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const brand = await ctx.db.brandProfile.findUnique({ where: { userId: ctx.session!.user.id } });
    const campaign = await ctx.db.campaign.findUnique({ where: { id: input.id } });
    if (!campaign || campaign.brandId !== brand?.id) throw new TRPCError({ code: "FORBIDDEN" });
    await ctx.db.campaign.delete({ where: { id: input.id } });
    return { ok: true };
  }),
});
