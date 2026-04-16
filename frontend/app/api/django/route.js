import { NextResponse } from "next/server";

// Proxy endpoint to communicate with Django backend
// Set DJANGO_API_URL environment variable when your Django server is ready
// Example: DJANGO_API_URL=https://your-django-api.com
const DJANGO_API_URL = process.env.DJANGO_API_URL;

function buildDjangoUrl(endpoint, extraParams) {
  const qs = extraParams ? extraParams.toString() : "";
  return `${DJANGO_API_URL}/api/${endpoint}/${qs ? `?${qs}` : ""}`;
}

// GET - Fetch data from Django (or return dummy data)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint") || "projects";
  const token = request.headers.get("authorization");

  // Forward extra query params (besides 'endpoint') to Django
  const extraParams = new URLSearchParams();
  for (const [key, value] of searchParams.entries()) {
    if (key !== "endpoint") {
      extraParams.set(key, value);
    }
  }
  const djangoUrl = buildDjangoUrl(endpoint, extraParams);

  // If Django URL is configured, try to fetch from it
  if (DJANGO_API_URL) {
    try {
      const response = await fetch(djangoUrl, {
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
        console.error(`[Django Proxy] GET ${djangoUrl} -> ${response.status}`, errorData);
        return NextResponse.json(errorData, { status: response.status });
      }
    } catch (error) {
      console.error(`[Django Proxy] GET ${djangoUrl} failed:`, error.message);
      // Fall through to mock data
    }
  }

  // Return mock/dummy data for development
  return NextResponse.json(getMockData(endpoint));
}

// POST - Create new item in Django
export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint") || "projects";
  const token = request.headers.get("authorization");
  const body = await request.json();
  const djangoUrl = buildDjangoUrl(endpoint);

  if (DJANGO_API_URL) {
    try {
      const response = await fetch(djangoUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: token }),
        },
        body: JSON.stringify(body),
      });

      if (response.ok || response.status === 201) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[Django Proxy] POST ${djangoUrl} -> ${response.status}`, errorData);
        return NextResponse.json(errorData, { status: response.status });
      }
    } catch (error) {
      console.error(`[Django Proxy] POST ${djangoUrl} failed:`, error.message);
      return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
  }

  // Return success for development with dummy data
  return NextResponse.json({
    id: Date.now(),
    ...body,
    created_at: new Date().toISOString(),
  });
}

// PUT - Update item in Django
export async function PUT(request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint") || "projects";
  const id = searchParams.get("id");
  const token = request.headers.get("authorization");
  const body = await request.json();

  if (DJANGO_API_URL) {
    try {
      const djangoUrl = id
        ? `${DJANGO_API_URL}/api/${endpoint}/${id}/`
        : buildDjangoUrl(endpoint);
      const response = await fetch(djangoUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: token }),
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[Django Proxy] PUT ${djangoUrl} -> ${response.status}`, errorData);
        return NextResponse.json(errorData, { status: response.status });
      }
    } catch (error) {
      console.error(`[Django Proxy] PUT ${djangoUrl} failed:`, error.message);
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
  }

  // Return success for development with dummy data
  return NextResponse.json({
    ...body,
    updated_at: new Date().toISOString(),
  });
}

// DELETE - Remove item from Django
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint") || "projects";
  const id = searchParams.get("id");
  const token = request.headers.get("authorization");

  if (DJANGO_API_URL) {
    try {
      const djangoUrl = id
        ? `${DJANGO_API_URL}/api/${endpoint}/${id}/`
        : buildDjangoUrl(endpoint);
      const response = await fetch(djangoUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: token }),
        },
      });

      if (response.ok || response.status === 204) {
        return NextResponse.json({ success: true });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[Django Proxy] DELETE ${djangoUrl} -> ${response.status}`, errorData);
        return NextResponse.json(errorData, { status: response.status });
      }
    } catch (error) {
      console.error(`[Django Proxy] DELETE ${djangoUrl} failed:`, error.message);
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
  }

  // Return success for development
  return NextResponse.json({ success: true });
}

// Mock data for development without Django
function getMockData(endpoint) {
  const mockData = {
    projects: [
      {
        id: 1,
        title: "Amsterdam Housing Analysis",
        description: "Interactive heatmap of property prices across Amsterdam neighborhoods",
        category: "visualization",
        status: "published",
        map_config: {
          center: [4.9041, 52.3676],
          zoom: 11,
          style: "mapbox://styles/mapbox/light-v11",
        },
        created_at: "2025-01-15",
      },
      {
        id: 2,
        title: "Berlin Commercial Districts",
        description: "Spatial analysis of commercial real estate trends in Berlin",
        category: "analysis",
        status: "draft",
        map_config: {
          center: [13.405, 52.52],
          zoom: 10,
          style: "mapbox://styles/mapbox/light-v11",
        },
        created_at: "2025-01-10",
      },
    ],
    research: [
      {
        id: 1,
        title: "Urban Density and Property Values",
        abstract: "A spatial analysis of the relationship between population density and residential property prices in European capitals.",
        status: "published",
        category: "research",
        tags: ["urban planning", "GIS", "real estate"],
        created_at: "2025-01-12",
      },
      {
        id: 2,
        title: "Transit-Oriented Development in Paris",
        abstract: "Examining the impact of metro accessibility on property values using isochrone analysis.",
        status: "draft",
        category: "case-study",
        tags: ["transit", "accessibility", "France"],
        created_at: "2025-01-08",
      },
    ],
    "research/visualizations": [
      {
        id: 1,
        title: "European Capital Property Price Comparison",
        slug: "european-capital-prices",
        description:
          "Interactive choropleth map comparing residential property prices per square meter across 12 major European capitals with market status indicators.",
        category: "choropleth",
        status: "published",
        technologies: ["PostGIS", "Mapbox GL JS", "Python", "Django"],
        data_points: "12 capital cities",
        region: "Europe",
        date: "2025",
        metrics: [
          { label: "Cities", value: "12" },
          { label: "Avg Price/m²", value: "€5,854" },
          { label: "Top Growth", value: "Lisbon" },
        ],
        preview_image: "",
        is_premium: false,
        created_at: "2025-01-15",
      },
      {
        id: 2,
        title: "Amsterdam Housing Market Heatmap",
        slug: "amsterdam-housing-heatmap",
        description:
          "Density heatmap of property transactions across Amsterdam neighbourhoods, highlighting price hotspots and emerging areas.",
        category: "heatmap",
        status: "published",
        technologies: ["PostGIS", "Mapbox GL JS", "GeoPandas"],
        data_points: "45,000+ transactions",
        region: "Rotterdam, NL",
        date: "2024",
        metrics: [
          { label: "Transactions", value: "45k+" },
          { label: "Avg Price/m²", value: "€6,850" },
          { label: "YoY Change", value: "+8.2%" },
        ],
        preview_image: "",
        is_premium: false,
        created_at: "2024-11-10",
      },
      {
        id: 3,
        title: "Berlin Commercial District Growth — 2018–2024",
        slug: "berlin-commercial-growth",
        description:
          "Time-series animation showing the spatial expansion of commercial real estate activity across Berlin districts over six years.",
        category: "time-series",
        status: "published",
        technologies: ["PostGIS", "D3.js", "Python"],
        data_points: "6 years of data",
        region: "Munich, DE",
        date: "2024",
        metrics: [
          { label: "Years", value: "6" },
          { label: "Districts", value: "12" },
          { label: "Avg Growth", value: "+5.1%" },
        ],
        preview_image: "",
        is_premium: false,
        created_at: "2024-09-05",
      },
    ],
    layers: [
      {
        id: 1,
        name: "Property Boundaries",
        type: "polygon",
        source: "postgis",
        table: "property_parcels",
        visible: true,
      },
      {
        id: 2,
        name: "Transit Stations",
        type: "point",
        source: "postgis",
        table: "transit_stops",
        visible: true,
      },
      {
        id: 3,
        name: "Price Heatmap",
        type: "heatmap",
        source: "postgis",
        table: "property_prices",
        visible: false,
      },
    ],
  };

  return mockData[endpoint] || [];
}
