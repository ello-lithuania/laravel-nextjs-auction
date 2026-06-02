// Server-only helpers for the Backend-For-Frontend (BFF) auth proxy.
// (Only ever imported from Route Handlers, which run on the server.)
//
// The Sanctum bearer token never reaches the browser's JavaScript: it lives in
// an httpOnly cookie that only these Route Handlers (running on the server) can
// read. That removes the XSS token-theft risk of keeping it in localStorage.

// Server-side base URL of the Laravel API. Falls back to the public var (also
// available on the server) and finally the local dev default.
export const API_BASE =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// Name of the httpOnly cookie holding the Sanctum token.
export const AUTH_COOKIE = "auctionhub_token";

const isProd = process.env.NODE_ENV === "production";

/** Options used when writing the auth cookie. */
export function authCookieOptions(maxAgeSeconds = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure: isProd, // sent only over HTTPS in production
    sameSite: "lax" as const, // blocks the cookie on cross-site requests (CSRF mitigation)
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/**
 * Forward a JSON request to the Laravel API and return the parsed body + status.
 * Tolerates non-JSON (e.g. an HTML error page) without throwing.
 */
export async function forwardJson(
  path: string,
  init: { method?: string; body?: unknown; token?: string | null } = {}
): Promise<{ status: number; data: unknown }> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (init.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (init.token) {
    headers["Authorization"] = `Bearer ${init.token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    // Never cache authenticated proxy calls.
    cache: "no-store",
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = { message: `Server returned ${res.status}.` };
  }

  return { status: res.status, data };
}
