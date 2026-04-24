import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { Session } from "next-auth";
import type { PrismaClient } from "@prisma/client";

export type Context = {
  db: PrismaClient;
  session: Session | null;
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, session: ctx.session } });
});

export const protectedProcedure = t.procedure.use(isAuthed);

export const creatorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session!.user.role !== "CREATOR" && ctx.session!.user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Creator role required" });
  }
  return next({ ctx });
});

export const brandProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session!.user.role !== "BRAND" && ctx.session!.user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Brand role required" });
  }
  return next({ ctx });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session!.user.role !== "ADMIN") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});
