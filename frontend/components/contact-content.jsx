"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Script from "next/script";
import { trackEvent } from "@/lib/analytics";
import ObfuscatedEmail from "@/components/obfuscated-email";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

export function ContactContent() {
  let t;
  try {
    t = useTranslations("Contact");
  } catch {
    t = (key) => key;
  }
  const locale = useLocale();

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const formLoadTimeRef = useRef(0);

  useEffect(() => {
    formLoadTimeRef.current = Date.now();
  }, []);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [, setCaptchaLoaded] = useState(false);
  const recaptchaRef = useRef(null);

  const resetCaptcha = () => {
    setCaptchaToken(null);
    if (window.grecaptcha && recaptchaRef.current) {
      window.grecaptcha.reset(recaptchaRef.current);
    }
  };

  useEffect(() => {
    window.onCaptchaSuccess = (token) => setCaptchaToken(token);
    window.onCaptchaExpired = () => setCaptchaToken(null);
    return () => {
      delete window.onCaptchaSuccess;
      delete window.onCaptchaExpired;
    };
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const checkSpamPatterns = (text) => {
    const spamKeywords = ["bitcoin", "viagra", "cialis", "casino", "lottery", "money transfer", "click here", "buy now", "limited time"];
    const lowerText = text.toLowerCase();
    for (const keyword of spamKeywords) {
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

    if (honeypot) {
      setStatus({ type: "success", message: t("successMessage") });
      setLoading(false);
      return;
    }
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
        trackEvent("contact_submit", { form: "contact" });
      } else {
        setStatus({ type: "error", message: data.error || t("errorGeneric") });
      }
    } catch {
      setStatus({ type: "error", message: t("errorGeneric") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {RECAPTCHA_SITE_KEY && (
        <Script src="https://www.google.com/recaptcha/api.js" strategy="lazyOnload" onLoad={() => setCaptchaLoaded(true)} />
      )}
      <section className="section-pad" style={{ paddingTop: 160 }}>
        <div className="section-label">
          <span className="bar" />
          <span className="num-label">§ 05</span>
          <span>{t("sectionKicker")}</span>
        </div>

        <div className="contact-wrap">
          <div className="contact-copy">
            <h2>
              {t("letsTalkPrefix")} <i>{t("letsTalkItalic")}</i>.
            </h2>
            <p>
              {t("bio")}
            </p>
            <div className="direct">
              <ObfuscatedEmail prefixIcon="✉" />
              <a href="https://www.linkedin.com/in/ian-ronk-7b054a120" target="_blank" rel="noopener noreferrer">in · /ian-ronk</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">gh · /ianronk</a>
              <span>◉ {t("location")}</span>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="head">
              <span>{t("formTitle")}</span>
              <span>{t("formHeadRef")} · {new Date().getFullYear()}</span>
            </div>

            <div style={{ position: "fixed", left: "-9999px", top: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true" tabIndex={-1}>
              <label htmlFor="website">Website</label>
              <input type="text" id="website" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
            </div>

            <div className="cf-field-row">
              <div className="cf-field">
                <label>{t("nameLabel")}</label>
                <input type="text" placeholder={t("namePlaceholder")} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required disabled={loading} />
              </div>
              <div className="cf-field">
                <label>{t("emailLabel")}</label>
                <input type="email" placeholder={t("emailPlaceholder")} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required disabled={loading} />
              </div>
            </div>

            <div className="cf-field">
              <label>{t("phoneLabel")}</label>
              <input type="tel" placeholder={t("phonePlaceholder")} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={loading} />
            </div>

            <div className="cf-field">
              <label>{t("subjectLabel")}</label>
              <input type="text" placeholder={t("subjectPlaceholder")} value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required disabled={loading} />
            </div>

            <div className="cf-field">
              <label>{t("messageLabel")}</label>
              <textarea rows={5} placeholder={t("messagePlaceholder")} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required disabled={loading} />
            </div>

            {RECAPTCHA_SITE_KEY && (
              <div style={{ marginTop: 16 }}>
                <div className="g-recaptcha" data-sitekey={RECAPTCHA_SITE_KEY} data-callback="onCaptchaSuccess" data-expired-callback="onCaptchaExpired" ref={recaptchaRef} />
              </div>
            )}

            {status && (
              <div style={{
                marginTop: 16,
                padding: "10px 12px",
                border: "1px solid var(--ink)",
                background: status.type === "success" ? "var(--yellow-soft)" : "var(--paper)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: status.type === "success" ? "var(--ink)" : "#8a2a16",
              }}>
                {status.message}
              </div>
            )}

            <button type="submit" className="send-btn" disabled={loading || !formData.name || !formData.email || !formData.message || (!!RECAPTCHA_SITE_KEY && !captchaToken)}>
              <span>{loading ? t("sending") : t("sendButton")}</span>
              <span>→</span>
            </button>

            <p className="privacy">
              <Link href={`/${locale}/privacy-policy`}>{t("privacy")}</Link>
            </p>
          </form>
        </div>
      </section>

      <section className="yellow-band">
        <div className="big">
          {t("bandLine1")}<br />
          <i>{t("bandLine2Italic")}</i><br />
          {t("bandLine3")}
        </div>
        <div className="row">
          <h3>
            <ObfuscatedEmail />
          </h3>
          <div className="links">
            <a href="https://www.linkedin.com/in/ian-ronk-7b054a120" target="_blank" rel="noopener noreferrer">{t("linkLinkedIn")}</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">{t("linkGitHub")}</a>
            <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">{t("linkBookCall")}</a>
          </div>
        </div>
      </section>
    </>
  );
}
