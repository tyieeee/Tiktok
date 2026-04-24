# CollabTik

A TikTok Creator ↔ Brand collaboration marketplace. Next.js 14 App Router, TypeScript, Prisma + Postgres, tRPC, Auth.js v5, Tailwind + shadcn/ui, Stripe Connect, S3/R2, TikTok Research API.

## Stack

- **Framework**: Next.js 14 App Router, React 18, TypeScript (strict)
- **UI**: Tailwind, shadcn/ui primitives, Framer Motion, Sonner toasts, next-themes
- **State**: TanStack Query + Zustand-ready
- **Data**: Prisma 5, PostgreSQL (Supabase or Neon)
- **Auth**: Auth.js v5 (Credentials + Google), role-based RBAC (`CREATOR` / `BRAND` / `ADMIN`)
- **API**: tRPC v11 (`protected`, `creator`, `brand`, `admin` procedures)
- **Payments**: Stripe Connect with escrow-style holds + releases
- **Storage**: AWS S3 / Cloudflare R2 via presigned URLs
- **TikTok**: Research API integration with deterministic dev fallback

## What's in this scaffold

This MVP scaffold is runnable end-to-end for the core flow:

- Landing → sign-up → onboarding (creator or brand wizard)
- Creator: dashboard, discovery feed (filterable), campaign detail + apply, my applications
- Brand: dashboard, create campaign wizard, campaign detail with applications inbox + accept/reject
- Backend is complete: all 11 tRPC routers, service layer (Stripe/TikTok/S3), RBAC middleware, API routes (tRPC, auth, webhooks, S3 presign, TikTok verify/metrics), schema for all 14 models.

Services ship with graceful fallbacks so the app is runnable without real API keys — Stripe payments produce simulated records, TikTok calls return deterministic stub data, S3 presign returns placeholder URLs.

### Not yet implemented (tRPC exists, UI does not)

- Collaboration workspace UI (Brief / Deliverables / Chat / Contract / Analytics tabs)
- Real-time chat UI (Supabase Realtime wiring)
- Analytics charts (Recharts)
- Payments UI (fund/release buttons, transaction history)
- Reviews UI
- Notification center UI (badge exists in sidebar)
- Mobile nav drawer

The routers and APIs for all of these are already implemented — only the React pages are missing.

## Setup

```bash
# 1. Install
npm install

# 2. Copy env
cp .env.example .env
# Fill DATABASE_URL at minimum. Other keys are optional for first run.

# 3. Generate Prisma client + push schema
npx prisma generate
npx prisma migrate dev --name init

# 4. Seed demo data (2 brands, 5 creators, 3 campaigns, 1 active collaboration)
npm run db:seed

# 5. Dev server
npm run dev
```

Open http://localhost:3000.

### Demo credentials (password: `password123`)

- Brand: `brand1@demo.com`, `brand2@demo.com`
- Creator: `mia@demo.com`, `jordan@demo.com`, `priya@demo.com`, `sam@demo.com`, `lena@demo.com`

## Required env vars

See `.env.example`. At minimum:

- `DATABASE_URL` (Supabase, Neon, or local Postgres)
- `AUTH_SECRET` (run `openssl rand -base64 32`)
- `AUTH_URL` (e.g. `http://localhost:3000`)

Optional for full integration:

- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — Google OAuth
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — real payments
- `S3_*` — real file uploads
- `TIKTOK_RESEARCH_API_TOKEN` — real TikTok stats
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase Realtime

## Stripe webhook local forwarding

```bash
stripe login
npm run stripe:listen
# copy the signing secret to STRIPE_WEBHOOK_SECRET in .env
```

## TikTok API setup

The app calls `open.tiktokapis.com/v2/research/*`. You need a **TikTok for Developers** account approved for Research API access. Set `TIKTOK_RESEARCH_API_TOKEN` in `.env`. Without it, `verifyTikTokHandle` and `fetchVideoMetrics` return deterministic stubs so development is never blocked.

## Architecture

```
src/
  app/                     Next.js App Router
    (auth)/                Sign-in, sign-up, onboarding
    (dashboard)/           Protected routes — /creator/* and /brand/*
    api/
      auth/[...nextauth]/  Auth.js handlers
      trpc/[trpc]/         tRPC HTTP entry
      webhooks/stripe/     Stripe webhook
      s3/presign/          Presigned upload URLs
      tiktok/              verify + metrics proxies
  components/              Providers, sidebar, theme toggle, ui/ primitives
  lib/                     auth.ts, utils.ts, trpc client
  server/
    db.ts                  Prisma singleton
    trpc.ts                tRPC init + protected/creator/brand middleware
    context.ts             Context factory (db + session)
    routers/               user, campaign, application, collaboration,
                           deliverable, message, payment, analytics,
                           review, tiktok, notification
    services/              stripe, tiktok, s3, match-score, notifications, sanitize
  middleware.ts            RBAC + onboarding redirect
prisma/
  schema.prisma            14 models: User, CreatorProfile, BrandProfile,
                           Campaign, Application, Collaboration, Deliverable,
                           Payment, Message, AnalyticsSnapshot, Review,
                           Notification + Auth.js tables
  seed.ts                  Demo data
```

## Key design decisions

- **Auth.js v5 (`next-auth@beta`)** with JWT strategy so middleware can read the session at the edge.
- **tRPC procedures enforce RBAC** via `creatorProcedure` / `brandProcedure` plus row-level checks (e.g. a brand can only see their own campaigns).
- **Match score** lives in `server/services/match-score.ts` — niche overlap (40%) + engagement (25%) + budget fit (25%) + location (10%). Used by `application.apply`.
- **Escrow**: `payment.fundCollaboration` creates a Stripe PaymentIntent tagged with `collaborationId`. `payment.release` triggers a transfer to the creator's Connect account. Both short-circuit to DB-only mode when Stripe isn't configured.
- **TikTok rate limiting**: simple in-memory bucket in `services/tiktok.ts` (20/min). Swap for Redis in production.
- **DOMPurify sanitization** is applied to campaign `brief` and `description` on create.
- **Graceful degradation**: every external service (Stripe, TikTok, S3) detects missing env vars and returns deterministic dev responses, so you can explore the app without any third-party accounts.

## Next steps (for production)

1. Build collaboration workspace UI (tabs for Brief, Deliverables, Chat, Contract, Analytics).
2. Wire Supabase Realtime in `components/providers.tsx` and subscribe to `messages` / `notifications` tables.
3. Add Recharts dashboards for analytics.
4. Implement file upload component using `/api/s3/presign`.
5. Hook up Stripe Connect onboarding (`createConnectAccountLink`) for creators.
6. Add mobile nav drawer.
7. Add Playwright E2E tests.
8. Add Upstash Redis for tRPC rate limiting and TikTok quota across instances.
