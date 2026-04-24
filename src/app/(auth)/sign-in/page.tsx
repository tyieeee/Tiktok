"use client";
import { signIn, getSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid email or password");
      return;
    }
    toast.success("Welcome back!");

    if (callbackUrl && callbackUrl !== "/") {
      window.location.href = callbackUrl;
      return;
    }

    // Fetch fresh session to determine where to redirect
    const session = await getSession();
    if (!session?.user) {
      window.location.href = "/";
      return;
    }
    if (!(session.user as any).onboarded) {
      window.location.href = "/onboarding";
      return;
    }
    const dest = (session.user as any).role === "BRAND" ? "/brand" : "/creator";
    window.location.href = dest;
  }

  return (
    <div className="flex min-h-screen">
      {/* -------- Left: form -------- */}
      <div className="flex w-full flex-col px-6 py-8 md:w-1/2 md:px-12 lg:px-20">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">CollabTik</span>
        </div>

        {/* Form */}
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email and password to access your account.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="h-4 w-4 rounded border-input" />
                <span>Remember Me</span>
              </label>
              <Link href="#" className="font-medium text-primary hover:underline">
                Forgot Your Password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Signing in…" : "Log In"}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-muted-foreground">Or Login With</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => signIn("google", { callbackUrl: callbackUrl ?? "/" })}
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
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="font-medium text-primary hover:underline">
                Register Now.
              </Link>
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} CollabTik Inc.</span>
          <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
        </div>
      </div>

      {/* -------- Right: hero panel -------- */}
      <div className="relative hidden w-1/2 overflow-hidden bg-primary md:flex">
        {/* decorative circles */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute right-40 top-60 h-40 w-40 rounded-full bg-white/10" />

        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <h2 className="text-4xl font-bold leading-tight">
            Effortlessly manage your creator collaborations.
          </h2>
          <p className="mt-4 text-base text-primary-foreground/80">
            Log in to access your dashboard and connect with creators & brands.
          </p>

          {/* dashboard preview mock */}
          <div className="relative mt-12">
            <div className="rounded-xl bg-white p-5 shadow-2xl">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 rounded-lg bg-indigo-50 p-3">
                  <div className="text-[10px] font-medium uppercase text-indigo-500">Total Sales</div>
                  <div className="mt-1 text-lg font-bold text-indigo-900">$189,374</div>
                  <div className="mt-1 text-[10px] text-indigo-400">▲ 7.2%</div>
                </div>
                <div className="col-span-1 rounded-lg bg-slate-50 p-3">
                  <div className="text-[10px] font-medium uppercase text-slate-500">Chat Performance</div>
                  <div className="mt-1 text-lg font-bold text-slate-900">00:01:30</div>
                </div>
                <div className="col-span-1 rounded-lg bg-slate-50 p-3">
                  <div className="text-[10px] font-medium uppercase text-slate-500">Sales Overview</div>
                  <div className="mt-2 flex h-8 items-end gap-1">
                    {[40, 70, 55, 90, 45, 80].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-indigo-400" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-lg bg-slate-50 p-3">
                <div className="text-[10px] font-medium uppercase text-slate-500">Total Profit</div>
                <div className="mt-1 text-lg font-bold text-slate-900">$25,684</div>
                <div className="mt-1 text-[10px] text-emerald-500">▲ 7.8%</div>
              </div>

              <div className="mt-3 rounded-lg border border-slate-100 p-3">
                <div className="mb-2 text-[10px] font-semibold text-slate-700">Product Transaction</div>
                {[
                  { name: "Alpine Pad Max 12", price: "$430" },
                  { name: "Alpine Phone 13", price: "$899" },
                  { name: "Alpine MacBook Air M2", price: "$1,299" },
                ].map((r) => (
                  <div key={r.name} className="flex items-center justify-between border-t border-slate-100 py-1.5 text-[10px]">
                    <span className="text-slate-600">{r.name}</span>
                    <span className="font-semibold text-slate-900">{r.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* floating card */}
            <div className="absolute -right-6 top-24 w-48 rounded-xl bg-white p-4 shadow-2xl">
              <div className="text-[10px] font-medium uppercase text-slate-500">Sales Categories</div>
              <div className="mt-2 flex items-center justify-center">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-[10px] border-indigo-400">
                  <div className="text-center">
                    <div className="text-[9px] text-slate-500">Total Sales</div>
                    <div className="text-sm font-bold text-slate-900">6,248</div>
                    <div className="text-[9px] text-slate-500">Units</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
