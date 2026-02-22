import { NextResponse } from "next/server";

// This endpoint proxies authentication to your Django backend
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // Replace with your Django API URL
    const djangoUrl = process.env.DJANGO_API_URL || "http://localhost:8000";

    // Support both email and username login
    const loginPayload = email
      ? { email, password }
      : { username, password };

    const response = await fetch(`${djangoUrl}/api/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginPayload),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        token: data.token,
        user: data.user,
      });
    }

    const errorData = await response.json().catch(() => ({}));
    return NextResponse.json(
      { error: errorData.error || "Invalid credentials" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication service unavailable" },
      { status: 503 }
    );
  }
}
