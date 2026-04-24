"use client";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";

const applySchema = z.object({
  coverLetter: z.string().min(10, "Share a bit more").max(2000),
  proposedPrice: z.coerce.number().min(0),
});
type ApplyForm = z.infer<typeof applySchema>;

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const campaign = trpc.campaign.byId.useQuery({ id });
  const apply = trpc.application.submit.useMutation();
  const form = useForm<ApplyForm>({ resolver: zodResolver(applySchema), defaultValues: { proposedPrice: 0 } });

  if (campaign.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!campaign.data) return <p>Not found.</p>;
  const c = campaign.data;

  async function onApply(values: ApplyForm) {
    try {
      await apply.mutateAsync({
        campaignId: id,
        coverLetter: values.coverLetter,
        proposedPrice: Math.round(values.proposedPrice * 100),
      });
      toast.success("Application submitted!");
      router.push("/creator/applications");
    } catch (e: any) {
      toast.error(e.message ?? "Could not apply");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div>
          <div className="text-sm text-muted-foreground">{c.brand.companyName}</div>
          <h1 className="mt-1 text-3xl font-bold">{c.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{formatCurrency(c.budget)}</Badge>
            <Badge variant="secondary">{c.compensationType}</Badge>
            {c.location && <Badge variant="outline">{c.location}</Badge>}
            {c.targetNiche.map((n: string) => (
              <Badge key={n} variant="secondary">
                {n}
              </Badge>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Brief</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-6">{c.brief}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-6">{c.description}</p>
          </CardContent>
        </Card>
      </div>

      <aside>
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Apply</CardTitle>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onApply)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Proposed price (USD)</Label>
                <Input type="number" min={0} step={50} {...form.register("proposedPrice")} />
              </div>
              <div className="space-y-2">
                <Label>Pitch</Label>
                <Textarea rows={6} placeholder="Why you're a fit…" {...form.register("coverLetter")} />
                {form.formState.errors.coverLetter && (
                  <p className="text-xs text-destructive">{form.formState.errors.coverLetter.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting…" : "Submit application"}
              </Button>
            </CardContent>
          </form>
        </Card>
      </aside>
    </div>
  );
}
