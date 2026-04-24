import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const reviewRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        collaborationId: z.string(),
        revieweeId: z.string(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().max(1000).optional(),
        role: z.enum(["CREATOR_TO_BRAND", "BRAND_TO_CREATOR"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const collab = await ctx.db.collaboration.findUnique({
        where: { id: input.collaborationId },
        include: { application: { include: { campaign: { include: { brand: true } }, creator: { include: { user: true } } } } },
      });
      if (!collab) throw new TRPCError({ code: "NOT_FOUND" });
      if (collab.status !== "COMPLETED") throw new TRPCError({ code: "BAD_REQUEST", message: "Collab not completed" });
      return ctx.db.review.create({
        data: {
          collaborationId: input.collaborationId,
          revieweeId: input.revieweeId,
          reviewerId: ctx.session!.user.id,
          rating: input.rating,
          comment: input.comment,
          role: input.role,
        },
      });
    }),

  forUser: protectedProcedure.input(z.object({ userId: z.string() })).query(async ({ ctx, input }) => {
    return ctx.db.review.findMany({
      where: { revieweeId: input.userId },
      include: { reviewer: true },
      orderBy: { createdAt: "desc" },
    });
  }),
});
