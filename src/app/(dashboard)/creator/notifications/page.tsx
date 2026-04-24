"use client";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreatorNotificationsPage() {
  const notifs = trpc.notification.list.useQuery();
  const utils = trpc.useUtils();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Stay updated on your campaigns and collaborations.</p>
        </div>
      </div>

      {notifs.isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-16 p-4" />
            </Card>
          ))}
        </div>
      )}

      {notifs.data?.length === 0 && !notifs.isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">All caught up!</h3>
            <p className="mt-1 text-sm text-muted-foreground">You have no notifications yet.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {notifs.data?.map((n: any) => (
          <Card key={n.id} className={cn("transition-colors", !n.readAt && "border-primary/20 bg-primary/5")}>
            <CardContent className="flex items-start gap-4 p-4">
              <div className={cn(
                "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                !n.readAt ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {!n.readAt && (
                <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
