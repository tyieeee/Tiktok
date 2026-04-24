"use client";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Megaphone, Plus } from "lucide-react";

export default function BrandCampaignsListPage() {
  const campaigns = trpc.campaign.listMine.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-sm text-muted-foreground">Manage all your campaigns in one place.</p>
        </div>
        <Button asChild>
          <Link href="/brand/campaigns/new">
            <Plus className="mr-2 h-4 w-4" /> New campaign
          </Link>
        </Button>
      </div>

      {campaigns.isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-32 p-6" />
            </Card>
          ))}
        </div>
      )}

      {campaigns.data?.length === 0 && !campaigns.isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Megaphone className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">No campaigns yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create your first campaign to start receiving applications from creators.</p>
            <Button asChild className="mt-4">
              <Link href="/brand/campaigns/new">Create campaign</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.data?.map((c: any) => (
          <Link key={c.id} href={`/brand/campaigns/${c.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-1 text-base">{c.title}</CardTitle>
                  <Badge variant={c.status === "OPEN" ? "success" : "secondary"} className="shrink-0">
                    {c.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">{c.brief}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium">{formatCurrency(c.budget)}</span>
                  <span>{c._count?.applications ?? 0} applications</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
