"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Menu, X, LayoutDashboard, Search, Inbox, Handshake, CreditCard, BarChart3, Bell, Megaphone, LogOut, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const creatorNav = [
  { href: "/creator", label: "Dashboard", icon: LayoutDashboard },
  { href: "/creator/discover", label: "Discover", icon: Search },
  { href: "/creator/applications", label: "Applications", icon: Inbox },
  { href: "/creator/portfolio", label: "Portfolio", icon: Video },
  { href: "/creator/collaborations", label: "Collaborations", icon: Handshake },
  { href: "/creator/earnings", label: "Earnings", icon: CreditCard },
  { href: "/creator/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/creator/notifications", label: "Notifications", icon: Bell },
];

const brandNav = [
  { href: "/brand", label: "Dashboard", icon: LayoutDashboard },
  { href: "/brand/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/brand/collaborations", label: "Collaborations", icon: Handshake },
  { href: "/brand/payments", label: "Payments", icon: CreditCard },
  { href: "/brand/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/brand/notifications", label: "Notifications", icon: Bell },
];

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const nav = role === "BRAND" ? brandNav : creatorNav;

  return (
    <div className="md:hidden">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary" />
          <span className="text-base font-bold">CollabTik</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {open && (
        <nav className="border-b bg-card px-4 py-3">
          <div className="space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="mt-3 border-t pt-3">
            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
