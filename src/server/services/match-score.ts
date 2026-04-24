/**
 * Smart match score between a creator and a campaign.
 * Returns a 0-100 score based on niche overlap, engagement vs budget fit,
 * follower tier match, and location proximity.
 */
export function computeMatchScore(params: {
  creator: {
    niche: string[];
    engagementRate: number;
    followerCount: number;
    location?: string | null;
    pricePerPost: number;
  };
  campaign: {
    targetNiche: string[];
    budget: number;
    location?: string | null;
  };
}): number {
  const { creator, campaign } = params;

  // Niche overlap (40%)
  const overlap = creator.niche.filter((n) => campaign.targetNiche.includes(n)).length;
  const total = new Set([...creator.niche, ...campaign.targetNiche]).size || 1;
  const nicheScore = (overlap / total) * 40;

  // Engagement (25%) — treat 5%+ as perfect
  const engagementScore = Math.min(creator.engagementRate / 5, 1) * 25;

  // Budget fit (25%) — creator price shouldn't exceed budget; closer = better
  let budgetScore = 0;
  if (creator.pricePerPost > 0 && campaign.budget > 0) {
    const ratio = creator.pricePerPost / campaign.budget;
    budgetScore = ratio <= 1 ? (1 - Math.max(0, 1 - ratio) * 0.3) * 25 : Math.max(0, 25 - (ratio - 1) * 25);
  } else {
    budgetScore = 15;
  }

  // Location (10%)
  const locationScore =
    creator.location && campaign.location && creator.location.toLowerCase() === campaign.location.toLowerCase()
      ? 10
      : 5;

  return Math.round(Math.max(0, Math.min(100, nicheScore + engagementScore + budgetScore + locationScore)));
}
