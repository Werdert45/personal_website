"use client";

import { useState, useEffect, createContext, useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, MapPin, Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

// Context for managing newsletter subscription state
const NewsletterContext = createContext(null);

export function useNewsletter() {
  const context = useContext(NewsletterContext);
  if (!context) {
    throw new Error("useNewsletter must be used within a NewsletterProvider");
  }
  return context;
}

export function NewsletterProvider({ children }) {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [hourlyRemaining, setHourlyRemaining] = useState(10);
  const [showGate, setShowGate] = useState(false);

  // Check subscription status on mount
  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    setIsLoading(true);
    try {
      // Check localStorage for existing token
      const storedToken = localStorage.getItem("map_access_token");
      const storedEmail = localStorage.getItem("map_access_email");

      if (storedToken || storedEmail) {
        const response = await fetch(
          `/api/newsletter/verify?token=${encodeURIComponent(storedToken || "")}&email=${encodeURIComponent(storedEmail || "")}`
        );
        const data = await response.json();

        if (data.subscribed) {
          setHasAccess(true);
          setAccessToken(data.access_token);
          setHourlyRemaining(data.hourly_remaining || 10);
          // Update stored token if needed
          if (data.access_token) {
            localStorage.setItem("map_access_token", data.access_token);
          }
        } else {
          // Clear invalid stored data
          localStorage.removeItem("map_access_token");
          localStorage.removeItem("map_access_email");
          setHasAccess(false);
        }
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndRecordAccess = async () => {
    if (!accessToken) return { success: false, error: "No access token" };

    try {
      const response = await fetch("/api/newsletter/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: accessToken }),
      });

      const data = await response.json();

      if (data.has_access) {
        setHourlyRemaining(data.hourly_remaining || 0);
        return { success: true };
      } else {
        if (data.rate_limited) {
          return { success: false, error: data.error, rateLimited: true };
        }
        // Access revoked - need to resubscribe
        setHasAccess(false);
        setAccessToken(null);
        localStorage.removeItem("map_access_token");
        localStorage.removeItem("map_access_email");
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Error verifying access:", error);
      return { success: false, error: "Failed to verify access" };
    }
  };

  const requestAccess = () => {
    setShowGate(true);
  };

  const onSubscribed = (token, email) => {
    setHasAccess(true);
    setAccessToken(token);
    setHourlyRemaining(10);
    localStorage.setItem("map_access_token", token);
    localStorage.setItem("map_access_email", email);
    setShowGate(false);
  };

  return (
    <NewsletterContext.Provider
      value={{
        hasAccess,
        isLoading,
        accessToken,
        hourlyRemaining,
        checkSubscription,
        verifyAndRecordAccess,
        requestAccess,
        showGate,
        setShowGate,
      }}
    >
      {children}
      <NewsletterGateModal
        open={showGate}
        onOpenChange={setShowGate}
        onSubscribed={onSubscribed}
      />
    </NewsletterContext.Provider>
  );
}

function NewsletterGateModal({ open, onOpenChange, onSubscribed }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSubscribed(data.access_token, email.trim().toLowerCase());
        }, 1500);
      } else {
        setError(data.error || "Failed to subscribe");
      }
    } catch (err) {
      setError("Failed to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setEmail("");
      setError("");
      setSuccess(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin className="w-7 h-7 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            {success ? "You're All Set!" : "Unlock Interactive Maps"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {success
              ? "You now have full access to all interactive map visualizations."
              : "Subscribe to our newsletter to access all interactive map visualizations and data insights."}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center py-6">
            <CheckCircle2 className="w-16 h-16 text-yellow-500 mb-4" />
            <p className="text-sm text-muted-foreground">Redirecting to map...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Business emails are preferred. Temporary/disposable emails will be rejected.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !email}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Subscribe & Unlock Maps
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 justify-center">
              <Badge variant="outline" className="text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Free Access
              </Badge>
              <Badge variant="outline" className="text-xs">
                10 views/hour
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              By subscribing, you agree to receive occasional updates about new
              visualizations and research. You can unsubscribe at any time.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Component to wrap map content and show gate if needed
export function MapAccessGate({ children, fallback }) {
  const { hasAccess, isLoading, hourlyRemaining, requestAccess, verifyAndRecordAccess } = useNewsletter();
  const [verified, setVerified] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasAccess && !verified) {
      verifyAndRecordAccess().then((result) => {
        if (result.success) {
          setVerified(true);
        } else if (result.rateLimited) {
          setRateLimited(true);
          setError(result.error);
        } else {
          setError(result.error);
        }
      });
    }
  }, [hasAccess, verified, verifyAndRecordAccess]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (rateLimited) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Hourly Limit Reached</h3>
        <p className="text-muted-foreground max-w-md">
          {error || "You've reached your hourly limit of 10 map views. Please try again later."}
        </p>
      </div>
    );
  }

  if (!hasAccess || !verified) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Lock className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Map Access Required</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            Subscribe to our newsletter to unlock access to all interactive map
            visualizations.
          </p>
          <Button onClick={requestAccess}>
            <Mail className="w-4 h-4 mr-2" />
            Subscribe to View Map
          </Button>
        </div>
      )
    );
  }

  return (
    <>
      {hourlyRemaining <= 3 && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
          <span className="font-medium">Note:</span> You have {hourlyRemaining} map view{hourlyRemaining !== 1 ? "s" : ""} remaining this hour.
        </div>
      )}
      {children}
    </>
  );
}
