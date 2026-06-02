import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, forwardJson } from "../../../lib/serverApi";

// POST /api/auth/logout — revoke the token server-side (best effort) and clear
// the httpOnly cookie regardless of the upstream result.
export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value ?? null;

  if (token) {
    try {
      await forwardJson("/api/logout", { method: "POST", token });
    } catch {
      // Ignore: we still clear the cookie below.
    }
  }

  cookieStore.delete(AUTH_COOKIE);
  return NextResponse.json({ message: "Atsijungta." });
}
