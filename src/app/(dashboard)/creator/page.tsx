"use client";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { Users, Eye, Heart, Inbox, Search, ArrowRight } from "lucide-react";
import { ConnectTikTokButton } from "@/components/connect-tiktok-button";

export default function CreatorHomePage() {
  const me = trpc.user.me.useQuery();
  const profile = me.data?.creatorProfile;
  const apps = trpc.application.listMine.useQuery();

  const stats = [
    { title: "Followers", value: profile ? formatNumber(profile.followerCount) : "—", icon: Users, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
    { title: "Avg Views", value: profile ? formatNumber(profile.avgViews) : "—", icon: Eye, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
    { title: "Engagement", value: profile ? `${profile.engagementRate.toFixed(1)}%` : "—", icon: Heart, color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" },
    { title: "Applications", value: apps.data ? `${apps.data.length}` : "—", icon: Inbox, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back{me.data?.name ? `, ${me.data.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">Find new campaigns and track your collaborations.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ConnectTikTokButton
            variant="outline"
            defaultHandle={profile?.tikTokHandle ?? undefined}
            connectedHandle={profile?.tikTokVerified ? profile.tikTokHandle : null}
          />
          <Button asChild>
            <Link href="/creator/discover">
              <Search className="mr-2 h-4 w-4" /> Discover campaigns
            </Link>
          </Button>
        </div>
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
          <CardTitle>Recent applications</CardTitle>
          {(apps.data?.length ?? 0) > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/creator/applications">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {apps.isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          )}
          {apps.data?.length === 0 && !apps.isLoading && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Inbox className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No applications yet.{" "}
                <Link className="font-medium text-primary hover:underline" href="/creator/discover">
                  Browse campaigns →
                </Link>
              </p>
            </div>
          )}
          <ul className="divide-y">
            {apps.data?.slice(0, 5).map((a: any) => (
              <li key={a.id} className="flex items-center justify-between py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{a.campaign.title}</div>
                  <div className="text-xs text-muted-foreground">{a.campaign.brand.companyName}</div>
                </div>
                <Badge variant={a.status === "ACCEPTED" ? "success" : a.status === "REJECTED" ? "destructive" : "secondary"} className="ml-3 shrink-0">
                  {a.status}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
