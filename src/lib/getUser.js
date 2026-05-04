/**
 * Extract the authenticated user from request headers (set by middleware)
 * OR from the Authorization: Bearer <token> header (for API clients).
 * Returns null if no valid identity found.
 */
import { verifyToken } from "@/lib/jwt";

export function getUserFromRequest(request) {
  // 1️⃣  Identity injected by middleware (most common path)
  const id = request.headers.get("x-user-id");
  if (id) {
    return {
      id,
      email: request.headers.get("x-user-email") ?? "",
      name:  request.headers.get("x-user-name")  ?? "",
      role:  request.headers.get("x-user-role")  ?? "user",
    };
  }

  // 2️⃣  Fall back to Authorization header (Postman / external clients)
  const authHeader = request.headers.get("authorization") ?? "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  // 3️⃣  Fall back to cookie (server-side fetches where middleware didn't run)
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieToken = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("auth_token="))
    ?.split("=")[1];

  const token = bearerToken ?? cookieToken;
  if (!token) return null;

  try {
    const payload = verifyToken(token);
    return {
      id:    payload.sub,
      email: payload.email,
      name:  payload.name,
      role:  payload.role,
    };
  } catch {
    return null;
  }
}

export function requireAuth(request) {
  const user = getUserFromRequest(request);
  if (!user) return { user: null, error: "Unauthorized" };
  return { user, error: null };
}

export function requireAdmin(request) {
  const user = getUserFromRequest(request);
  if (!user) return { user: null, error: "Unauthorized" };
  if (user.role !== "admin") return { user: null, error: "Forbidden" };
  return { user, error: null };
}
