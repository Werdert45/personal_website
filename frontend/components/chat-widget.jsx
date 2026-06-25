"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

const KNOWN_CATEGORIES = new Set([
  "bio",
  "skills",
  "stack",
  "work",
  "markets",
  "project",
  "research",
  "education",
  "contact",
  "blog",
]);

export function ChatWidget() {
  const locale = useLocale();
  const t = useTranslations("Chat");
  const initialMessage = { role: "assistant", content: t("initialMessage") };
  const starterPrompts = [t("starter1"), t("starter2"), t("starter3")];
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const isInitial = messages.length === 1;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function send(text) {
    const msg = (text ?? input).trim();
    if (!msg || loading || msg.length < 4) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/django?endpoint=chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || t("noResponse"),
          category: data.category || null,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t("connectionError") },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {!open && (
        <button
          className="chat-toggle"
          onClick={() => setOpen(true)}
          aria-label={t("toggleAria")}
        >
          <span className="chat-pulse" />
          {t("toggle")}
        </button>
      )}

      {open && (
        <div className="chat-panel" role="dialog" aria-label={t("panelAria")}>
          <div className="chat-header">
            <span className="chat-pulse" />
            <span className="chat-header-label">
              § ASK IAN<span className="chat-header-sub"> · AI ASSISTANT</span>
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label={t("closeAria")}
              className="chat-close"
            >
              ✕
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg chat-msg-${msg.role}`}>
                {msg.role === "assistant" && (
                  <span className="chat-avatar" aria-hidden="true">IR</span>
                )}
                <div className="chat-msg-body">
                  <p>{msg.content}</p>
                  {msg.category === "contact" && (
                    <Link
                      href={`/${locale}/contact`}
                      className="btn ghost"
                      style={{ marginTop: 10 }}
                      onClick={() => trackEvent("cta_click", { cta: "contact", location: "chat_widget", source: "chat_widget" })}
                    >
                      <span>{t("contactCta")}</span>
                    </Link>
                  )}
                  {msg.category && KNOWN_CATEGORIES.has(msg.category) && (
                    <span className="chat-category-tag">
                      {msg.category}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-msg chat-msg-assistant">
                <span className="chat-avatar" aria-hidden="true">IR</span>
                <div className="chat-msg-body">
                  <p className="chat-typing">
                    <span>·</span><span>·</span><span>·</span>
                  </p>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {isInitial && (
            <div className="chat-starters">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="chat-starter-chip"
                  onClick={() => send(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input-row">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t("placeholder")}
              disabled={loading}
              aria-label={t("inputAria")}
              className="chat-input"
            />
            <button
              onClick={() => send()}
              disabled={loading || input.trim().length < 4}
              aria-label={t("sendAria")}
              className="chat-send"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
