import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = 80;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { first_name, last_name, email } =
    (body ?? {}) as Record<string, unknown>;

  const fn = typeof first_name === "string" ? first_name.trim() : "";
  const ln = typeof last_name === "string" ? last_name.trim() : "";
  const em = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!fn || fn.length > MAX_LEN || !ln || ln.length > MAX_LEN) {
    return NextResponse.json(
      { error: "Please enter your first and last name." },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(em) || em.length > 254) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const jar = await cookies();
  jar.set(
    "nok_signup",
    JSON.stringify({ first_name: fn, last_name: ln, email: em }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    },
  );

  return NextResponse.json({ ok: true, redirect: "/start" });
}
