import { NextResponse } from "next/server";

const DJANGO_API_URL = process.env.DJANGO_API_URL;

export async function GET(request) {
  const token = request.headers.get("authorization");

  if (!DJANGO_API_URL) {
    // Return mock response for development
    return NextResponse.json([
      {
        id: 1,
        name: "Amsterdam Properties",
        description: "Property data for Amsterdam",
        original_filename: "amsterdam_properties.geojson",
        file_format: "geojson",
        available_fields: ["price", "area", "bedrooms", "neighborhood"],
        field_types: {
          price: "float",
          area: "float",
          bedrooms: "integer",
          neighborhood: "string",
        },
        feature_count: 45000,
        bounds: [4.7, 52.3, 5.1, 52.45],
        created_at: "2025-01-20T10:00:00Z",
      },
      {
        id: 2,
        name: "Berlin Commercial",
        description: "Commercial real estate in Berlin",
        original_filename: "berlin_commercial.gpkg",
        file_format: "gpkg",
        available_fields: ["rent_sqm", "floor_area", "building_year", "district"],
        field_types: {
          rent_sqm: "float",
          floor_area: "float",
          building_year: "integer",
          district: "string",
        },
        feature_count: 12500,
        bounds: [13.1, 52.35, 13.75, 52.7],
        created_at: "2025-01-18T14:30:00Z",
      },
    ]);
  }

  try {
    const response = await fetch(`${DJANGO_API_URL}/api/geodata/datasets/`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: token }),
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(errorData, { status: response.status });
    }
  } catch (error) {
    console.error("Fetch datasets error:", error);
    return NextResponse.json(
      { error: "Failed to fetch datasets" },
      { status: 500 }
    );
  }
}
