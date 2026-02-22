import { NextResponse } from "next/server";

// Simple email validation to prevent spam
const BLOCKED_DOMAINS = [
  "tempmail.com",
  "guerrillamail.com",
  "mailinator.com",
  "10minutemail.com",
  "throwaway.email",
];

const COMMON_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "protonmail.com",
  "icloud.com",
];

export async function POST(request) {
  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "Invalid email" },
      { status: 400 }
    );
  }

  const emailLower = email.toLowerCase().trim();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailLower)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 }
    );
  }

  // Check for blocked domains
  const domain = emailLower.split("@")[1];
  if (BLOCKED_DOMAINS.includes(domain)) {
    return NextResponse.json(
      { error: "Temporary email services not allowed" },
      { status: 400 }
    );
  }

  // Basic spam check - if not a common domain, require more validation
  // For now, we'll accept it but you could add more checks
  if (!COMMON_DOMAINS.includes(domain)) {
    // Could add additional verification here if needed
  }

  // In production, you might want to verify the email actually exists
  // For now, we'll just accept valid format emails

  return NextResponse.json({
    success: true,
    email: emailLower,
    message: "Email verified successfully",
  });
}
