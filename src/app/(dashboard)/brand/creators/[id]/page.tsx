"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Play,
  Heart,
  MessageCircle,
  Grid3x3,
  Lock,
  CheckCheck,
  MapPin,
  ExternalLink,
  Users,
  Eye,
  Sparkles,
  DollarSign,
  X,
  Share2,
  Video as VideoIcon,
} from "lucide-react";
import { cn, formatNumber, initials } from "@/lib/utils";

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

export default function BrandViewCreatorPage() {
  const { id } = useParams<{ id: string }>();
  const creator = trpc.application.creatorProfile.useQuery({ creatorId: id });
  const [active, setActive] = useState<string | null>(null);

  if (creator.isLoading) {
    return (
      <div className="mx-auto max-w-4xl animate-pulse space-y-6">
        <div className="h-40 rounded-lg bg-muted" />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[9/16] rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (creator.error) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="mb-3 text-lg font-semibold">Can&apos;t view this profile</div>
        <p className="text-sm text-muted-foreground">{creator.error.message}</p>
        <Button className="mt-5" variant="outline" asChild>
          <Link href="/brand/campaigns">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
      </div>
    );
  }

  const c = creator.data;
  if (!c) return null;

  return (
    <div className="mx-auto max-w-4xl">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/brand/campaigns">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Link>
      </Button>

      {/* ===== Profile header (TikTok style) ===== */}
      <div className="flex flex-col items-center gap-5 pb-8 sm:flex-row sm:items-start sm:gap-8">
        <Avatar className="h-28 w-28 ring-4 ring-background sm:h-32 sm:w-32">
          <AvatarImage src={c.user.avatar ?? undefined} />
          <AvatarFallback className="text-3xl">{initials(c.user.name)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-3">
            <h1 className="text-2xl font-bold tracking-tight">@{c.tikTokHandle}</h1>
            {c.tikTokVerified && (
              <Badge variant="success" className="gap-1">
                <CheckCheck className="h-3 w-3" /> Verified
              </Badge>
            )}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">{c.user.name}</div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            <Button asChild>
              <a href={`https://www.tiktok.com/@${c.tikTokHandle}`} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> Open on TikTok
              </a>
            </Button>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>

          {/* Stats row (TikTok-style) */}
          <div className="mt-6 flex justify-center gap-8 sm:justify-start">
            <Stat value={formatNumber(c.followerCount)} label="Followers" />
            <Stat value={formatNumber(c.avgViews)} label="Avg views" />
            <Stat value={`${c.engagementRate.toFixed(1)}%`} label="Engagement" />
            <Stat value={c.portfolioMedia.length} label="Videos" />
          </div>

          {/* Bio */}
          {c.bio && <p className="mt-5 max-w-md text-sm leading-relaxed">{c.bio}</p>}

          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            {c.niche?.map((n: string) => (
              <Badge key={n} variant="secondary" className="text-xs">
                #{n.toLowerCase().replace(/\s+/g, "")}
              </Badge>
            ))}
            {c.location && (
              <Badge variant="outline" className="gap-1 text-xs">
                <MapPin className="h-3 w-3" /> {c.location}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* ===== Detail stat bar ===== */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DetailStat icon={Users} label="Followers" value={formatNumber(c.followerCount)} color="text-blue-500" />
        <DetailStat icon={Eye} label="Avg Views" value={formatNumber(c.avgViews)} color="text-purple-500" />
        <DetailStat icon={Sparkles} label="Engagement" value={`${c.engagementRate.toFixed(1)}%`} color="text-pink-500" />
        <DetailStat icon={DollarSign} label="Price/Post" value={`$${(c.pricePerPost / 100).toFixed(0)}`} color="text-green-500" />
      </div>

      {/* ===== Tabs (visual only) ===== */}
      <div className="flex border-b">
        <button className="flex items-center gap-2 border-b-2 border-foreground px-4 py-3 text-sm font-semibold">
          <Grid3x3 className="h-4 w-4" /> Videos
        </button>
        <button className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground">
          <Lock className="h-4 w-4" /> Private
        </button>
        <button className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground">
          <Heart className="h-4 w-4" /> Liked
        </button>
      </div>

      {/* ===== Video grid ===== */}
      {c.portfolioMedia.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <VideoIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No videos yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            This creator hasn&apos;t uploaded any portfolio videos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1 py-4 sm:grid-cols-3 sm:gap-2">
          {c.portfolioMedia.map((url: string, idx: number) => {
            const local = isLocalVideo(url);
            const embed = tiktokEmbedUrl(url);
            const seed = url.length;
            const views = 1200 + (seed * 37) % 98000;
            const likes = 50 + (seed * 19) % 3200;
            const comments = 5 + (seed * 7) % 280;

            return (
              <button
                key={url}
                onClick={() => setActive(url)}
                className="group relative aspect-[9/16] overflow-hidden rounded-sm bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {local ? (
                  <video src={url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                ) : embed ? (
                  <iframe src={embed} className="pointer-events-none h-full w-full" allow="encrypted-media" tabIndex={-1} />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/30 to-pink-500/30 text-center">
                    <Play className="h-10 w-10 text-white drop-shadow-lg" fill="currentColor" />
                  </div>
                )}

                {idx === 0 && (
                  <div className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    Pinned
                  </div>
                )}

                <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-2 text-white">
                  <div className="flex items-center gap-1 text-xs font-semibold">
                    <Play className="h-3 w-3" fill="currentColor" />
                    {formatNumber(views)}
                  </div>
                  <div className="flex gap-2 text-[10px] opacity-90">
                    <span className="flex items-center gap-0.5">
                      <Heart className="h-3 w-3" /> {formatNumber(likes)}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MessageCircle className="h-3 w-3" /> {formatNumber(comments)}
                    </span>
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                  <Play className="h-10 w-10 text-white opacity-0 transition-opacity group-hover:opacity-100" fill="currentColor" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {active && <VideoModal url={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="text-center sm:text-left">
      <div className="text-xl font-bold sm:text-2xl">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function DetailStat({
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

function VideoModal({ url, onClose }: { url: string; onClose: () => void }) {
  const local = isLocalVideo(url);
  const embed = tiktokEmbedUrl(url);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[95vh] w-full max-w-sm flex-col overflow-hidden rounded-xl bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Button size="icon" variant="ghost" className="absolute right-2 top-2 z-10 bg-black/40 text-white hover:bg-black/60 hover:text-white" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
        <div className={cn("relative aspect-[9/16] w-full bg-black")}>
          {local ? (
            <video src={url} className="h-full w-full" controls autoPlay playsInline />
          ) : embed ? (
            <iframe
              src={embed}
              className="h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white">
              <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm">
                Open <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
