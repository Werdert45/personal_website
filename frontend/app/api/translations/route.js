import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const LOCALES = ["en", "nl", "it", "de"];
const MESSAGES_DIR = path.join(process.cwd(), "messages");

// GET - Read all translation files
export async function GET() {
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
