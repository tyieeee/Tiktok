import Stripe from "stripe";
import { env } from "@/env";

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2024-09-30.acacia" })
  : null;

export function requireStripe() {
  if (!stripe) throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  return stripe;
}

export function platformFee(amountCents: number) {
  return Math.floor((amountCents * env.STRIPE_PLATFORM_FEE_BPS) / 10000);
}

export async function createEscrowPaymentIntent(params: {
  amount: number; // total brand pays in cents
  currency?: string;
  brandCustomerId?: string;
  metadata: Record<string, string>;
}) {
  const s = requireStripe();
  return s.paymentIntents.create({
    amount: params.amount,
    currency: params.currency ?? "usd",
    customer: params.brandCustomerId,
    capture_method: "automatic",
    metadata: params.metadata,
  });
}

export async function payoutToCreator(params: {
  amount: number; // cents, net
  creatorConnectAccountId: string;
  metadata: Record<string, string>;
}) {
  const s = requireStripe();
  return s.transfers.create({
    amount: params.amount,
    currency: "usd",
    destination: params.creatorConnectAccountId,
    metadata: params.metadata,
  });
}

export async function createConnectAccountLink(accountId: string, returnUrl: string) {
  const s = requireStripe();
  return s.accountLinks.create({
    account: accountId,
    return_url: returnUrl,
    refresh_url: returnUrl,
    type: "account_onboarding",
  });
}

export async function createConnectAccount(email: string) {
  const s = requireStripe();
  return s.accounts.create({
    type: "express",
    email,
    capabilities: { transfers: { requested: true } },
  });
}
