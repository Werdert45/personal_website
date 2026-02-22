import { NextResponse } from "next/server";

const DJANGO_API_URL = process.env.DJANGO_API_URL;

export async function POST(request) {
  const token = request.headers.get("authorization");

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  if (!DJANGO_API_URL) {
    // Return mock response for development
    return NextResponse.json({
      dataset_id: Date.now(),
      name: "Mock Dataset",
      file_format: "geojson",
      feature_count: 100,
      available_fields: ["price", "area", "bedrooms", "year_built"],
      field_types: {
        price: "float",
        area: "float",
        bedrooms: "integer",
        year_built: "integer",
      },
      bounds: [-0.5, 51.2, 0.3, 51.7],
    });
  }

  try {
    // Get the form data from the request
    const formData = await request.formData();

    // Forward the request to Django
    const response = await fetch(`${DJANGO_API_URL}/api/geodata/upload/`, {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    if (response.ok || response.status === 201) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(errorData, { status: response.status });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
