"use client";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Eye, Heart, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function CreatorAnalyticsPage() {
  const me = trpc.user.me.useQuery();
  const profile = me.data?.creatorProfile;

  const stats = [
    { label: "Followers", value: profile?.followerCount ?? 0, icon: Users, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
    { label: "Avg Views", value: profile?.avgViews ?? 0, icon: Eye, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
    { label: "Engagement Rate", value: 0, icon: Heart, color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400", suffix: "%" },
    { label: "Profile Score", value: 0, icon: TrendingUp, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Your TikTok performance and collaboration insights.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">
                    {s.suffix ? `${(profile?.engagementRate ?? 0).toFixed(1)}${s.suffix}` : formatNumber(s.value)}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm">Performance charts will appear here once you complete collaborations.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Eye className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm">Submit deliverables to see video metrics here.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-xs font-medium uppercase text-muted-foreground">TikTok Handle</dt>
                <dd className="mt-1 text-sm font-medium">@{profile.tikTokHandle}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-muted-foreground">Niche</dt>
                <dd className="mt-1 text-sm font-medium">{profile.niche ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-muted-foreground">Location</dt>
                <dd className="mt-1 text-sm font-medium">{profile.location ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-muted-foreground">Price per post</dt>
                <dd className="mt-1 text-sm font-medium">${(profile.pricePerPost / 100).toFixed(0)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-muted-foreground">Followers</dt>
                <dd className="mt-1 text-sm font-medium">{formatNumber(profile.followerCount)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-muted-foreground">Engagement</dt>
                <dd className="mt-1 text-sm font-medium">{profile.engagementRate.toFixed(1)}%</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
