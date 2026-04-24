import Link from "next/link";
import {
  Target,
  ShieldCheck,
  BarChart3,
  FileText,
  Workflow,
  MessageSquare,
  Star,
  Bell,
  TrendingUp,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { ScrollReveal } from "@/components/scroll-reveal";
import { CountUp } from "@/components/count-up";

// Floating feature icons orbiting around the hero — connected to the center via faint SVG lines.
function FloatingIcons() {
  const items = [
    { Icon: Target, cls: "left-[6%] top-[14%] animate-float", delay: "0s", rotate: "-rotate-6" },
    { Icon: ShieldCheck, cls: "right-[8%] top-[8%] animate-float-slow", delay: "1.2s", rotate: "rotate-6" },
    { Icon: BarChart3, cls: "right-[4%] top-[40%] animate-float", delay: "0.6s", rotate: "rotate-3" },
    { Icon: MessageSquare, cls: "left-[4%] top-[46%] animate-float-slow", delay: "1.8s", rotate: "-rotate-3" },
    { Icon: Star, cls: "left-[14%] bottom-[8%] animate-float", delay: "2.4s", rotate: "rotate-6" },
    { Icon: TrendingUp, cls: "right-[14%] bottom-[10%] animate-float-slow", delay: "0.3s", rotate: "-rotate-6" },
    { Icon: Bell, cls: "left-[28%] top-[4%] animate-float-slow hidden lg:block", delay: "0.9s", rotate: "rotate-3" },
    { Icon: FileText, cls: "right-[28%] bottom-[4%] animate-float hidden lg:block", delay: "1.5s", rotate: "-rotate-3" },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      {/* Connector lines (SVG) from each icon toward the hero center */}
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g stroke="url(#lineGrad)" strokeWidth="1.2" strokeDasharray="4 6" fill="none">
          <line x1="10%" y1="18%" x2="50%" y2="50%" />
          <line x1="90%" y1="12%" x2="50%" y2="50%" />
          <line x1="94%" y1="44%" x2="50%" y2="50%" />
          <line x1="6%" y1="50%" x2="50%" y2="50%" />
          <line x1="16%" y1="90%" x2="50%" y2="50%" />
          <line x1="84%" y1="88%" x2="50%" y2="50%" />
        </g>
      </svg>

      {/* Icon badges */}
      {items.map(({ Icon, cls, delay, rotate }, i) => (
        <div
          key={i}
          className={`absolute ${cls} ${rotate}`}
          style={{ animationDelay: delay }}
        >
          <div className="relative">
            {/* pulsing halo */}
            <span className="absolute inset-0 rounded-2xl bg-primary/20 animate-pulse-ring" />
            {/* icon tile — matches feature card style (rose gradient) */}
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-pink-500 text-white shadow-xl shadow-primary/30 ring-1 ring-white/40 backdrop-blur md:h-16 md:w-16">
              <Icon className="h-6 w-6 md:h-7 md:w-7" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* ---------- gradient backdrop ---------- */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-background" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      {/* ==================== NAVBAR ==================== */}
      <header className="sticky top-0 z-40 border-b border-transparent bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">CollabTik</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-foreground">Features</a>
            <a href="#how-it-works" className="transition hover:text-foreground">How it works</a>
            <a href="#creators" className="transition hover:text-foreground">For creators</a>
            <a href="#brands" className="transition hover:text-foreground">For brands</a>
            <a href="#pricing" className="transition hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ==================== HERO ==================== */}
      <section className="relative container py-20 md:py-32">
        {/* Floating icon orbit — connected to CollabTik via SVG lines */}
        <FloatingIcons />

        <ScrollReveal>
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">Now in open beta</Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Where TikTok creators meet brands that{" "}
              <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">get it.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
              A marketplace for paid collaborations with real analytics, escrow-backed payouts,
              and a workspace that handles briefs, deliverables, and approvals end-to-end.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/sign-up?role=CREATOR">
                  I&apos;m a creator <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/sign-up?role=BRAND">I&apos;m a brand</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Free to join · No credit card required</p>
          </div>
        </ScrollReveal>
      </section>

      {/* ==================== STATS BAR (animated counts) ==================== */}
      <section className="border-y bg-muted/40">
        <div className="container grid grid-cols-2 gap-6 py-14 md:grid-cols-4">
          {[
            { end: 10000, suffix: "+", label: "Creators", compact: true },
            { end: 2500, suffix: "+", label: "Brands", compact: true },
            { end: 1.2, prefix: "$", suffix: "M", label: "Paid out", decimals: 1 },
            { end: 98, suffix: "%", label: "Satisfaction" },
          ].map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 100}>
              <div className="text-center">
                <div className="text-4xl font-bold md:text-5xl">
                  <CountUp
                    end={s.end}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    decimals={s.decimals}
                    compact={s.compact}
                  />
                </div>
                <div className="mt-2 text-sm font-medium text-muted-foreground">{s.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ==================== CORE FEATURES ==================== */}
      <section id="features" className="container py-24">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-3">Platform features</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              Everything you need for seamless collaborations
            </h2>
            <p className="mt-4 text-muted-foreground">
              From discovery to payout, CollabTik covers the entire creator-brand workflow.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Target,
              title: "Smart matching",
              body: "Our algorithm scores every application by niche fit, engagement rate, audience demographics, and budget alignment so brands always see the best-fit creators first.",
            },
            {
              icon: ShieldCheck,
              title: "Escrow-backed payments",
              body: "Stripe Connect holds funds in escrow the moment a collaboration starts. Money is released only after the brand approves the final deliverable.",
            },
            {
              icon: BarChart3,
              title: "TikTok analytics",
              body: "Paste any TikTok video URL and we pull real views, likes, shares, and comments via the TikTok Research API — no manual screenshots needed.",
            },
            {
              icon: FileText,
              title: "Campaign briefs & requirements",
              body: "Brands create detailed briefs with hashtags, caption requirements, content type (video, story, live), target niche, budget, and deadline — all in one place.",
            },
            {
              icon: Workflow,
              title: "Deliverable workflow",
              body: "Creators submit content → brands review → request revisions or approve. Every step is tracked with timestamps, revision counts, and feedback threads.",
            },
            {
              icon: MessageSquare,
              title: "Real-time messaging",
              body: "Built-in chat per collaboration with file attachments, powered by Supabase Realtime so you never miss a message from your partner.",
            },
            {
              icon: Star,
              title: "Two-way reviews",
              body: "After every collaboration, both the creator and brand rate each other (1–5 stars + comments). Build a reputation that opens doors.",
            },
            {
              icon: Bell,
              title: "Instant notifications",
              body: "New application, deliverable submitted, payment released — get notified in-app the moment something happens on your campaigns.",
            },
            {
              icon: TrendingUp,
              title: "Analytics snapshots",
              body: "Creator profiles track follower growth, engagement trends, and average views over time so brands can evaluate long-term performance.",
            },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <ScrollReveal key={f.title} delay={(i % 3) * 100}>
                <Card className="group h-full border-border/60 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="how-it-works" className="border-y bg-muted/40 py-24">
        <div className="container">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-3">How it works</Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                From sign-up to payout in 5 steps
              </h2>
            </div>
          </ScrollReveal>

          <div className="mx-auto mt-16 max-w-3xl">
            {[
              { step: "01", title: "Create your profile", desc: "Sign up as a Creator or Brand. Creators link their TikTok handle; brands add company details. Our onboarding wizard handles it all." },
              { step: "02", title: "Post or discover campaigns", desc: "Brands publish campaigns with budgets, briefs, and requirements. Creators browse, filter by niche/budget, and see their match score." },
              { step: "03", title: "Apply & get matched", desc: "Creators submit a cover letter and proposed price. Brands review applications ranked by our smart-match algorithm and accept the best fit." },
              { step: "04", title: "Collaborate & deliver", desc: "Once accepted, a collaboration workspace opens: shared briefs, deliverable checklist, revision tracking, chat, and a contract link." },
              { step: "05", title: "Approve & get paid", desc: "Brand approves the final deliverable → escrow is released → creator gets paid via Stripe Connect. Both sides leave a review." },
            ].map((s, i, arr) => (
              <ScrollReveal key={s.step} delay={i * 80} from="left">
                <div className="relative flex gap-6 pb-10 last:pb-0">
                  {i < arr.length - 1 && (
                    <div className="absolute left-[1.4rem] top-12 h-full w-px bg-gradient-to-b from-primary/40 to-transparent" />
                  )}
                  <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25">
                    {s.step}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FOR CREATORS ==================== */}
      <section id="creators" className="container py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <ScrollReveal from="left">
            <div>
              <Badge className="mb-3">For creators</Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Grow your income, not your admin work</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Stop chasing brands in DMs. CollabTik brings campaigns to you, handles payments, and lets
                you focus on what you do best — creating great content.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Browse campaigns filtered by niche, budget, and deadline",
                  "See your match score before applying — know your chances",
                  "Track all your applications, collabs, and deliverables in one dashboard",
                  "Get paid securely via Stripe Connect escrow",
                  "Build a verified public profile with real TikTok analytics",
                  "Receive ratings and reviews to boost your credibility",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3 w-3" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8" size="lg" asChild>
                <Link href="/sign-up?role=CREATOR">Join as a creator</Link>
              </Button>
            </div>
          </ScrollReveal>

          <ScrollReveal from="right" delay={150}>
            <div className="relative rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8 shadow-xl">
              <div className="space-y-4">
                {[
                  { label: "Followers", value: "125.4K", trend: "+12%" },
                  { label: "Avg views", value: "48.2K", trend: "+8%" },
                  { label: "Engagement rate", value: "6.8%", trend: "+1.2%" },
                  { label: "Active collabs", value: "3", trend: null },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
                    <div>
                      <div className="text-xs font-medium uppercase text-muted-foreground">{s.label}</div>
                      <div className="mt-1 text-2xl font-bold">{s.value}</div>
                    </div>
                    {s.trend && (
                      <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-600 dark:text-green-400">
                        {s.trend}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== FOR BRANDS ==================== */}
      <section id="brands" className="border-y bg-muted/40 py-24">
        <div className="container grid items-center gap-12 md:grid-cols-2">
          <ScrollReveal from="left" className="order-2 md:order-1">
            <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8 shadow-xl">
              <div className="space-y-3">
                {[
                  { title: "Summer Glow Campaign", status: "OPEN", apps: 24, budget: "$2,500" },
                  { title: "Product Launch – Sept", status: "IN_PROGRESS", apps: 12, budget: "$5,000" },
                  { title: "Holiday Collection", status: "DRAFT", apps: 0, budget: "$8,000" },
                ].map((c) => (
                  <div key={c.title} className="rounded-lg border bg-card p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{c.title}</span>
                      <Badge variant={c.status === "OPEN" ? "success" : c.status === "IN_PROGRESS" ? "default" : "secondary"}>
                        {c.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                      <span>Budget: {c.budget}</span>
                      <span>{c.apps} applications</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal from="right" delay={150} className="order-1 md:order-2">
            <div>
              <Badge className="mb-3">For brands</Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Find the perfect creator, fast</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Post a campaign, let our algorithm rank applicants, and manage the entire collaboration — from
                brief to final video — without leaving the platform.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Create campaigns with detailed briefs, hashtags, and content requirements",
                  "Smart-match algorithm ranks creators by niche fit and engagement",
                  "Manage applications, acceptances, and rejections in bulk",
                  "Track deliverables with status, revisions, and approval workflows",
                  "Escrow payments via Stripe — pay only for approved work",
                  "Pull real TikTok metrics for delivered videos automatically",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3 w-3" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8" size="lg" asChild>
                <Link href="/sign-up?role=BRAND">Join as a brand</Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== COLLABORATION WORKFLOW DETAIL ==================== */}
      <section className="container py-24">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-3">The workspace</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              A dedicated workspace for every collaboration
            </h2>
            <p className="mt-4 text-muted-foreground">
              Once an application is accepted, both parties get a shared workspace with everything they need.
            </p>
          </div>
        </ScrollReveal>

        <div className="mx-auto mt-16 grid max-w-4xl gap-5 md:grid-cols-2">
          {[
            { title: "Deliverable checklist", desc: "Each collaboration has a list of deliverables (Video, Story, Live) with due dates. Creators submit, brands review, request revisions, or approve." },
            { title: "Revision tracking", desc: "Every revision is counted and timestamped. Feedback is stored per deliverable so nothing gets lost in long email threads." },
            { title: "Contract management", desc: "Attach a contract URL to the collaboration. Both parties can reference terms without switching to another tool." },
            { title: "Integrated chat", desc: "Real-time messaging with file attachments per collaboration. Powered by Supabase Realtime for instant delivery." },
            { title: "Payment timeline", desc: "See exactly when escrow was created, when deliverables were approved, and when funds were released — full transparency." },
            { title: "Post-collab reviews", desc: "After completion, both the creator and brand leave a 1–5 star rating with optional comments, building trust across the platform." },
          ].map((item, i) => (
            <ScrollReveal key={item.title} delay={(i % 2) * 100}>
              <Card className="h-full border-border/60 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ==================== PRICING ==================== */}
      <section id="pricing" className="border-y bg-muted/40 py-24">
        <div className="container">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-3">Simple pricing</Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                Free to join. We only earn when you do.
              </h2>
              <p className="mt-4 text-muted-foreground">
                No subscriptions, no listing fees. CollabTik takes a{" "}
                <span className="font-semibold text-foreground">
                  <CountUp end={10} suffix="%" />
                </span>{" "}
                platform fee only when a payment is successfully released.
              </p>
            </div>
          </ScrollReveal>

          <div className="mx-auto mt-16 grid max-w-3xl gap-6 md:grid-cols-2">
            <ScrollReveal from="left">
              <Card className="relative overflow-hidden shadow-xl">
                <div className="absolute right-0 top-0 rounded-bl-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Popular
                </div>
                <CardContent className="p-8">
                  <h3 className="text-lg font-bold">Creators</h3>
                  <div className="mt-4 text-4xl font-bold">Free</div>
                  <p className="mt-1 text-sm text-muted-foreground">forever</p>
                  <Separator className="my-6" />
                  <ul className="space-y-3 text-sm">
                    {["Unlimited applications", "Full creator profile & analytics", "Real-time messaging", "Stripe Connect payouts", "10% fee on received payments"].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-8 w-full" asChild>
                    <Link href="/sign-up?role=CREATOR">Get started</Link>
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal from="right" delay={100}>
              <Card className="shadow-xl">
                <CardContent className="p-8">
                  <h3 className="text-lg font-bold">Brands</h3>
                  <div className="mt-4 text-4xl font-bold">Free</div>
                  <p className="mt-1 text-sm text-muted-foreground">forever</p>
                  <Separator className="my-6" />
                  <ul className="space-y-3 text-sm">
                    {["Unlimited campaigns", "Smart-match creator ranking", "Deliverable & approval workflow", "Escrow payments via Stripe", "10% platform fee per payout"].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-8 w-full" variant="outline" asChild>
                    <Link href="/sign-up?role=BRAND">Get started</Link>
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="border-t bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-24">
        <ScrollReveal>
          <div className="container text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              Ready to start collaborating?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Join thousands of TikTok creators and brands already using CollabTik to run seamless, paid
              collaborations.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/sign-up?role=CREATOR">
                  Join as a creator <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/sign-up?role=BRAND">Join as a brand</Link>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t py-10">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <Sparkles className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">CollabTik</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CollabTik. All rights reserved.
          </p>
          <nav className="flex gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Support</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
