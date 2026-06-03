"use client";

import { useState, useRef, useEffect } from "react";

const INITIAL_MESSAGE = {
  role: "assistant",
  content: "Hi. Ask me anything about Ian — his work, research, background, or how to get in touch.",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/django?endpoint=chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "No response received." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Try again shortly." },
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
          aria-label="Ask Ian's AI assistant"
        >
          <span className="chat-pulse" />
          ASK IAN
        </button>
      )}

      {open && (
        <div className="chat-panel" role="dialog" aria-label="Chat with Ian's AI assistant">
          <div className="chat-header">
            <span className="chat-pulse" />
            <span className="chat-header-label">
              § ASK IAN<span className="chat-header-sub"> · AI ASSISTANT</span>
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
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
                <p>{msg.content}</p>
              </div>
            ))}
            {loading && (
              <div className="chat-msg chat-msg-assistant">
                <span className="chat-avatar" aria-hidden="true">IR</span>
                <p className="chat-typing">
                  <span>·</span><span>·</span><span>·</span>
                </p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-row">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about Ian's work or research…"
              disabled={loading}
              aria-label="Your question"
              className="chat-input"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Send"
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
