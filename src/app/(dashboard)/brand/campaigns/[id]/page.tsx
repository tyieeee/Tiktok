"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency, formatNumber, initials } from "@/lib/utils";
import Link from "next/link";
import {
  X,
  Users,
  Eye,
  Heart,
  MapPin,
  DollarSign,
  Star,
  PlayCircle,
  ExternalLink,
  Inbox,
  CheckCheck,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react";

function tiktokEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("tiktok.com")) return null;
    const match = u.pathname.match(/\/video\/(\d+)/);
    if (!match) return null;
    return `https://www.tiktok.com/embed/v2/${match[1]}`;
  } catch {
    return null;
  }
}

function isLocalVideo(url: string) {
  return url.startsWith("/uploads/") && /\.(mp4|webm|mov|ogg)$/i.test(url);
}

export default function BrandCampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const utils = trpc.useUtils();
  const campaign = trpc.campaign.byId.useQuery({ id });
  const applications = trpc.application.listForCampaign.useQuery({ campaignId: id });
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const accept = trpc.application.accept.useMutation({
    onSuccess: () => {
      utils.application.listForCampaign.invalidate({ campaignId: id });
      toast.success("Application accepted");
      setSelectedAppId(null);
    },
  });
  const reject = trpc.application.reject.useMutation({
    onSuccess: () => {
      utils.application.listForCampaign.invalidate({ campaignId: id });
      toast.success("Application rejected");
      setSelectedAppId(null);
    },
  });

  if (!campaign.data) return <p className="text-muted-foreground">Loading…</p>;
  const c = campaign.data;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-muted-foreground">{c.brand.companyName}</div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{c.title}</h1>
          <Badge variant={c.status === "OPEN" ? "success" : "secondary"}>{c.status}</Badge>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Budget {formatCurrency(c.budget)} &middot; {c._count.applications} applications
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5" /> Applications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {applications.isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          )}
          {applications.data?.length === 0 && !applications.isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Inbox className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No applications yet.</p>
            </div>
          )}
          {applications.data?.map((a: any) => (
            <div
              key={a.id}
              className="flex flex-col gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={a.creator.user.avatar ?? undefined} />
                  <AvatarFallback>{initials(a.creator.user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{a.creator.user.name ?? a.creator.tikTokHandle}</div>
                  <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <span>@{a.creator.tikTokHandle}</span>
                    <span>&middot;</span>
                    <span>{formatNumber(a.creator.followerCount)} followers</span>
                    <span>&middot;</span>
                    <span>{a.creator.engagementRate.toFixed(1)}% engagement</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{a.coverLetter}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <div className="flex flex-col items-start gap-1 sm:items-end">
                  <Badge variant="outline" className="gap-1">
                    <Star className="h-3 w-3" /> Match {Math.round(a.matchScore)}
                  </Badge>
                  <div className="text-sm font-bold">{formatCurrency(a.proposedPrice)}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" asChild title="Stalk profile">
                    <Link href={`/brand/creators/${a.creator.id}`}>
                      <Search className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Stalk profile</span>
                    </Link>
                  </Button>
                  {a.status === "PENDING" ? (
                    <Button size="sm" variant="outline" onClick={() => setSelectedAppId(a.id)}>
                      View details
                    </Button>
                  ) : (
                    <Badge variant={a.status === "ACCEPTED" ? "success" : "secondary"}>{a.status}</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedAppId && (
        <ApplicantDrawer
          applicationId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
          onAccept={() => accept.mutate({ id: selectedAppId })}
          onReject={() => reject.mutate({ id: selectedAppId })}
          actionLoading={accept.isPending || reject.isPending}
        />
      )}
    </div>
  );
}

function ApplicantDrawer({
  applicationId,
  onClose,
  onAccept,
  onReject,
  actionLoading,
}: {
  applicationId: string;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  actionLoading: boolean;
}) {
  const detail = trpc.application.applicantDetail.useQuery({ id: applicationId });
  const a = detail.data;

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Drawer */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative ml-auto flex h-full w-full max-w-2xl flex-col overflow-y-auto border-l bg-background shadow-2xl animate-in slide-in-from-right duration-300"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur">
          <h2 className="text-lg font-semibold">Applicant details</h2>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!a && (
          <div className="flex-1 space-y-4 p-6">
            <div className="h-24 animate-pulse rounded-lg bg-muted" />
            <div className="h-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-64 animate-pulse rounded-lg bg-muted" />
          </div>
        )}

        {a && (
          <>
            <div className="flex-1 space-y-6 p-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={a.creator.user.avatar ?? undefined} />
                  <AvatarFallback>{initials(a.creator.user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold">{a.creator.user.name ?? a.creator.tikTokHandle}</h3>
                  <a
                    href={`https://www.tiktok.com/@${a.creator.tikTokHandle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    @{a.creator.tikTokHandle} <ExternalLink className="h-3 w-3" />
                  </a>
                  <Button variant="outline" size="sm" className="mt-2" asChild onClick={onClose}>
                    <Link href={`/brand/creators/${a.creator.id}`}>
                      <Search className="mr-2 h-3.5 w-3.5" /> Stalk full profile
                    </Link>
                  </Button>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {a.creator.niche.map((n: string) => (
                      <Badge key={n} variant="secondary" className="text-xs">
                        {n}
                      </Badge>
                    ))}
                    {a.creator.tikTokVerified && (
                      <Badge variant="success" className="gap-1 text-xs">
                        <CheckCheck className="h-3 w-3" /> Verified
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0 gap-1">
                  <Star className="h-3 w-3" /> Match {Math.round(a.matchScore)}
                </Badge>
              </div>

              {a.creator.bio && (
                <p className="rounded-lg bg-muted p-4 text-sm leading-relaxed">{a.creator.bio}</p>
              )}

              {/* Stats grid */}
              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">Creator statistics</h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard icon={Users} label="Followers" value={formatNumber(a.creator.followerCount)} color="text-blue-500" />
                  <StatCard icon={Eye} label="Avg Views" value={formatNumber(a.creator.avgViews)} color="text-purple-500" />
                  <StatCard icon={Heart} label="Engagement" value={`${a.creator.engagementRate.toFixed(1)}%`} color="text-pink-500" />
                  <StatCard icon={DollarSign} label="Price/Post" value={`$${(a.creator.pricePerPost / 100).toFixed(0)}`} color="text-green-500" />
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {a.creator.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{a.creator.location}</span>
                  </div>
                )}
                {a.creator.languages.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Languages: </span>
                    <span className="font-medium">{a.creator.languages.join(", ")}</span>
                  </div>
                )}
              </div>

              {/* Cover letter */}
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">Cover letter</h4>
                <div className="rounded-lg border bg-card p-4 text-sm leading-relaxed">{a.coverLetter}</div>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-primary/5 p-3 text-sm">
                  <span className="text-muted-foreground">Proposed price:</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(a.proposedPrice)}</span>
                </div>
              </div>

              {/* Portfolio */}
              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
                  Portfolio ({a.creator.portfolioMedia.length})
                </h4>
                {a.creator.portfolioMedia.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
                    <PlayCircle className="mb-2 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      This creator hasn&apos;t uploaded any portfolio videos yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {a.creator.portfolioMedia.map((url: string) => {
                      const embed = tiktokEmbedUrl(url);
                      return (
                        <div key={url} className="overflow-hidden rounded-lg border bg-card">
                          <div className="relative aspect-[9/16] w-full bg-muted">
                            {embed ? (
                              <iframe
                                src={embed}
                                className="h-full w-full"
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                                <PlayCircle className="mb-2 h-10 w-10 text-muted-foreground/60" />
                                <p className="break-all text-[10px] text-muted-foreground">{url}</p>
                              </div>
                            )}
                          </div>
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-1 border-t p-2 text-xs font-medium text-primary hover:bg-accent"
                          >
                            <ExternalLink className="h-3 w-3" /> Open on TikTok
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Action footer */}
            <div className="sticky bottom-0 border-t bg-background/95 px-6 py-4 backdrop-blur">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onReject} disabled={actionLoading}>
                  <XCircle className="mr-2 h-4 w-4" /> Reject
                </Button>
                <Button className="flex-1" onClick={onAccept} disabled={actionLoading}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Accept applicant
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <Icon className={`h-4 w-4 ${color}`} />
      <div className="mt-1.5 text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-lg font-bold">{value}</div>
    </div>
  );
}
