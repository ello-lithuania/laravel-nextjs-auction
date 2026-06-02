import { NextResponse, type NextRequest } from "next/server";
import { forwardJson } from "../../../lib/serverApi";

// POST /api/auth/forgot-password — same-origin proxy to Laravel. No auth cookie
// involved; Laravel emails the reset link (and always returns a generic message
// so it can't be used to probe which emails exist).
export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Netinkama užklausa." }, { status: 400 });
  }

  const { status, data } = await forwardJson("/api/forgot-password", {
    method: "POST",
    body: payload,
  });

  const body = (data ?? {}) as { message?: string };
  return NextResponse.json({ message: body.message }, { status: status || 502 });
}
