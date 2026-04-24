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

const schema = z.object({
  companyName: z.string().min(1),
  website: z.string().url().optional().or(z.literal("")),
  industry: z.string().optional(),
  description: z.string().max(1000).optional(),
});
type Form = z.infer<typeof schema>;

export function BrandOnboarding() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const onboard = trpc.user.onboardBrand.useMutation();
  const form = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Form) {
    try {
      await onboard.mutateAsync({
        companyName: values.companyName,
        website: values.website || undefined,
        industry: values.industry,
        description: values.description,
      });
      toast.success("Brand profile saved!");
      await updateSession();
      window.location.href = "/brand";
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set up your brand</CardTitle>
        <CardDescription>Creators see this on every campaign brief.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Company name</Label>
            <Input {...form.register("companyName")} />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input placeholder="https://…" {...form.register("website")} />
          </div>
          <div className="space-y-2">
            <Label>Industry</Label>
            <Input placeholder="e.g. Beauty & skincare" {...form.register("industry")} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={4} {...form.register("description")} />
          </div>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving…" : "Finish"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
