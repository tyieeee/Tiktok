"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Megaphone,
  Search,
  Inbox,
  Handshake,
  CreditCard,
  BarChart3,
  Bell,
  LogOut,
  Video,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { trpc } from "@/lib/trpc";

const creatorNav = [
  { href: "/creator", label: "Dashboard", icon: LayoutDashboard },
  { href: "/creator/discover", label: "Discover", icon: Search },
  { href: "/creator/applications", label: "My Applications", icon: Inbox },
  { href: "/creator/portfolio", label: "Portfolio", icon: Video },
  { href: "/creator/collaborations", label: "Collaborations", icon: Handshake },
  { href: "/creator/earnings", label: "Earnings", icon: CreditCard },
  { href: "/creator/analytics", label: "Analytics", icon: BarChart3 },
];

const brandNav = [
  { href: "/brand", label: "Dashboard", icon: LayoutDashboard },
  { href: "/brand/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/brand/collaborations", label: "Collaborations", icon: Handshake },
  { href: "/brand/payments", label: "Payments", icon: CreditCard },
  { href: "/brand/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const nav = role === "BRAND" ? brandNav : creatorNav;
  const unread = trpc.notification.unreadCount.useQuery(undefined, { enabled: !!session });

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="h-8 w-8 rounded-lg bg-primary" />
        <div className="text-lg font-bold tracking-tight">CollabTik</div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <Link
          href={role === "BRAND" ? "/brand/notifications" : "/creator/notifications"}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Bell className="h-4 w-4" /> Notifications
          {!!unread.data && unread.data > 0 && (
            <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
              {unread.data}
            </span>
          )}
        </Link>
      </nav>
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image ?? undefined} />
            <AvatarFallback>{initials(session?.user?.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{session?.user?.name ?? "You"}</div>
            <div className="truncate text-xs text-muted-foreground">{session?.user?.email}</div>
          </div>
          <ThemeToggle />
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
    </aside>
  );
}
