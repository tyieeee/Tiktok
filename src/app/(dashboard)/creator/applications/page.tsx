"use client";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const statusVariant = {
  PENDING: "secondary",
  ACCEPTED: "success",
  REJECTED: "destructive",
} as const;

export default function MyApplicationsPage() {
  const q = trpc.application.listMine.useQuery();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My applications</h1>
      {q.isLoading && <p className="text-muted-foreground">Loading…</p>}
      {q.data?.length === 0 && <p className="text-muted-foreground">No applications yet.</p>}
      <div className="space-y-3">
        {q.data?.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <div className="text-xs text-muted-foreground">{a.campaign.brand.companyName}</div>
                <div className="mt-0.5 font-semibold">{a.campaign.title}</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Proposed: {formatCurrency(a.proposedPrice)} &middot; Match: {a.matchScore}
                </div>
              </div>
              <Badge variant={statusVariant[a.status]}>{a.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
