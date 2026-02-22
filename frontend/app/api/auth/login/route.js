import { NextResponse } from "next/server";

const DJANGO_API_URL = process.env.DJANGO_API_URL;

export async function POST(request) {
  try {
    const body = await request.json();

    if (!DJANGO_API_URL) {
      return NextResponse.json(
        { error: "Backend not configured" },
        { status: 503 }
      );
    }

    const response = await fetch(`${DJANGO_API_URL}/api/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to authenticate" },
      { status: 500 }
    );
  }
}
