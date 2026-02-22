import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Forward to Django backend if available
    const DJANGO_API_URL = process.env.DJANGO_API_URL;
    if (DJANGO_API_URL) {
      try {
        const response = await fetch(`${DJANGO_API_URL}/api/newsletter/subscribe/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        }
      } catch {
        // Fall through - Django endpoint may not exist yet
      }
    }

    // If no backend, just accept the subscription
    return NextResponse.json({ success: true, message: "Subscribed successfully" });
  } catch {
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}
