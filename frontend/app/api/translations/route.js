import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const LOCALES = ["en", "nl", "it", "de"];
const MESSAGES_DIR = path.join(process.cwd(), "messages");
const DJANGO_API_URL = process.env.DJANGO_API_URL;

// Verify the request carries a valid admin token by forwarding it to Django.
// Mirrors the auth pattern used in app/api/geodata/upload/route.js.
async function requireAuth(request) {
  const token = request.headers.get("authorization");

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  if (!DJANGO_API_URL) {
    // No backend configured (development) — token presence is sufficient.
    return null;
  }

  try {
    const res = await fetch(`${DJANGO_API_URL}/api/auth/me/`, {
      headers: { Authorization: token },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
  } catch (err) {
    console.error("Translations auth check failed:", err);
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  return null;
}

// GET - Read all translation files
export async function GET(request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const translations = {};
    for (const locale of LOCALES) {
      const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
      const content = await fs.readFile(filePath, "utf-8");
      translations[locale] = JSON.parse(content);
    }
    return NextResponse.json(translations);
  } catch (err) {
    console.error("Error reading translations:", err);
    return NextResponse.json({ error: "Failed to read translations" }, { status: 500 });
  }
}

// PUT - Write translation files
export async function PUT(request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    // body is { en: {...}, nl: {...}, it: {...}, de: {...} }
    for (const locale of LOCALES) {
      if (body[locale]) {
        const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
        await fs.writeFile(filePath, JSON.stringify(body[locale], null, 2) + "\n", "utf-8");
      }
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error writing translations:", err);
    return NextResponse.json({ error: "Failed to save translations" }, { status: 500 });
  }
}
