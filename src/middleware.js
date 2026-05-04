import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/cookies";

// ─── Routes that never need a JWT ────────────────────────────────────────────
const PUBLIC_PAGE_PREFIXES = ["/auth/"];

// API routes that are always public (no token required)
const PUBLIC_API_PREFIXES = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/logout",
  "/api/seed",           // dev only — remove in production
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Always pass through Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Always pass through public API endpoints (no auth needed)
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Always pass through remaining /api/* — let the route handler verify auth
  // via the x-user-* headers pattern. We only gate page routes here.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Public page routes (login, signup)
  if (PUBLIC_PAGE_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // ── Everything below here is a protected PAGE route ──────────────────────

  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode WITHOUT verifying signature (signature verified inside API routes).
  // This keeps middleware edge-compatible and avoids crashing if JWT_SECRET
  // is momentarily unavailable during cold start.
  try {
    // Base64-decode the JWT payload (middle segment) — no crypto needed
    const payloadB64 = token.split(".")[1];
    if (!payloadB64) throw new Error("Malformed token");

    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    );

    // Check expiry manually
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      throw new Error("Token expired");
    }

    // Role-based page access
    if (pathname.startsWith("/admin") && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Forward identity headers to API route handlers
    const headers = new Headers(request.headers);
    headers.set("x-user-id",    payload.sub   ?? "");
    headers.set("x-user-email", payload.email ?? "");
    headers.set("x-user-name",  payload.name  ?? "");
    headers.set("x-user-role",  payload.role  ?? "user");

    return NextResponse.next({ request: { headers } });
  } catch {
    // Invalid / expired token → clear cookie and redirect to login
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("reason", "session_expired");
    const response = NextResponse.redirect(loginUrl);
    clearAuthCookie(response);
    return response;
  }
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
