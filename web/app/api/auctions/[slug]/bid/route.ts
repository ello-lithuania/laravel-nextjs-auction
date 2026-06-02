import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, forwardJson } from "../../../../lib/serverApi";

// POST /api/auctions/[slug]/bid — authenticated proxy. The browser sends no
// token; we read it from the httpOnly cookie and attach it server-side.
export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;

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

  const { status, data } = await forwardJson(
    `/api/auctions/${encodeURIComponent(slug)}/bid`,
    { method: "POST", body: payload, token }
  );

  return NextResponse.json(data, { status });
}
