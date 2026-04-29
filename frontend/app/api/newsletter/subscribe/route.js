import { NextResponse } from "next/server";

const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://localhost:8000";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { email, source = "other", locale = "en", hp, ts } = body ?? {};

  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  // Honeypot — bots fill this; humans don't
  if (hp) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
  // Submitted too fast — likely a bot
  if (typeof ts === "number" && Date.now() - ts < 2000) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Forward to Django; the existing NewsletterSubscribeView there runs
  // validate_serious_email and rejects disposable/suspicious addresses.
  try {
    const res = await fetch(`${DJANGO_API_URL}/api/auth/newsletter/subscribe/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, locale, source }),
    });
    if (res.ok) return NextResponse.json({ ok: true });
    if (res.status === 400) {
      // Django rejected the email (disposable / fake / etc.) — silently 200 OK to the client
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false }, { status: 502 });
  } catch (err) {
    console.error("newsletter proxy error:", err);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
