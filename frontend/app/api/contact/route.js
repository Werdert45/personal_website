import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || "";
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASS = process.env.EMAIL_PASS || "";
const CONTACT_EMAIL = "ianronk0@gmail.com";

// Escape HTML to prevent XSS in email templates
function escapeHtml(text) {
  if (!text) return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

// Verify reCAPTCHA token
async function verifyCaptcha(token) {
  if (!RECAPTCHA_SECRET_KEY) {
    // Skip verification if no secret key configured (development)
    return true;
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Captcha verification error:", error);
    return false;
  }
}

// Create email transporter
function createTransporter() {
  // Use Gmail SMTP
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS, // Use App Password, not regular password
    },
  });
}

export async function POST(request) {
  const { name, email, phone, subject, message, captchaToken, _hp, _ts } = await request.json();

  // Honeypot check - bots fill hidden fields
  if (_hp) {
    // Silently accept to not alert the bot
    return NextResponse.json({ success: true, message: "Your message has been received" });
  }

  // Timestamp check - reject submissions faster than 3 seconds
  if (_ts && Date.now() - _ts < 3000) {
    return NextResponse.json(
      { error: "Please wait before submitting" },
      { status: 400 }
    );
  }

  // Server-side validation
  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  // Verify captcha if configured
  if (RECAPTCHA_SECRET_KEY) {
    if (!captchaToken) {
      return NextResponse.json(
        { error: "Captcha verification required" },
        { status: 400 }
      );
    }

    const captchaValid = await verifyCaptcha(captchaToken);
    if (!captchaValid) {
      return NextResponse.json(
        { error: "Captcha verification failed. Please try again." },
        { status: 400 }
      );
    }
  }

  // Spam detection - server-side
  const spamKeywords = [
    "bitcoin",
    "viagra",
    "cialis",
    "casino",
    "lottery",
    "money transfer",
    "click here",
  ];

  const combinedText = (message + " " + subject).toLowerCase();

  for (let keyword of spamKeywords) {
    if (combinedText.includes(keyword)) {
      return NextResponse.json(
        { error: "Message flagged as spam" },
        { status: 400 }
      );
    }
  }

  // Check for excessive links
  const linkCount = (combinedText.match(/https?:\/\//g) || []).length;
  if (linkCount > 3) {
    return NextResponse.json(
      { error: "Too many links in message" },
      { status: 400 }
    );
  }

  // Message length check
  if (message.length < 10 || message.length > 5000) {
    return NextResponse.json(
      { error: "Message length must be between 10 and 5000 characters" },
      { status: 400 }
    );
  }

  // Log the submission
  console.log("[Contact] Form submission:", {
    name,
    email,
    subject,
    timestamp: new Date().toISOString(),
  });

  // Send email
  try {
    if (EMAIL_USER && EMAIL_PASS) {
      const transporter = createTransporter();

      // Escape user input to prevent XSS
      const safeName = escapeHtml(name);
      const safeEmail = escapeHtml(email);
      const safePhone = escapeHtml(phone);
      const safeSubject = escapeHtml(subject);
      const safeMessage = escapeHtml(message);

      // Email to site owner
      await transporter.sendMail({
        from: EMAIL_USER,
        to: CONTACT_EMAIL,
        replyTo: email,
        subject: `[Website Contact] ${safeSubject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #eab308; border-bottom: 2px solid #eab308; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Name:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                  <a href="mailto:${safeEmail}" style="color: #eab308;">${safeEmail}</a>
                </td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${safePhone}</td>
              </tr>
              ` : ""}
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${safeSubject}</td>
              </tr>
            </table>

            <h3 style="color: #374151; margin-top: 30px;">Message:</h3>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; white-space: pre-wrap;">
              ${safeMessage}
            </div>

            <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
              Sent from your website contact form at ${new Date().toLocaleString("en-NL", { timeZone: "Europe/Amsterdam" })}
            </p>
          </div>
        `,
        text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ""}
Subject: ${subject}

Message:
${message}

---
Sent from your website contact form at ${new Date().toISOString()}
        `,
      });

      // Auto-reply to sender
      await transporter.sendMail({
        from: EMAIL_USER,
        to: email,
        subject: `Thanks for reaching out - ${safeSubject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #eab308;">Thanks for your message, ${safeName}!</h2>

            <p style="color: #374151; line-height: 1.6;">
              I've received your message and will get back to you as soon as possible,
              typically within 1-2 business days.
            </p>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #6b7280;"><strong>Your message:</strong></p>
              <p style="margin: 10px 0 0 0; color: #374151; white-space: pre-wrap;">${safeMessage}</p>
            </div>

            <p style="color: #374151; line-height: 1.6;">
              Best regards,<br>
              <strong>Ian Ronk</strong><br>
              Head of Data | Real Estate AI & Analytics
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="color: #9ca3af; font-size: 12px;">
              This is an automated response. Please do not reply to this email.
            </p>
          </div>
        `,
      });

      console.log("[Contact] Email sent successfully to", CONTACT_EMAIL);
    } else {
      // Development mode - just log
      console.log("[Contact] Email would be sent to:", CONTACT_EMAIL);
      console.log("[Contact] Email config not set (EMAIL_USER/EMAIL_PASS)");
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been received",
    });
  } catch (error) {
    console.error("[Contact] Email error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
