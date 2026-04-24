"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Upload,
  Trash2,
  Play,
  Video as VideoIcon,
  Link as LinkIcon,
  Heart,
  MessageCircle,
  Share2,
  Lock,
  Grid3x3,
  CheckCheck,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { cn, formatNumber, initials } from "@/lib/utils";
import { ConnectTikTokButton } from "@/components/connect-tiktok-button";

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

export default function CreatorPortfolioPage() {
  const { data: session } = useSession();
  const me = trpc.user.me.useQuery();
  const utils = trpc.useUtils();
  const update = trpc.user.updatePortfolio.useMutation({
    onSuccess: () => {
      utils.user.me.invalidate();
    },
    onError: (e) => toast.error(e.message ?? "Failed to save"),
  });

  const [urls, setUrls] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (me.data?.creatorProfile?.portfolioMedia) {
      setUrls(me.data.creatorProfile.portfolioMedia);
    }
  }, [me.data?.creatorProfile?.portfolioMedia]);

  const profile = me.data?.creatorProfile;
  const userName = me.data?.name ?? session?.user?.name;
  const avatar = me.data?.avatar ?? session?.user?.image ?? undefined;

  async function handleFileUpload(file: File) {
    if (urls.length >= 20) {
      toast.error("Maximum of 20 portfolio items");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      const next = [...urls, data.url];
      setUrls(next);
      update.mutate({ portfolioMedia: next });
      toast.success("Video uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function addLink() {
    const trimmed = linkInput.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }
    if (urls.includes(trimmed)) {
      toast.error("This video is already in your portfolio");
      return;
    }
    if (urls.length >= 20) {
      toast.error("Maximum of 20 portfolio items");
      return;
    }
    const next = [...urls, trimmed];
    setUrls(next);
    setLinkInput("");
    setShowLinkInput(false);
    update.mutate({ portfolioMedia: next });
    toast.success("Link added");
  }

  function removeUrl(url: string) {
    const next = urls.filter((u) => u !== url);
    setUrls(next);
    update.mutate({ portfolioMedia: next });
    setActive(null);
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* ===== Profile header (TikTok style) ===== */}
      <div className="flex flex-col items-center gap-5 pb-8 pt-4 sm:flex-row sm:items-start sm:gap-8">
        <Avatar className="h-28 w-28 ring-4 ring-background sm:h-32 sm:w-32">
          <AvatarImage src={avatar} />
          <AvatarFallback className="text-3xl">{initials(userName)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-3">
            <h1 className="text-2xl font-bold tracking-tight">@{profile?.tikTokHandle ?? "yourhandle"}</h1>
            {profile?.tikTokVerified && (
              <Badge variant="success" className="gap-1">
                <CheckCheck className="h-3 w-3" /> Verified
              </Badge>
            )}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">{userName}</div>

          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            <label>
              <input
                ref={fileInput}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                }}
              />
              <Button asChild disabled={uploading}>
                <span className="cursor-pointer" onClick={() => fileInput.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? "Uploading…" : "Upload video"}
                </span>
              </Button>
            </label>
            <Button variant="outline" onClick={() => setShowLinkInput((v) => !v)}>
              <LinkIcon className="mr-2 h-4 w-4" /> Add TikTok link
            </Button>
          </div>

          {/* Link input */}
          {showLinkInput && (
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="https://www.tiktok.com/@handle/video/123…"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLink();
                  }
                }}
              />
              <Button onClick={addLink} disabled={update.isPending}>
                Add
              </Button>
            </div>
          )}

          {/* Stats row (TikTok-style) */}
          <div className="mt-6 flex justify-center gap-8 sm:justify-start">
            <Stat value={formatNumber(profile?.followerCount ?? 0)} label="Followers" />
            <Stat value={formatNumber(profile?.avgViews ?? 0)} label="Avg views" />
            <Stat value={`${(profile?.engagementRate ?? 0).toFixed(1)}%`} label="Engagement" />
            <Stat value={urls.length} label="Videos" />
          </div>

          {/* Bio */}
          {profile?.bio && <p className="mt-5 max-w-md text-sm leading-relaxed">{profile.bio}</p>}

          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            {profile?.niche?.map((n: string) => (
              <Badge key={n} variant="secondary" className="text-xs">
                #{n.toLowerCase().replace(/\s+/g, "")}
              </Badge>
            ))}
            {profile?.location && (
              <Badge variant="outline" className="gap-1 text-xs">
                <MapPin className="h-3 w-3" /> {profile.location}
              </Badge>
            )}
          </div>
        </div>
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
      {urls.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <VideoIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Upload your first video</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Show brands the quality of your work. Your videos will be visible when you apply to campaigns.
          </p>
          <Button className="mt-5" onClick={() => fileInput.current?.click()} disabled={uploading}>
            <Upload className="mr-2 h-4 w-4" /> Upload video
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1 py-4 sm:grid-cols-3 sm:gap-2">
          {urls.map((url, idx) => {
            const local = isLocalVideo(url);
            const embed = tiktokEmbedUrl(url);
            // Deterministic mock stats for visual flavor
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
                  <video
                    src={url}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : embed ? (
                  <iframe
                    src={embed}
                    className="pointer-events-none h-full w-full"
                    allow="encrypted-media"
                    tabIndex={-1}
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/30 to-pink-500/30 text-center">
                    <Play className="h-10 w-10 text-white drop-shadow-lg" fill="currentColor" />
                    <span className="mt-2 max-w-[90%] truncate text-[10px] text-white/80">{url.split("/").pop()}</span>
                  </div>
                )}

                {/* Pin badge for first video */}
                {idx === 0 && (
                  <div className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    Pinned
                  </div>
                )}

                {/* View count bottom-left */}
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

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                  <Play className="h-10 w-10 text-white opacity-0 transition-opacity group-hover:opacity-100" fill="currentColor" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ===== Video viewer modal ===== */}
      {active && (
        <VideoModal url={active} onClose={() => setActive(null)} onDelete={() => removeUrl(active)} />
      )}
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

function VideoModal({
  url,
  onClose,
  onDelete,
}: {
  url: string;
  onClose: () => void;
  onDelete: () => void;
}) {
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
        <div className="flex items-center justify-between border-t p-3">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" /> Open original
          </a>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Share2 className="mr-1 h-4 w-4" /> Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="mr-1 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
