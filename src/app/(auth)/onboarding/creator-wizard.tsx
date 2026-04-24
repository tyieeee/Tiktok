"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";

const NICHES = ["Beauty", "Fashion", "Fitness", "Food", "Gaming", "Tech", "Travel", "Lifestyle", "Comedy", "Education"];

const schema = z.object({
  tikTokHandle: z.string().min(1),
  bio: z.string().max(500).optional().or(z.literal("")),
  niche: z.array(z.string()).min(1, "Pick at least one niche"),
  location: z.string().optional(),
  pricePerPost: z.coerce.number().int().min(0),
});
type Form = z.infer<typeof schema>;

export function CreatorOnboarding() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const onboard = trpc.user.onboardCreator.useMutation();
  const form = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { niche: [], pricePerPost: 0 } });

  async function onSubmit(values: Form) {
    try {
      await onboard.mutateAsync({
        tikTokHandle: values.tikTokHandle,
        bio: values.bio || undefined,
        niche: values.niche,
        categories: [],
        languages: [],
        location: values.location,
        pricePerPost: Math.round(values.pricePerPost * 100),
        portfolioMedia: [],
      });
      toast.success("Profile created!");
      await updateSession();
      window.location.href = "/creator";
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
    }
  }

  const selected = form.watch("niche") ?? [];
  function toggle(n: string) {
    form.setValue("niche", selected.includes(n) ? selected.filter((x) => x !== n) : [...selected, n]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set up your creator profile</CardTitle>
        <CardDescription>We&apos;ll verify your TikTok handle and pull your public stats.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>TikTok handle</Label>
            <Input placeholder="@yourhandle" {...form.register("tikTokHandle")} />
            {form.formState.errors.tikTokHandle && (
              <p className="text-xs text-destructive">{form.formState.errors.tikTokHandle.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea rows={3} {...form.register("bio")} placeholder="What do you create?" />
          </div>
          <div className="space-y-2">
            <Label>Niches</Label>
            <div className="flex flex-wrap gap-2">
              {NICHES.map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => toggle(n)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    selected.includes(n) ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-accent"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            {form.formState.errors.niche && <p className="text-xs text-destructive">{form.formState.errors.niche.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="e.g. Los Angeles, CA" {...form.register("location")} />
            </div>
            <div className="space-y-2">
              <Label>Price per post (USD)</Label>
              <Input type="number" min={0} step={50} {...form.register("pricePerPost")} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving…" : "Finish"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
