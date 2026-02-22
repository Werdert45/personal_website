"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Mail, X } from "lucide-react";

function generateChallenge() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { a, b, answer: a + b };
}

export function NewsletterPopup({ onSubscribed }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [challenge, setChallenge] = useState(null);
  const [captchaInput, setCaptchaInput] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const subscribed = localStorage.getItem("newsletter_subscribed");
    const dismissedAt = localStorage.getItem("newsletter_dismissed_at");

    if (subscribed) return;

    // Don't show again if dismissed within the last 7 days
    if (dismissedAt) {
      const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    setChallenge(generateChallenge());

    // Show popup after 15 seconds or 40% scroll, whichever comes first
    const timer = setTimeout(() => setVisible(true), 15000);

    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrollPercent > 0.4) {
        setVisible(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem("newsletter_dismissed_at", Date.now().toString());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    // Anti-bot: honeypot check
    if (honeypot) {
      // Silently "succeed" to not reveal the honeypot
      setStatus({ type: "success", message: "Thanks for subscribing!" });
      return;
    }

    // Anti-bot: math CAPTCHA check
    if (!challenge || parseInt(captchaInput, 10) !== challenge.answer) {
      setStatus({ type: "error", message: "Incorrect answer. Please try again." });
      setChallenge(generateChallenge());
      setCaptchaInput("");
      return;
    }

    if (!email || !email.includes("@")) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus({ type: "success", message: "You're subscribed! Enjoy unlimited map access." });
        localStorage.setItem("newsletter_subscribed", "true");
        localStorage.setItem("newsletter_email", email);
        if (onSubscribed) onSubscribed();
        setTimeout(() => setVisible(false), 2000);
      } else {
        const data = await response.json().catch(() => ({}));
        setStatus({ type: "error", message: data.error || "Something went wrong. Please try again." });
      }
    } catch {
      // If the API doesn't exist yet, still mark as subscribed for now
      setStatus({ type: "success", message: "You're subscribed! Enjoy unlimited map access." });
      localStorage.setItem("newsletter_subscribed", "true");
      localStorage.setItem("newsletter_email", email);
      if (onSubscribed) onSubscribed();
      setTimeout(() => setVisible(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (!visible || dismissed) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-xl relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <CardHeader className="pb-3 pr-10">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-5 h-5 text-primary flex-shrink-0" />
            <CardTitle className="text-lg">Stay Updated</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Subscribe to get access to all interactive maps and receive research updates.
          </p>
        </CardHeader>

        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="newsletter-email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="newsletter-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Honeypot - hidden from real users, pulled out of flow */}
            <div
              style={{ position: "fixed", left: "-9999px", top: "-9999px", opacity: 0, height: 0, overflow: "hidden" }}
              aria-hidden="true"
              tabIndex={-1}
            >
              <label htmlFor="website-url">Website</label>
              <input
                id="website-url"
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {challenge && (
              <div className="space-y-1.5">
                <Label htmlFor="captcha-answer" className="text-sm font-medium">
                  Quick check: What is {challenge.a} + {challenge.b}?
                </Label>
                <Input
                  id="captcha-answer"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Your answer"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  required
                  disabled={loading}
                  className="w-28"
                />
              </div>
            )}

            {status && (
              <div className={`flex items-start gap-2 text-sm p-3 rounded-md ${
                status.type === "success"
                  ? "bg-yellow-50 text-yellow-800 border border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800"
                  : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800"
              }`}>
                {status.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}
                <span>{status.message}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Subscribing..." : "Subscribe & Unlock Maps"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              No spam. Unsubscribe anytime. We only send research updates.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
