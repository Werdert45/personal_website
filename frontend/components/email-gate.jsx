"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";

export function EmailGate({ onEmailVerified, isVerified }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [localVerified, setLocalVerified] = useState(isVerified);

  useEffect(() => {
    // Check if email is already verified in localStorage
    const storedEmail = localStorage.getItem("verified_email");
    if (storedEmail && isVerified) {
      setLocalVerified(true);
    }
  }, [isVerified]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: "success", message: "Email verified! You now have access." });
        localStorage.setItem("verified_email", email);
        setLocalVerified(true);
        if (onEmailVerified) onEmailVerified(email);
      } else {
        setStatus({ type: "error", message: data.error || "Verification failed" });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Error verifying email" });
    } finally {
      setLoading(false);
    }
  };

  if (localVerified) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-primary" />
            <CardTitle>Access Required</CardTitle>
          </div>
          <CardDescription>
            Verify your email to view this content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {status && (
              <div className={`flex items-gap-2 text-sm p-3 rounded-md ${
                status.type === "success"
                  ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {status.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                )}
                {status.message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              We respect your privacy. Your email is only used to prevent bot access.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
