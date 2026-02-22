"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Script from "next/script";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, MapPin, Linkedin, Github, Send, Calendar, Building2, CheckCircle2, AlertCircle, Shield } from "lucide-react";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

export function ContactContent() {
  let t;
  try {
    t = useTranslations("Contact");
  } catch {
    t = (key) => key;
  }

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const formLoadTimeRef = useRef(0);

  useEffect(() => {
    formLoadTimeRef.current = Date.now();
  }, []);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaLoaded, setCaptchaLoaded] = useState(false);
  const recaptchaRef = useRef(null);

  const resetCaptcha = () => {
    setCaptchaToken(null);
    if (window.grecaptcha && recaptchaRef.current) {
      window.grecaptcha.reset(recaptchaRef.current);
    }
  };

  useEffect(() => {
    window.onCaptchaSuccess = (token) => {
      setCaptchaToken(token);
    };
    window.onCaptchaExpired = () => {
      setCaptchaToken(null);
    };
    return () => {
      delete window.onCaptchaSuccess;
      delete window.onCaptchaExpired;
    };
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkSpamPatterns = (text) => {
    const spamKeywords = ["bitcoin", "viagra", "cialis", "casino", "lottery", "money transfer", "click here", "buy now", "limited time"];
    const lowerText = text.toLowerCase();
    for (let keyword of spamKeywords) {
      if (lowerText.includes(keyword)) return true;
    }
    if ((text.match(/https?:\/\//g) || []).length > 2) return true;
    if (/(.)\1{9,}/.test(text)) return true;
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // Honeypot check - bots fill this hidden field
    if (honeypot) {
      setStatus({ type: "success", message: t("successMessage") });
      setLoading(false);
      return;
    }

    // Time-based check - reject if submitted too fast (< 3 seconds)
    if (Date.now() - formLoadTimeRef.current < 3000) {
      setStatus({ type: "error", message: t("errorGeneric") });
      setLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setStatus({ type: "error", message: t("errorEmail") });
      setLoading(false);
      return;
    }

    if (checkSpamPatterns(formData.message + " " + formData.subject)) {
      setStatus({ type: "error", message: t("errorSpam") });
      setLoading(false);
      return;
    }

    if (formData.message.length < 10) {
      setStatus({ type: "error", message: t("errorShort") });
      setLoading(false);
      return;
    }

    if (RECAPTCHA_SITE_KEY && !captchaToken) {
      setStatus({ type: "error", message: t("errorCaptcha") });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, captchaToken, _hp: honeypot, _ts: formLoadTimeRef.current }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: "success", message: t("successMessage") });
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
        resetCaptcha();
      } else {
        setStatus({ type: "error", message: data.error || t("errorGeneric") });
      }
    } catch (error) {
      setStatus({ type: "error", message: t("errorGeneric") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {RECAPTCHA_SITE_KEY && (
        <Script
          src="https://www.google.com/recaptcha/api.js"
          strategy="lazyOnload"
          onLoad={() => setCaptchaLoaded(true)}
        />
      )}
      <section className="pt-20 md:pt-32 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
          {/* Profile Section */}
          <div>
            <Badge variant="secondary" className="mb-4 md:mb-6">
              {t("aboutBadge")}
            </Badge>

            <div className="relative mb-6 md:mb-8">
              <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden bg-muted border border-border shadow-lg mx-auto lg:mx-0">
                <Image
                  src="/profile.jpg"
                  alt={t("name")}
                  width={320}
                  height={320}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>

            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2 md:mb-4">
              {t("name")}
            </h1>
            <p className="text-lg md:text-xl text-primary font-medium mb-4 md:mb-6">
              {t("roleTitle")}
            </p>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 md:mb-8 text-pretty">
              {t("bio")}
            </p>

            <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
              <div className="flex items-center gap-3 text-sm md:text-base text-muted-foreground">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                <span>{t("location")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm md:text-base text-muted-foreground">
                <Building2 className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                <span>{t("company")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm md:text-base text-muted-foreground">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                <span>{t("yearsExperience")}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <a href="mailto:ian@example.com" className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </a>
              <a href="https://www.linkedin.com/in/ian-ronk-7b054a120" target="_blank" rel="noopener noreferrer" className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Linkedin className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Github className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="bg-card border-border">
              <CardContent className="p-4 md:p-6 lg:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                  {t("formTitle")}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
                  {t("formSubtitle")}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  {/* Honeypot field - hidden from users, bots will fill it */}
                  <div style={{ position: "fixed", left: "-9999px", top: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true" tabIndex={-1}>
                    <label htmlFor="website">Website</label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="text-xs md:text-sm font-medium text-foreground mb-2 block">{t("nameLabel")}</label>
                      <Input placeholder={t("namePlaceholder")} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-background text-sm" required disabled={loading} />
                    </div>
                    <div>
                      <label className="text-xs md:text-sm font-medium text-foreground mb-2 block">{t("emailLabel")}</label>
                      <Input type="email" placeholder={t("emailPlaceholder")} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-background text-sm" required disabled={loading} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs md:text-sm font-medium text-foreground mb-2 block">{t("phoneLabel")}</label>
                    <Input type="tel" placeholder={t("phonePlaceholder")} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-background text-sm" disabled={loading} />
                  </div>

                  <div>
                    <label className="text-xs md:text-sm font-medium text-foreground mb-2 block">{t("subjectLabel")}</label>
                    <Input placeholder={t("subjectPlaceholder")} value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="bg-background text-sm" required disabled={loading} />
                  </div>

                  <div>
                    <label className="text-xs md:text-sm font-medium text-foreground mb-2 block">{t("messageLabel")}</label>
                    <Textarea placeholder={t("messagePlaceholder")} rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="bg-background resize-none text-sm" required disabled={loading} />
                  </div>

                  {RECAPTCHA_SITE_KEY && (
                    <div className="flex flex-col items-start gap-2">
                      <label className="text-xs md:text-sm font-medium text-foreground flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        {t("captchaLabel")}
                      </label>
                      <div className="g-recaptcha" data-sitekey={RECAPTCHA_SITE_KEY} data-callback="onCaptchaSuccess" data-expired-callback="onCaptchaExpired" data-theme="dark" ref={recaptchaRef} />
                      {!captchaToken && formData.name && formData.email && formData.message && (
                        <p className="text-xs text-muted-foreground">{t("captchaHint")}</p>
                      )}
                    </div>
                  )}

                  {status && (
                    <div className={`flex items-center gap-2 text-xs md:text-sm p-3 rounded-md ${status.type === "success" ? "bg-yellow-50 text-yellow-800 border border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800" : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800"}`}>
                      {status.type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                      {status.message}
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full gap-2 text-sm md:text-base" disabled={loading || !formData.name || !formData.email || !formData.message || (RECAPTCHA_SITE_KEY && !captchaToken)}>
                    {loading ? t("sending") : t("sendButton")}
                    <Send className="w-4 h-4" />
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">{t("privacy")}</p>
                </form>
              </CardContent>
            </Card>

            <div className="mt-6 md:mt-8 grid grid-cols-2 gap-3 md:gap-4">
              <Card className="bg-muted/50 border-border">
                <CardContent className="p-4 md:p-6 text-center">
                  <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">15+</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{t("europeanMarkets")}</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50 border-border">
                <CardContent className="p-4 md:p-6 text-center">
                  <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">90%+</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{t("modelAccuracy")}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
