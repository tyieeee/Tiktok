"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NICHES = ["Beauty", "Fashion", "Fitness", "Food", "Gaming", "Tech", "Travel", "Lifestyle", "Comedy", "Education"];

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  brief: z.string().min(10),
  budget: z.coerce.number().min(1),
  compensationType: z.enum(["FIXED", "REVENUE", "PRODUCT"]),
  deadline: z.string().min(1),
  targetNiche: z.array(z.string()).default([]),
  location: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export default function NewCampaignPage() {
  const router = useRouter();
  const create = trpc.campaign.create.useMutation();
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { compensationType: "FIXED", targetNiche: [], budget: 500 },
  });

  async function onSubmit(values: Form, publish: boolean) {
    try {
      await create.mutateAsync({
        ...values,
        budget: Math.round(values.budget * 100),
        deadline: new Date(values.deadline),
        briefAttachments: [],
        requirements: {},
        publish,
      });
      toast.success(publish ? "Campaign published!" : "Draft saved");
      router.push("/brand");
    } catch (e: any) {
      toast.error(e.message ?? "Error");
    }
  }

  const niches = form.watch("targetNiche") ?? [];
  function toggle(n: string) {
    form.setValue("targetNiche", niches.includes(n) ? niches.filter((x) => x !== n) : [...niches, n]);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create a campaign</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={form.handleSubmit((v) => onSubmit(v, true))}>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input {...form.register("title")} />
            </div>
            <div className="space-y-2">
              <Label>Short description</Label>
              <Textarea rows={3} {...form.register("description")} />
            </div>
            <div className="space-y-2">
              <Label>Creative brief</Label>
              <Textarea rows={6} {...form.register("brief")} placeholder="Goal, audience, tone, do's and don'ts…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget (USD)</Label>
                <Input type="number" min={1} step={50} {...form.register("budget")} />
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input type="date" {...form.register("deadline")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Compensation</Label>
                <select
                  {...form.register("compensationType")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="FIXED">Fixed</option>
                  <option value="REVENUE">Revenue share</option>
                  <option value="PRODUCT">Product</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Location (optional)</Label>
                <Input {...form.register("location")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Target niches</Label>
              <div className="flex flex-wrap gap-2">
                {NICHES.map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => toggle(n)}
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      niches.includes(n) ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-accent"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
                Publish
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={form.handleSubmit((v) => onSubmit(v, false))}
              >
                Save as draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
