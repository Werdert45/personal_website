"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Lock, MapPin, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Authenticate via Django API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Invalid username or password");
        return;
      }

      const data = await response.json();

      if (data.token) {
        try {
          // Clear old data first to free space
          localStorage.removeItem("crm_authenticated");
          localStorage.removeItem("crm_user");
          localStorage.removeItem("crm_token");
          localStorage.removeItem("crm_refresh");

          localStorage.setItem("crm_authenticated", "true");
          localStorage.setItem("crm_user", data.user?.username || username);
          localStorage.setItem("crm_token", data.token);
          localStorage.setItem("crm_refresh", data.refresh || "");
        } catch (storageErr) {
          // localStorage full — clear everything and retry
          localStorage.clear();
          localStorage.setItem("crm_authenticated", "true");
          localStorage.setItem("crm_user", data.user?.username || username);
          localStorage.setItem("crm_token", data.token);
          localStorage.setItem("crm_refresh", data.refresh || "");
        }
        router.push("/crm");
      } else {
        setError(data.error || "Invalid username or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="p-4 md:p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Portfolio</span>
        </Link>
      </header>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-border">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
                <MapPin className="w-7 h-7 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">CRM Login</CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage your research papers and visualizations
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">Username</label>
                <Input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="h-11"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">Password</label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-11"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11"
                disabled={loading || !username || !password}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Sign In
                  </span>
                )}
              </Button>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Access restricted to authorized users only
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Ian Ronk CRM - Content Management System
        </p>
      </footer>
    </div>
  );
}
