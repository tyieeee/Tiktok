"use client";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Megaphone, TrendingUp } from "lucide-react";

export default function BrandAnalyticsPage() {
  const campaigns = trpc.campaign.listMine.useQuery();
  const totalApps = campaigns.data?.reduce((sum: number, c: any) => sum + (c._count?.applications ?? 0), 0) ?? 0;
  const openCampaigns = campaigns.data?.filter((c: any) => c.status === "OPEN").length ?? 0;

  const stats = [
    { label: "Total Campaigns", value: campaigns.data?.length ?? 0, icon: Megaphone, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
    { label: "Open Campaigns", value: openCampaigns, icon: TrendingUp, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
    { label: "Total Applications", value: totalApps, icon: Users, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
    { label: "Avg per Campaign", value: campaigns.data?.length ? Math.round(totalApps / campaigns.data.length) : 0, icon: BarChart3, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Insights into your campaigns and creator engagement.</p>
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
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campaign performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center">
              <div className="text-center">
                <BarChart3 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Campaign performance charts will appear as you get more data.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Creator engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center">
              <div className="text-center">
                <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Creator engagement metrics will show here after collaborations.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
