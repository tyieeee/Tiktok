"use client";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Megaphone, Users, DollarSign, TrendingUp, Plus, ArrowRight } from "lucide-react";

export default function BrandHomePage() {
  const campaigns = trpc.campaign.listMine.useQuery();
  const totalBudget = campaigns.data?.reduce((sum: number, c: any) => sum + (c.budget ?? 0), 0) ?? 0;
  const totalApps = campaigns.data?.reduce((sum: number, c: any) => sum + (c._count?.applications ?? 0), 0) ?? 0;
  const openCount = campaigns.data?.filter((c: any) => c.status === "OPEN").length ?? 0;

  const stats = [
    { title: "Campaigns", value: `${campaigns.data?.length ?? 0}`, icon: Megaphone, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
    { title: "Open", value: `${openCount}`, icon: TrendingUp, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
    { title: "Applications", value: `${totalApps}`, icon: Users, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
    { title: "Total Budget", value: formatCurrency(totalBudget), icon: DollarSign, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brand Dashboard</h1>
          <p className="text-sm text-muted-foreground">Post briefs, review applicants, track collaborations.</p>
        </div>
        <Button asChild>
          <Link href="/brand/campaigns/new">
            <Plus className="mr-2 h-4 w-4" /> New campaign
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.title}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">{s.title}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle>Recent campaigns</CardTitle>
          {(campaigns.data?.length ?? 0) > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/brand/campaigns">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {campaigns.isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          )}
          {campaigns.data?.length === 0 && !campaigns.isLoading && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Megaphone className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No campaigns yet. Create your first to start receiving applications.</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/brand/campaigns/new">Create campaign</Link>
              </Button>
            </div>
          )}
          <div className="space-y-2">
            {campaigns.data?.slice(0, 5).map((c: any) => (
              <Link key={c.id} href={`/brand/campaigns/${c.id}`} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(c.budget)} · {c._count?.applications ?? 0} applications</p>
                </div>
                <Badge variant={c.status === "OPEN" ? "success" : "secondary"} className="ml-3 shrink-0">{c.status}</Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
