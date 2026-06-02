import { NextResponse, type NextRequest } from "next/server";
import { forwardJson } from "../../../lib/serverApi";

// POST /api/auth/register — proxy to Laravel. The existing UX redirects the
// user to /login afterwards, so we deliberately do NOT set an auth cookie here;
// we only relay the success/validation message (never the token).
export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Netinkama užklausa." }, { status: 400 });
  }

  const { status, data } = await forwardJson("/api/register", {
    method: "POST",
    body: payload,
  });

  const body = (data ?? {}) as { user?: unknown; message?: string };

  return NextResponse.json(
    { user: body.user, message: body.message },
    { status: status || 502 }
  );
}
