import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const authMiddleware = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isProtected =
    pathname.startsWith("/workspace") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/workspace") ||
    pathname.startsWith("/api/blog/admin");

  const isAuthRoute =
    pathname === "/workspace/login" || pathname.startsWith("/api/auth");

  if (isAuthRoute) {
    if (isLoggedIn && pathname === "/workspace/login") {
      return NextResponse.redirect(new URL("/workspace", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (isProtected && !isLoggedIn) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(
      new URL(`/workspace/login?callbackUrl=${encodeURIComponent(pathname)}`, req.nextUrl)
    );
  }

  return NextResponse.next();
});

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API routes: only auth middleware
  if (pathname.startsWith("/api/")) {
    return authMiddleware(req, { params: Promise.resolve({}) });
  }

  // Protected routes: auth first, then intl
  if (
    pathname.startsWith("/workspace") ||
    pathname.startsWith("/admin")
  ) {
    const authResult = await authMiddleware(req, { params: Promise.resolve({}) });
    if (authResult && "status" in authResult && authResult.status !== 200) {
      return authResult;
    }
    return intlMiddleware(req);
  }

  // Everything else: intl middleware only
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // Skip static files, _next, and files with extensions
    "/((?!_next|.*\\..*).*)",
  ],
};
