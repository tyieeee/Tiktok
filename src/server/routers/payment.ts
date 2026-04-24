import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, brandProcedure, protectedProcedure } from "../trpc";
import { createEscrowPaymentIntent, platformFee, payoutToCreator, stripe } from "../services/stripe";
import { notify } from "../services/notifications";

export const paymentRouter = router({
  fundCollaboration: brandProcedure
    .input(z.object({ collaborationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const collab = await ctx.db.collaboration.findUnique({
        where: { id: input.collaborationId },
        include: { application: { include: { campaign: { include: { brand: true } } } }, payments: true },
      });
      if (!collab || collab.application.campaign.brand.userId !== ctx.session!.user.id)
        throw new TRPCError({ code: "FORBIDDEN" });

      const amount = collab.application.proposedPrice;
      const fee = platformFee(amount);
      const total = amount + fee;

      if (!stripe) {
        // Dev fallback: simulate success
        return ctx.db.payment.create({
          data: {
            collaborationId: collab.id,
            amount,
            platformFee: fee,
            status: "HELD",
            stripePaymentIntentId: `pi_dev_${collab.id.slice(0, 8)}`,
          },
        });
      }

      const pi = await createEscrowPaymentIntent({
        amount: total,
        metadata: { collaborationId: collab.id },
      });
      return ctx.db.payment.create({
        data: {
          collaborationId: collab.id,
          amount,
          platformFee: fee,
          status: "HELD",
          stripePaymentIntentId: pi.id,
        },
      });
    }),

  release: brandProcedure
    .input(z.object({ paymentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const pay = await ctx.db.payment.findUnique({
        where: { id: input.paymentId },
        include: {
          collaboration: {
            include: {
              application: {
                include: {
                  campaign: { include: { brand: true } },
                  creator: { include: { user: true } },
                },
              },
            },
          },
        },
      });
      if (!pay) throw new TRPCError({ code: "NOT_FOUND" });
      if (pay.collaboration.application.campaign.brand.userId !== ctx.session!.user.id)
        throw new TRPCError({ code: "FORBIDDEN" });
      if (pay.status !== "HELD") throw new TRPCError({ code: "BAD_REQUEST" });

      const creatorUser = pay.collaboration.application.creator.user;
      const creatorStripe = (await ctx.db.user.findUnique({ where: { id: creatorUser.id } }))?.stripeConnectAccountId;

      if (stripe && creatorStripe) {
        await payoutToCreator({
          amount: pay.amount,
          creatorConnectAccountId: creatorStripe,
          metadata: { paymentId: pay.id },
        });
      }

      const updated = await ctx.db.payment.update({
        where: { id: pay.id },
        data: { status: "RELEASED", releasedAt: new Date() },
      });
      await notify(ctx.db, {
        userId: creatorUser.id,
        type: "PAYMENT_RELEASED",
        title: "Payment released",
        body: `$${(pay.amount / 100).toFixed(2)} is on its way`,
      });
      return updated;
    }),

  listMine: protectedProcedure.query(async ({ ctx }) => {
    const role = ctx.session!.user.role;
    if (role === "CREATOR") {
      const creator = await ctx.db.creatorProfile.findUnique({ where: { userId: ctx.session!.user.id } });
      if (!creator) return [];
      return ctx.db.payment.findMany({
        where: { collaboration: { application: { creatorId: creator.id } } },
        include: { collaboration: { include: { application: { include: { campaign: true } } } } },
        orderBy: { createdAt: "desc" },
      });
    }
    const brand = await ctx.db.brandProfile.findUnique({ where: { userId: ctx.session!.user.id } });
    if (!brand) return [];
    return ctx.db.payment.findMany({
      where: { collaboration: { application: { campaign: { brandId: brand.id } } } },
      include: { collaboration: { include: { application: { include: { campaign: true } } } } },
      orderBy: { createdAt: "desc" },
    });
  }),
});
