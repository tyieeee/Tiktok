import { NextResponse } from "next/server";
import { stripe } from "@/server/services/stripe";
import { db } from "@/server/db";
import { env } from "@/env.mjs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ received: true, stubbed: true });
  }
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, env.STRIPE_WEBHOOK_SECRET);
  } catch (e: any) {
    return NextResponse.json({ error: `Webhook Error: ${e.message}` }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as any;
      await db.payment.updateMany({
        where: { stripePaymentIntentId: pi.id },
        data: { status: "HELD" },
      });
      break;
    }
    case "checkout.session.completed": {
      // Optional: handle Checkout flow
      break;
    }
    case "account.updated": {
      const acct = event.data.object as any;
      if (acct.charges_enabled) {
        await db.user.updateMany({
          where: { stripeConnectAccountId: acct.id },
          data: {},
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
