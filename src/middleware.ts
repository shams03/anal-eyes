import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory store for rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // 60 requests per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= MAX_REQUESTS) {
    return true;
  }

  record.count++;
  return false;
}

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;
      // Allow public routes
      if (path === "/" || path === "/auth/signin" || path.startsWith("/share/"))
        return true;
      // Require authentication for all other routes
      return !!token;
    },
  },
});

export function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    if (isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests, please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
