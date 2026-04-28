"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { trackEvent } from "@/lib/analytics";

const offers = [
  { kicker: "§ 03.01 · Diagnostic", name: ["Automation ", "Audit"], timeline: "2 weeks", price: "€5,500 fixed" },
  { kicker: "§ 03.02 · Build", name: ["Internal System ", "Build"], timeline: "6–10 weeks", price: "€18k–€35k" },
  { kicker: "§ 03.03 · Embedded", name: ["Technical ", "Fractional"], timeline: "3-month min.", price: "€10k / mo" },
];

export function WorkTeaser() {
  const locale = useLocale();

  return (
    <section className="section-pad">
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 07</span>
        <span>Work with me — three ways to work together</span>
      </div>
      <div className="skill-head" style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1.02, letterSpacing: "-0.02em" }}>
          Three productised <i>engagements</i>.
        </h2>
        <p style={{ marginTop: 16, fontSize: 16, color: "var(--ink-2)", maxWidth: "62ch" }}>
          Fixed scopes, written proposals, no ongoing retainers. Pick the one closest to what you need — we'll adjust on the call.
        </p>
      </div>

      <div className="work-teaser">
        {offers.map((o, i) => (
          <Link
            key={i}
            href={`/${locale}/work`}
            onClick={() => trackEvent("cta_click", { cta: "work_offer_teaser", location: "home_work_teaser", source: "home_teaser_offer", offer: o.name.join("") })}
            className="wt-offer"
          >
            <div className="kicker">{o.kicker}</div>
            <h4>{o.name[0]}<i>{o.name[1]}</i>.</h4>
            <div className="meta">
              <span>{o.timeline}</span>
              <span>{o.price}</span>
            </div>
            <span className="arrow" aria-hidden>→</span>
          </Link>
        ))}
      </div>

      <div className="wt-cta-row">
        <Link
          href={`/${locale}/work`}
          className="btn primary"
          onClick={() => trackEvent("cta_click", { cta: "work_with_me", location: "home_work_teaser", source: "home_teaser_all" })}
        >
          <span>See all engagements</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        </Link>
        <a
          href="https://cal.com/ianronk/intro"
          target="_blank"
          rel="noopener noreferrer"
          className="btn ghost"
          onClick={() => trackEvent("cta_click", { cta: "book_call", location: "home_work_teaser", source: "home_teaser_cal" })}
        >
          <span>Book a 20-minute call</span>
        </a>
      </div>
    </section>
  );
}
