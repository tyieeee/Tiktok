"use client";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Handshake } from "lucide-react";
import Link from "next/link";

const statusColor: Record<string, string> = {
  CONTRACT_PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  REVIEW: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function BrandCollaborationsPage() {
  const campaigns = trpc.campaign.listMine.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Collaborations</h1>
        <p className="text-sm text-muted-foreground">Manage ongoing collaborations with creators.</p>
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
            <Handshake className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">No collaborations yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Accept applications from creators to start collaborating.</p>
            <Link href="/brand/campaigns" className="mt-4 text-sm font-medium text-primary hover:underline">
              View campaigns →
            </Link>
          </CardContent>
        </Card>
      )}

      {campaigns.data && campaigns.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active collaborations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View collaborations by visiting individual campaigns and checking accepted applications.
            </p>
            <div className="mt-4 space-y-2">
              {campaigns.data.map((c: any) => (
                <Link key={c.id} href={`/brand/campaigns/${c.id}`} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent">
                  <div>
                    <p className="text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c._count?.applications ?? 0} applications</p>
                  </div>
                  <Badge variant={c.status === "OPEN" ? "success" : "secondary"}>{c.status}</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
