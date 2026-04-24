import { router } from "../trpc";
import { userRouter } from "./user";
import { campaignRouter } from "./campaign";
import { applicationRouter } from "./application";
import { collaborationRouter } from "./collaboration";
import { deliverableRouter } from "./deliverable";
import { messageRouter } from "./message";
import { paymentRouter } from "./payment";
import { analyticsRouter } from "./analytics";
import { reviewRouter } from "./review";
import { tiktokRouter } from "./tiktok";
import { notificationRouter } from "./notification";

export const appRouter = router({
  user: userRouter,
  campaign: campaignRouter,
  application: applicationRouter,
  collaboration: collaborationRouter,
  deliverable: deliverableRouter,
  message: messageRouter,
  payment: paymentRouter,
  analytics: analyticsRouter,
  review: reviewRouter,
  tiktok: tiktokRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
