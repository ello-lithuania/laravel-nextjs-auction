import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, forwardJson } from "../../../lib/serverApi";

// POST /api/user/password — authenticated proxy for changing the password.
// Reads the bearer token from the httpOnly cookie and attaches it server-side.
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value ?? null;
  if (!token) {
    return NextResponse.json(
      { message: "Jūsų sesija nebegalioja. Prisijunkite iš naujo." },
      { status: 401 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Netinkama užklausa." }, { status: 400 });
  }

  const { status, data } = await forwardJson("/api/user/password", {
    method: "POST",
    body: payload,
    token,
  });

  return NextResponse.json(data, { status });
}
