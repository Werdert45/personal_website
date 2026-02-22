/**
 * API route to proxy Mapbox token from backend.
 * This keeps the token secure by not exposing it in client-side code.
 */

import { NextResponse } from "next/server";

const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://backend:8001";

export async function GET() {
  try {
    const response = await fetch(`${DJANGO_API_URL}/api/auth/mapbox-token/`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({ token: data.token });
    }

    console.error(`[Mapbox Proxy] Failed to fetch token: ${response.status}`);
  } catch (error) {
    console.error("[Mapbox Proxy] Failed to fetch token:", error.message);
  }

  return NextResponse.json(
    { error: "Mapbox token not available" },
    { status: 503 }
  );
}
