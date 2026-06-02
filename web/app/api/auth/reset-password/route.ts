import { NextResponse, type NextRequest } from "next/server";
import { forwardJson } from "../../../lib/serverApi";

// POST /api/auth/reset-password — same-origin proxy to Laravel. Forwards the
// token + new password; on success Laravel resets the password and revokes the
// user's existing API tokens.
export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Netinkama užklausa." }, { status: 400 });
  }

  const { status, data } = await forwardJson("/api/reset-password", {
    method: "POST",
    body: payload,
  });

  const body = (data ?? {}) as { message?: string };
  return NextResponse.json({ message: body.message }, { status: status || 502 });
}
