"use client";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Handshake, ExternalLink } from "lucide-react";

const statusColor: Record<string, string> = {
  CONTRACT_PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  REVIEW: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function CreatorCollaborationsPage() {
  const apps = trpc.application.listMine.useQuery();
  const collabs = apps.data?.filter((a: any) => a.collaboration) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Collaborations</h1>
        <p className="text-sm text-muted-foreground">Track your active and past collaborations with brands.</p>
      </div>

      {apps.isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-32 p-6" />
            </Card>
          ))}
        </div>
      )}

      {collabs.length === 0 && !apps.isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Handshake className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">No collaborations yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Apply to campaigns and get accepted to start collaborating.
            </p>
            <Link href="/creator/discover" className="mt-4 text-sm font-medium text-primary hover:underline">
              Discover campaigns →
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {collabs.map((a: any) => (
          <Card key={a.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{a.campaign.title}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">{a.campaign.brand.companyName}</p>
                </div>
                <Badge className={statusColor[a.collaboration?.status ?? ""] ?? ""}>{a.collaboration?.status?.replace(/_/g, " ") ?? "Unknown"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Applied {new Date(a.createdAt).toLocaleDateString()}</span>
              <Link href={`/creator/campaigns/${a.campaignId}`} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                View <ExternalLink className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
