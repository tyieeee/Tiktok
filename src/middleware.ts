import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const path = nextUrl.pathname;

  const isPublic =
    path === "/" ||
    path.startsWith("/sign-in") ||
    path.startsWith("/sign-up") ||
    path.startsWith("/api/auth") ||
    path.startsWith("/api/trpc") ||
    path.startsWith("/api/webhooks") ||
    path.startsWith("/api/upload") ||
    path.startsWith("/uploads/") ||
    path.startsWith("/_next") ||
    path.startsWith("/favicon");

  if (isPublic) return NextResponse.next();

  if (!session?.user) {
    const url = new URL("/sign-in", nextUrl);
    url.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (!session.user.onboarded && !path.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/onboarding", nextUrl));
  }

  // RBAC route guards
  if (path.startsWith("/creator") && session.user.role !== "CREATOR" && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/brand", nextUrl));
  }
  if (path.startsWith("/brand") && session.user.role !== "BRAND" && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/creator", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
