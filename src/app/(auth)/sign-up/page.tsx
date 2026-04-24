"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Eye, EyeOff, Video, Briefcase } from "lucide-react";
import { trpc } from "@/lib/trpc";

const schema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email(),
  password: z.string().min(8, "Min 8 characters"),
  role: z.enum(["CREATOR", "BRAND"]),
});
type Form = z.infer<typeof schema>;

export default function SignUpPage() {
  const params = useSearchParams();
  const defaultRole = (params.get("role") as "CREATOR" | "BRAND") ?? "CREATOR";
  const register = trpc.user.register.useMutation();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole, name: "", email: "", password: "" },
  });

  async function onSubmit(values: Form) {
    try {
      await register.mutateAsync(values);
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (res?.error) throw new Error(res.error);
      toast.success("Account created!");
      window.location.href = "/onboarding";
    } catch (e: any) {
      toast.error(e.message ?? "Could not create account");
    }
  }

  const role = form.watch("role");

  return (
    <div className="flex min-h-screen">
      {/* -------- Left: hero panel -------- */}
      <div className="relative hidden w-1/2 overflow-hidden bg-primary md:flex">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -right-16 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute left-40 top-60 h-40 w-40 rounded-full bg-white/10" />

        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <div className="mb-10 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">CollabTik</span>
          </div>

          <h2 className="text-4xl font-bold leading-tight">
            Join the TikTok creator economy.
          </h2>
          <p className="mt-4 text-base text-primary-foreground/80">
            Connect with brands, manage collaborations, and get paid — all in one place.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: "✓", title: "Free to join", desc: "No credit card, no subscription." },
              { icon: "✓", title: "Smart matching", desc: "Get matched with the best-fit partners." },
              { icon: "✓", title: "Escrow-backed payouts", desc: "Secure payments via Stripe Connect." },
              { icon: "✓", title: "Real TikTok analytics", desc: "Verified metrics pulled automatically." },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                  {f.icon}
                </div>
                <div>
                  <div className="font-semibold">{f.title}</div>
                  <div className="text-sm text-primary-foreground/70">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Mock stats card */}
          <div className="mt-10 rounded-xl bg-white/10 p-5 backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-xs text-primary-foreground/70">Creators</div>
              </div>
              <div>
                <div className="text-2xl font-bold">2.5K+</div>
                <div className="text-xs text-primary-foreground/70">Brands</div>
              </div>
              <div>
                <div className="text-2xl font-bold">$1.2M</div>
                <div className="text-xs text-primary-foreground/70">Paid out</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* -------- Right: form -------- */}
      <div className="flex w-full flex-col px-6 py-8 md:w-1/2 md:px-12 lg:px-20">
        {/* Logo (mobile only) */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">CollabTik</span>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose your role and get started in minutes.
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Role picker */}
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: "CREATOR", label: "Creator", desc: "I make content", icon: Video },
                { value: "BRAND", label: "Brand", desc: "I hire creators", icon: Briefcase },
              ] as const).map((r) => {
                const Icon = r.icon;
                const active = role === r.value;
                return (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => form.setValue("role", r.value)}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm transition ${
                      active ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20" : "border-input hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold">{r.label}</span>
                    <span className={`text-[11px] ${active ? "text-primary/70" : "text-muted-foreground"}`}>{r.desc}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                {role === "BRAND" ? "Your name" : "Full name"}
              </Label>
              <Input id="name" placeholder="Jane Doe" {...form.register("name")} />
              {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" {...form.register("email")} />
              {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  {...form.register("password")}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v: boolean) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating…" : "Create Account"}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-muted-foreground">Or Sign Up With</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-medium text-primary hover:underline">
                Log in.
              </Link>
            </p>
          </form>
        </div>

        <div className="flex items-center justify-between pt-6 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} CollabTik Inc.</span>
          <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
