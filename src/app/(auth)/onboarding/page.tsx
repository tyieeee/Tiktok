"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CreatorOnboarding } from "./creator-wizard";
import { BrandOnboarding } from "./brand-wizard";

export default function OnboardingPage() {
  const { data, update } = useSession();
  const router = useRouter();
  const role = data?.user?.role;
  const onboarded = data?.user?.onboarded;

  useEffect(() => {
    if (onboarded) {
      const dest = role === "BRAND" ? "/brand" : "/creator";
      router.replace(dest);
    }
  }, [onboarded, role, router]);

  // Force-refresh session on mount to pick up any DB changes
  useEffect(() => {
    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (onboarded) return null;

  return (
    <div className="container max-w-2xl py-10">
      {role === "CREATOR" && <CreatorOnboarding />}
      {role === "BRAND" && <BrandOnboarding />}
      {!role && <div className="text-muted-foreground">Loading…</div>}
    </div>
  );
}
