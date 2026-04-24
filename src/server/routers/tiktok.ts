import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { verifyTikTokHandle, fetchVideoMetrics } from "../services/tiktok";

export const tiktokRouter = router({
  verify: protectedProcedure.input(z.object({ handle: z.string() })).mutation(({ input }) =>
    verifyTikTokHandle(input.handle)
  ),
  metrics: protectedProcedure.input(z.object({ url: z.string().url() })).mutation(({ input }) =>
    fetchVideoMetrics(input.url)
  ),
});
