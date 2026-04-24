import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CollabTik…");
  const pw = await bcrypt.hash("password123", 10);

  // Clean
  await db.payment.deleteMany();
  await db.deliverable.deleteMany();
  await db.message.deleteMany();
  await db.collaboration.deleteMany();
  await db.application.deleteMany();
  await db.campaign.deleteMany();
  await db.review.deleteMany();
  await db.notification.deleteMany();
  await db.analyticsSnapshot.deleteMany();
  await db.creatorProfile.deleteMany();
  await db.brandProfile.deleteMany();
  await db.user.deleteMany();

  // Brands
  const brand1User = await db.user.create({
    data: {
      email: "brand1@demo.com",
      name: "Alex Brand",
      role: "BRAND",
      passwordHash: pw,
      onboardedAt: new Date(),
      brandProfile: {
        create: {
          companyName: "GlowUp Skincare",
          website: "https://glowup.example",
          industry: "Beauty",
          description: "Clean beauty for the Gen Z crowd.",
          verified: true,
        },
      },
    },
    include: { brandProfile: true },
  });
  const brand2User = await db.user.create({
    data: {
      email: "brand2@demo.com",
      name: "Jamie Brand",
      role: "BRAND",
      passwordHash: pw,
      onboardedAt: new Date(),
      brandProfile: { create: { companyName: "PeakFit", industry: "Fitness", description: "Home workout gear." } },
    },
    include: { brandProfile: true },
  });

  // Creators
  const creators = await Promise.all(
    [
      { email: "mia@demo.com", name: "Mia Chen", handle: "miachen", niche: ["Beauty", "Lifestyle"], followers: 125_000, er: 5.2, price: 80000 },
      { email: "jordan@demo.com", name: "Jordan Lee", handle: "jordanlee", niche: ["Fitness", "Lifestyle"], followers: 48_000, er: 6.8, price: 45000 },
      { email: "priya@demo.com", name: "Priya Patel", handle: "priya.creates", niche: ["Food", "Travel"], followers: 210_000, er: 4.1, price: 120000 },
      { email: "sam@demo.com", name: "Sam Rivera", handle: "samriv", niche: ["Tech", "Gaming"], followers: 67_000, er: 7.0, price: 60000 },
      { email: "lena@demo.com", name: "Lena Hoffmann", handle: "lenah", niche: ["Fashion", "Beauty"], followers: 92_000, er: 5.8, price: 70000 },
    ].map(async (c) =>
      db.user.create({
        data: {
          email: c.email,
          name: c.name,
          role: "CREATOR",
          passwordHash: pw,
          onboardedAt: new Date(),
          creatorProfile: {
            create: {
              tikTokHandle: c.handle,
              tikTokVerified: true,
              bio: `Hi, I'm ${c.name.split(" ")[0]}. I create content about ${c.niche.join(", ")}.`,
              niche: c.niche,
              categories: c.niche,
              languages: ["en"],
              location: "United States",
              pricePerPost: c.price,
              followerCount: c.followers,
              engagementRate: c.er,
              avgViews: Math.floor(c.followers * (c.er / 100) * 20),
              portfolioMedia: [],
            },
          },
        },
        include: { creatorProfile: true },
      })
    )
  );

  // Campaigns
  const campaign1 = await db.campaign.create({
    data: {
      brandId: brand1User.brandProfile!.id,
      title: "Summer Glow — skincare routine reel",
      description: "Looking for beauty creators to showcase our new vitamin C serum.",
      brief: "Create a 30-60s TikTok walking through your AM routine with our serum. Tone: warm, friendly, authentic.",
      budget: 150_000,
      compensationType: "FIXED",
      deadline: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      status: "OPEN",
      targetNiche: ["Beauty", "Lifestyle"],
      location: "United States",
      requirements: { minFollowers: 10000, usage: "Organic + Spark Ads" },
      briefAttachments: [],
    },
  });
  const campaign2 = await db.campaign.create({
    data: {
      brandId: brand2User.brandProfile!.id,
      title: "20-min home HIIT challenge",
      description: "Fitness creators wanted to post a home HIIT using our resistance bands.",
      brief: "Demo 3 exercises with our bands. Include a CTA for 15% off with code PEAK15.",
      budget: 80_000,
      compensationType: "FIXED",
      deadline: new Date(Date.now() + 21 * 24 * 3600 * 1000),
      status: "OPEN",
      targetNiche: ["Fitness"],
      requirements: { minFollowers: 20000 },
      briefAttachments: [],
    },
  });
  const campaign3 = await db.campaign.create({
    data: {
      brandId: brand1User.brandProfile!.id,
      title: "Lip gloss try-on haul",
      description: "Creators to review 3 shades of our new lip gloss line.",
      brief: "First impressions, swatches, and a 'which one wins' verdict.",
      budget: 60_000,
      compensationType: "PRODUCT",
      deadline: new Date(Date.now() + 14 * 24 * 3600 * 1000),
      status: "OPEN",
      targetNiche: ["Beauty", "Fashion"],
      requirements: {},
      briefAttachments: [],
    },
  });

  // One active collaboration: Mia accepted for campaign1
  const mia = creators[0];
  const app = await db.application.create({
    data: {
      campaignId: campaign1.id,
      creatorId: mia.creatorProfile!.id,
      coverLetter: "Obsessed with your brand values — would love to craft an authentic AM routine reel.",
      proposedPrice: 140_000,
      matchScore: 88,
      status: "ACCEPTED",
    },
  });
  const collab = await db.collaboration.create({
    data: {
      applicationId: app.id,
      status: "IN_PROGRESS",
      startedAt: new Date(),
      deliverables: {
        create: {
          type: "VIDEO",
          dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000),
          captionRequirements: "Include #GlowUpPartner and tag @glowup.",
          hashtags: ["#GlowUpPartner", "#skincare"],
          status: "PENDING",
        },
      },
    },
  });
  await db.payment.create({
    data: {
      collaborationId: collab.id,
      amount: 140_000,
      platformFee: 14_000,
      status: "HELD",
      stripePaymentIntentId: "pi_seed_demo",
    },
  });
  await db.campaign.update({ where: { id: campaign1.id }, data: { status: "IN_PROGRESS" } });

  // Other applications, pending
  await db.application.createMany({
    data: [
      {
        campaignId: campaign2.id,
        creatorId: creators[1].creatorProfile!.id,
        coverLetter: "I run a HIIT series twice a week — perfect fit.",
        proposedPrice: 55_000,
        matchScore: 82,
      },
      {
        campaignId: campaign1.id,
        creatorId: creators[4].creatorProfile!.id,
        coverLetter: "Fashion/beauty hybrid audience with high repeat engagement.",
        proposedPrice: 90_000,
        matchScore: 74,
      },
      {
        campaignId: campaign3.id,
        creatorId: creators[4].creatorProfile!.id,
        coverLetter: "Swatches are my specialty — great at quick comparisons.",
        proposedPrice: 30_000,
        matchScore: 71,
      },
    ],
  });

  // Analytics snapshots for Mia
  for (let i = 30; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);
    await db.analyticsSnapshot.create({
      data: {
        creatorId: mia.creatorProfile!.id,
        date: day,
        followers: 120_000 + (30 - i) * 180,
        totalLikes: 2_000_000 + (30 - i) * 12_000,
        totalViews: 18_000_000 + (30 - i) * 110_000,
        engagementRate: 5 + Math.sin(i / 5) * 0.3,
      },
    });
  }

  console.log("✅ Seed complete.");
  console.log("Accounts (password: password123):");
  console.log("  brand1@demo.com, brand2@demo.com");
  console.log("  mia@demo.com, jordan@demo.com, priya@demo.com, sam@demo.com, lena@demo.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
