"use client";
import Link from "next/link";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const NICHES = ["Beauty", "Fashion", "Fitness", "Food", "Gaming", "Tech", "Travel", "Lifestyle", "Comedy", "Education"];

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [minBudget, setMinBudget] = useState<number | undefined>();
  const [selectedNiche, setSelectedNiche] = useState<string[]>([]);

  const query = trpc.campaign.list.useQuery({
    search: search || undefined,
    niche: selectedNiche.length ? selectedNiche : undefined,
    minBudget: minBudget ? minBudget * 100 : undefined,
  });

  function toggleNiche(n: string) {
    setSelectedNiche((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input placeholder="Keyword…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Min budget (USD)</Label>
              <Input type="number" min={0} value={minBudget ?? ""} onChange={(e) => setMinBudget(e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div className="space-y-2">
              <Label>Niche</Label>
              <div className="flex flex-wrap gap-2">
                {NICHES.map((n) => (
                  <button
                    key={n}
                    onClick={() => toggleNiche(n)}
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      selectedNiche.includes(n) ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-accent"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Open campaigns</h1>
        {query.isLoading && (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        )}
        {query.data?.items.length === 0 && (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              No campaigns match these filters. Try clearing some.
            </CardContent>
          </Card>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {query.data?.items.map((c) => (
            <Link key={c.id} href={`/creator/campaigns/${c.id}`}>
              <Card className="transition hover:border-primary/60 hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">{c.brand.companyName}</div>
                      <h3 className="mt-1 line-clamp-2 font-semibold">{c.title}</h3>
                    </div>
                    <Badge>{formatCurrency(c.budget)}</Badge>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1">
                    {c.targetNiche.slice(0, 4).map((n) => (
                      <Badge key={n} variant="secondary">
                        {n}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
