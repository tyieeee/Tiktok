"use client";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, TrendingUp, DollarSign, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CreatorEarningsPage() {
  const me = trpc.user.me.useQuery();
  const apps = trpc.application.listMine.useQuery();
  const accepted = apps.data?.filter((a: any) => a.status === "ACCEPTED") ?? [];
  const totalEarnings = accepted.reduce((sum: number, a: any) => sum + (a.proposedPrice ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="text-sm text-muted-foreground">Track your income from brand collaborations.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Total earned</p>
              <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">This month</p>
              <p className="text-2xl font-bold">{formatCurrency(0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{formatCurrency(0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Paid campaigns</p>
              <p className="text-2xl font-bold">{accepted.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {accepted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="mb-4 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No earnings yet. Complete collaborations to start earning.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {accepted.map((a: any) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{a.campaign.title}</p>
                    <p className="text-xs text-muted-foreground">{a.campaign.brand.companyName}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    +{formatCurrency(a.proposedPrice ?? 0)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
