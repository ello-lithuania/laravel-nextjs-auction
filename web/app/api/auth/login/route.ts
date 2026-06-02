import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, authCookieOptions, forwardJson } from "../../../lib/serverApi";

// POST /api/auth/login — proxy to Laravel, stash the token in an httpOnly
// cookie, and return only the (non-secret) user object to the browser.
export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Netinkama užklausa." }, { status: 400 });
  }

  const { status, data } = await forwardJson("/api/login", {
    method: "POST",
    body: payload,
  });

  const body = (data ?? {}) as { user?: unknown; token?: unknown; message?: string };

  if (status >= 200 && status < 300 && typeof body.token === "string") {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, body.token, authCookieOptions());
    return NextResponse.json({ user: body.user, message: body.message }, { status });
  }

  // Forward the upstream error (without ever leaking a token).
  return NextResponse.json(
    { message: body.message ?? "Nepavyko prisijungti." },
    { status: status || 502 }
  );
}
