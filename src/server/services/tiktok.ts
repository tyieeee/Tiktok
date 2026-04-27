import { env } from "@/env";

export type TikTokProfileStats = {
  handle: string;
  followerCount: number;
  avgViews: number;
  engagementRate: number;
  verified: boolean;
};

export type TikTokVideoMetrics = {
  videoId: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
};

const rateLimitBucket = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_MIN = 20;

function rateLimit(key: string) {
  const now = Date.now();
  const entry = rateLimitBucket.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitBucket.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.count++;
  if (entry.count > MAX_PER_MIN) throw new Error("TikTok API rate limit exceeded");
}

function extractVideoId(url: string): string | null {
  const m = url.match(/\/video\/(\d+)/);
  return m?.[1] ?? null;
}

/**
 * Verifies a TikTok handle exists and fetches public stats.
 * Falls back to a deterministic stub when API credentials are absent so the app remains runnable.
 */
export async function verifyTikTokHandle(handle: string): Promise<TikTokProfileStats> {
  rateLimit("verify");
  const normalized = handle.replace(/^@/, "");

  if (!env.TIKTOK_RESEARCH_API_TOKEN) {
    // Deterministic dev fallback
    const seed = [...normalized].reduce((a, c) => a + c.charCodeAt(0), 0);
    return {
      handle: normalized,
      followerCount: 5_000 + (seed % 50) * 1_000,
      avgViews: 10_000 + (seed % 80) * 500,
      engagementRate: 2 + (seed % 30) / 10,
      verified: false,
    };
  }

  const res = await fetch("https://open.tiktokapis.com/v2/research/user/info/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.TIKTOK_RESEARCH_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: normalized, fields: ["follower_count", "likes_count", "video_count"] }),
  });
  if (!res.ok) throw new Error(`TikTok verify failed: ${res.status}`);
  const json: any = await res.json();
  const u = json.data?.user ?? {};
  const follower = Number(u.follower_count ?? 0);
  const likes = Number(u.likes_count ?? 0);
  const videos = Number(u.video_count ?? 1);
  const avgViews = Math.round(likes / Math.max(videos, 1) * 10);
  const engagementRate = follower > 0 ? (likes / follower) * 100 / Math.max(videos, 1) : 0;
  return { handle: normalized, followerCount: follower, avgViews, engagementRate, verified: true };
}

/**
 * Fetch recent video URLs for a TikTok user.
 * Falls back to deterministic stub URLs when API credentials are absent.
 */
export async function fetchUserVideos(handle: string, limit = 9): Promise<string[]> {
  rateLimit("videos");
  const normalized = handle.replace(/^@/, "");

  if (!env.TIKTOK_RESEARCH_API_TOKEN) {
    const seed = [...normalized].reduce((a, c) => a + c.charCodeAt(0), 0);
    return Array.from({ length: limit }, (_, i) => {
      // Generate plausible 19-digit TikTok video IDs
      const id = `7${String(seed + i * 123457).padStart(18, "9").slice(-18)}`;
      return `https://www.tiktok.com/@${normalized}/video/${id}`;
    });
  }

  const res = await fetch("https://open.tiktokapis.com/v2/research/video/query/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.TIKTOK_RESEARCH_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: { and: [{ operation: "EQ", field_name: "username", field_values: [normalized] }] },
      fields: ["id", "username"],
      max_count: limit,
    }),
  });
  if (!res.ok) throw new Error(`TikTok videos failed: ${res.status}`);
  const json: any = await res.json();
  const videos: any[] = json.data?.videos ?? [];
  return videos.map((v) => `https://www.tiktok.com/@${v.username ?? normalized}/video/${v.id}`);
}

export async function fetchVideoMetrics(tikTokUrl: string): Promise<TikTokVideoMetrics> {
  rateLimit("metrics");
  const videoId = extractVideoId(tikTokUrl);
  if (!videoId) throw new Error("Invalid TikTok video URL");

  if (!env.TIKTOK_RESEARCH_API_TOKEN) {
    const seed = Number(videoId.slice(-6));
    return {
      videoId,
      views: 10_000 + (seed % 9_990_000),
      likes: 500 + (seed % 99_500),
      shares: 20 + (seed % 2_980),
      comments: 10 + (seed % 990),
    };
  }

  const res = await fetch("https://open.tiktokapis.com/v2/research/video/query/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.TIKTOK_RESEARCH_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: { and: [{ operation: "EQ", field_name: "video_id", field_values: [videoId] }] },
      fields: ["id", "view_count", "like_count", "share_count", "comment_count"],
    }),
  });
  if (!res.ok) throw new Error(`TikTok metrics failed: ${res.status}`);
  const json: any = await res.json();
  const v = json.data?.videos?.[0] ?? {};
  return {
    videoId,
    views: Number(v.view_count ?? 0),
    likes: Number(v.like_count ?? 0),
    shares: Number(v.share_count ?? 0),
    comments: Number(v.comment_count ?? 0),
  };
}
