/**
 * API route to proxy Mapbox token from backend.
 * This keeps the token secure by not exposing it in client-side code.
 */

import { NextResponse } from "next/server";

const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://localhost:8000";

// Fallback token for development when backend is unavailable
const FALLBACK_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || "";

export async function GET() {
  try {
    // Try to get token from Django backend
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
  } catch (error) {
    console.error("Failed to fetch Mapbox token from backend:", error.message);
  }

  // Fallback to environment variable if backend is unavailable
  if (FALLBACK_TOKEN) {
    return NextResponse.json({ token: FALLBACK_TOKEN });
  }

  return NextResponse.json(
    { error: "Mapbox token not available" },
    { status: 503 }
  );
}
