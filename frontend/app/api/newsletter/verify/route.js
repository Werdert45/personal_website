import { NextResponse } from "next/server";

const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://localhost:8000";

export async function POST(request) {
  try {
    const body = await request.json();
    const { access_token, email } = body;

    if (!access_token && !email) {
      return NextResponse.json(
        { error: "Access token or email required", has_access: false },
        { status: 400 }
      );
    }

    // Forward to Django API
    const response = await fetch(`${DJANGO_API_URL}/api/auth/newsletter/verify-access/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ access_token, email }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.ok ? 200 : response.status });
  } catch (error) {
    console.error("Verify access error:", error);
    return NextResponse.json(
      { error: "Failed to verify access", has_access: false },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") || "";
    const token = searchParams.get("token") || "";

    // Forward to Django API
    const response = await fetch(
      `${DJANGO_API_URL}/api/auth/newsletter/check/?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Check subscription error:", error);
    return NextResponse.json(
      { subscribed: false },
      { status: 500 }
    );
  }
}
