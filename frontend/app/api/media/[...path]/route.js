import { NextResponse } from "next/server";

const DJANGO_API_URL = process.env.DJANGO_API_URL;

export async function GET(request, { params }) {
  const pathSegments = params.path;
  const mediaPath = Array.isArray(pathSegments) ? pathSegments.join("/") : pathSegments;

  if (!DJANGO_API_URL) {
    return new NextResponse("Media not available", { status: 404 });
  }

  try {
    const response = await fetch(`${DJANGO_API_URL}/media/${mediaPath}`);

    if (!response.ok) {
      return new NextResponse("Not found", { status: 404 });
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Media proxy error:", error);
    return new NextResponse("Failed to fetch media", { status: 500 });
  }
}
