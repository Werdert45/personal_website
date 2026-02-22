import { NextResponse } from "next/server";

const DJANGO_API_URL = process.env.DJANGO_API_URL;

export async function POST(request) {
  const token = request.headers.get("authorization");

  if (!DJANGO_API_URL) {
    // Mock response for development without Django
    return NextResponse.json({
      url: "/placeholder-image.png",
      filename: "placeholder.png",
      original_name: "uploaded.png",
      size: 0,
    });
  }

  try {
    const formData = await request.formData();

    const response = await fetch(`${DJANGO_API_URL}/api/research/upload-image/`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: token }),
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      // Rewrite the URL to proxy through the backend
      if (data.url && data.url.startsWith("/media/")) {
        data.url = `/api/media${data.url.slice(6)}`;
      }
      return NextResponse.json(data, { status: 201 });
    } else {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(errorData, { status: response.status });
    }
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
