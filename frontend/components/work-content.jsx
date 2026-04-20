"use client";

import { trackEvent } from "@/lib/analytics";

const offers = [
  {
    kicker: "§ 03.01 · Diagnostic",
    title: ["Automation ", "Audit", "."],
    timeline: "2 weeks",
    price: "€5,500",
    priceNote: "fixed",
    pitch:
      "A two-week engagement where I map your operational workflows, identify the five highest-ROI automation targets, and deliver a prioritised roadmap with effort estimates and a build plan you can execute with me or with your own team.",
    gets: [
      "End-to-end workflow map of the processes you name",
      "Prioritised opportunity list (five targets, ranked)",
      "Effort estimates and a written build plan per target",
      "One 90-minute walkthrough session with your team",
      "Written recommendations — yours to keep, whether or not we work together again",
    ],
    fit: "You know automation could save serious time, but can't yet tell which processes are worth automating first — and you want an outside read before you commit budget.",
    cta: { label: "Book an audit call", href: "mailto:hi@ianronk.nl?subject=Automation%20Audit", event: "automation_audit" },
    featured: false,
  },
  {
    kicker: "§ 03.02 · Build",
    title: ["Internal ", "System", " Build."],
    timeline: "6–10 weeks",
    price: "€18k–€35k",
    priceNote: "scoped",
    pitch:
      "A fixed-scope engagement to design, build, and hand over one internal tool — typically a CRM, workflow engine, data pipeline, or AI-integrated internal app. Includes deployment, documentation, and a four-week post-handover support window.",
    gets: [
      "Technical design document — reviewed with you before a line of code is written",
      "Built and deployed system, running on your infrastructure",
      "Source code in your repository, with commit history and tests",
      "Written documentation aimed at whoever inherits it next",
      "Four-week support window for bug fixes and small clarifications",
    ],
    fit: "You know the problem you want to solve and need someone to own the build end-to-end — from scope to production — without babysitting the vendor.",
    cta: { label: "Scope a build", href: "mailto:hi@ianronk.nl?subject=Internal%20System%20Build", event: "system_build" },
    featured: true,
    ribbon: "Most common",
  },
  {
    kicker: "§ 03.03 · Embedded",
    title: ["Technical ", "Fractional", "."],
    timeline: "3-month min.",
    price: "€10k / mo",
    priceNote: "· 2 days / wk",
    pitch:
      "Embedded with your team as a fractional senior engineer — designing, building, and shipping alongside your people. Best for technical founders or ops leads who need experienced building capacity without a full-time hire.",
    gets: [
      "Two working days per week, on your team's channels and rituals",
      "Weekly planning & retro with whoever owns the roadmap",
      "Joint ownership of what ships — code review, architecture, mentorship",
      "Three-month minimum so there's time to actually land something",
    ],
    fit: "You need someone who can think at the architecture level and ship at the engineer level — but don't yet need (or can't yet justify) a full-time hire.",
    cta: { label: "Talk fractional", href: "mailto:hi@ianronk.nl?subject=Fractional%20Engagement", event: "fractional" },
    featured: false,
  },
];

const cases = [
  {
    meta: ["CASE · 01", "6 weeks · Build"],
    title: "Deal-screening tool for a mid-market investment team.",
    problem:
      "Eight analysts were spending roughly a day a week each compiling standardised deal memos by hand from five upstream systems. The CRM had a dashboard. Nobody used it.",
    built:
      "A single-screen internal tool that pulls from all five systems, auto-drafts the memo, and lets the analyst edit, annotate, and ship in one place. Opinionated: one verb per screen.",
    outcome: {
      text: "Memo preparation time dropped from ~7 hours to ~45 minutes. Eight analysts, fifty weeks, that's ",
      bold: "≈2,500 hours a year",
      tail: " reclaimed. Tool was handed over with docs and a test suite; team owns it outright.",
    },
  },
  {
    meta: ["CASE · 02", "8 weeks · Build"],
    title: "Compliance intake pipeline for a regulated services firm.",
    problem:
      "Client onboarding required touching four systems, twelve manual checks, and generating a PDF packet. One ops lead owned it; she was the bottleneck for every new client.",
    built:
      "Airflow-backed intake pipeline with a lightweight review UI. The manual checks became automated validations; the PDF became a templated artefact signed off in the tool.",
    outcome: {
      text: "Onboarding time-to-live went from ",
      bold: "11 days to 3",
      tail: ". The ops lead stopped being the bottleneck and went back to doing her actual job. System has run unattended for 14 months.",
    },
  },
  {
    meta: ["CASE · 03", "2 weeks · Audit"],
    title: "Automation audit for a 40-person operations team.",
    problem:
      "The COO suspected there were 20+ hours a week of manual work that could be automated, but couldn't tell which targets were worth the investment.",
    built:
      "Two-week audit: shadowed three ops leads, mapped fourteen processes, ranked by hours-saved-per-euro-spent. Delivered a written roadmap with effort estimates for each.",
    outcome: {
      text: "The team executed the top three targets in-house from my spec, reclaimed ",
      bold: "~18 hours/week",
      tail: ". The remaining two they hired me to build.",
    },
  },
];

const faq = [
  {
    q: "What if I'm not sure which offer fits my situation?",
    a: "Book the 20-minute call. Half the conversations I have end with \u201cactually, you need the audit before the build\u201d or vice versa. That's the point of the call — I'd rather tell you the truth than sell you the bigger package.",
  },
  {
    q: "Do you work with teams outside the Netherlands?",
    a: "Yes — most of my engagements are EU-wide and I've worked with teams in Germany, Belgium, France, Italy and the UK. I prefer one in-person kickoff where possible, but the rest of the work is remote.",
  },
  {
    q: "What happens if scope changes mid-project?",
    a: "It happens — the useful question usually shifts once we're building. I write every engagement as fixed-scope but with a lightweight change-order process: if you want to add or cut something material, I write a short amendment with new price and timeline, you sign it, we continue. No silent creep.",
  },
  {
    q: "Why don't you work with real estate clients?",
    a: "That's my day job at KR&A — they have first call on anything real-estate shaped. Keeping outside engagements in other sectors avoids conflicts of interest and keeps my work here genuinely additive to theirs.",
  },
  {
    q: "Do you sign NDAs?",
    a: "Yes, mutual NDAs are standard before the scoping conversation. Mine is one page; happy to sign yours if it's reasonable.",
  },
];

const processSteps = [
  ["01", "You book a 20-minute call, or send me a note describing what you're trying to solve. Either works."],
  ["02", "If it's a fit, we do a scoping conversation — I learn what you're working with, you learn how I work, and we figure out which offer applies."],
  ["03", "I send a written proposal with scope, timeline, price, and a specific start date. No surprises later."],
  ["04", "Work begins. I ship incrementally, check in weekly, and you always know where we are."],
  ["05", "At the end, you own the code, the docs, and the understanding of how it works. No lock-in, no credential hostage situation."],
  ["06", "I offer a four-week post-handover window for bug fixes and clarifications — so the thing doesn't rot the moment I leave."],
];

export function WorkContent() {
  return (
    <>
      {/* § 01 POSITIONING */}
      <section className="section-pad" style={{ paddingTop: 160 }}>
        <div className="section-label">
          <span className="bar" />
          <span className="num-label">§ 01</span>
          <span>Work with me — 2026 engagements</span>
        </div>
        <h2 className="wm-head">
          I build <i>internal</i> systems and automations for<br />
          operator-heavy teams — software that<br />
          behaves like <span className="y-underline">infrastructure</span>, not a side-<i>project</i>.
        </h2>
        <p className="wm-lede">
          I take on a small number of outside engagements each year, alongside my role as Head of Data at KR&amp;A. The teams I work with best are 20–300 people, have a specific operational process that's outgrown spreadsheets and off-the-shelf tools, and want something measurable they can own and maintain afterwards. I do the scoping, the building, and the handover myself — no account managers, no junior staff, no perpetual retainer.
        </p>
      </section>

      {/* § 02 FIT */}
      <section className="section-pad">
        <div className="section-label">
          <span className="bar" />
          <span className="num-label">§ 02</span>
          <span>Fit — filters, both directions</span>
        </div>
        <div className="wm-fit-grid">
          <div className="wm-fit-col wm-fit-yes">
            <div className="wm-fit-h"><span className="tick">✓</span> This is a fit if…</div>
            <ul>
              <li>You're a 20–300 person company where operations have grown past what spreadsheets and off-the-shelf tools can handle.</li>
              <li>You have a specific internal process — sales, intake, reporting, compliance — that's eating 15+ hours a week of someone's time.</li>
              <li>You've considered hiring an in-house engineer, but the scope is project-shaped, not role-shaped.</li>
              <li>You want something measurable you can hand over and maintain — not a dependency on an ongoing retainer.</li>
            </ul>
          </div>
          <div className="wm-fit-col wm-fit-no">
            <div className="wm-fit-h"><span className="x">✕</span> Not a fit if…</div>
            <ul>
              <li>You're in real estate or PropTech — I don't take engagements in that sector (that's my day job at KR&amp;A).</li>
              <li>You need something shipped in under three weeks.</li>
              <li>You don't have a named internal owner who can make decisions and provide access to systems.</li>
              <li>You're looking for ongoing development capacity, rather than a bounded project.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* § 03 OFFERS */}
      <section className="section-pad">
        <div className="section-label">
          <span className="bar" />
          <span className="num-label">§ 03</span>
          <span>Offers — three productised engagements</span>
        </div>
        <div className="skill-head" style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1.02, letterSpacing: "-0.02em" }}>
            Three ways to <i>work</i> together.
          </h2>
          <p style={{ marginTop: 16, fontSize: 16, color: "var(--ink-2)", maxWidth: "62ch" }}>
            Each one has a fixed scope, a fixed or bounded price, and a written proposal before anyone commits. Pick the one closest to what you need — we'll adjust on the call.
          </p>
        </div>

        <div className="wm-offers">
          {offers.map((o, idx) => (
            <article key={idx} className={`wm-offer${o.featured ? " wm-offer-feat" : ""}`}>
              {o.ribbon && <div className="wm-o-ribbon">{o.ribbon}</div>}
              <header className="wm-o-head">
                <div className="wm-o-kicker">{o.kicker}</div>
                <h3>
                  {o.title[0]}
                  <i>{o.title[1]}</i>
                  {o.title[2]}
                </h3>
                <div className="wm-o-price">
                  <div><span className="k">Timeline</span><b>{o.timeline}</b></div>
                  <div><span className="k">Price</span><b>{o.price} <em>{o.priceNote}</em></b></div>
                </div>
              </header>
              <div className="wm-o-body">
                <p className="wm-o-pitch">{o.pitch}</p>
                <div className="wm-o-cols">
                  <div>
                    <div className="wm-o-lbl">What you get</div>
                    <ul>
                      {o.gets.map((g, i) => <li key={i}>{g}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="wm-o-lbl">Right fit when</div>
                    <p className="wm-o-when">{o.fit}</p>
                  </div>
                </div>
                <a
                  href={o.cta.href}
                  className="wm-o-cta"
                  onClick={() => trackEvent("cta_click", { cta: o.cta.event, location: "work_offer" })}
                >
                  {o.cta.label}
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* MID CTA */}
      <section className="section-pad wm-midcta-wrap">
        <div className="wm-midcta-inner">
          <div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--mute)", marginBottom: 10 }}>§ Next step</div>
            <h3 className="serif" style={{ fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 1.05 }}>
              Not sure which <i>fits</i>? Book a call.
            </h3>
          </div>
          <a
            href="https://cal.com/ianronk/intro"
            target="_blank"
            rel="noopener noreferrer"
            className="wm-bigbtn"
            onClick={() => trackEvent("cta_click", { cta: "book_call", location: "work_mid" })}
          >
            <span>Book a 20-minute call</span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </a>
        </div>
        <p className="wm-midcta-foot">
          20 minutes, no prep needed. I'll ask you what you're trying to solve and tell you honestly whether I'm the right person for it.
        </p>
      </section>

      {/* § 04 PROCESS */}
      <section className="section-pad">
        <div className="section-label">
          <span className="bar" />
          <span className="num-label">§ 04</span>
          <span>Process — how we work together</span>
        </div>
        <div className="skill-head" style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1.02, letterSpacing: "-0.02em" }}>
            From first <i>note</i> to handover.
          </h2>
          <p style={{ marginTop: 16, fontSize: 16, color: "var(--ink-2)", maxWidth: "62ch" }}>
            Six steps, roughly. The point is to take the guesswork out — you should know what's happening next at every stage.
          </p>
        </div>
        <ol className="wm-steps">
          {processSteps.map(([n, t]) => (
            <li key={n}>
              <div className="n">{n}</div>
              <div className="t">{t}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* § 05 PROOF */}
      <section className="section-pad">
        <div className="section-label">
          <span className="bar" />
          <span className="num-label">§ 05</span>
          <span>Proof — things that shipped</span>
        </div>
        <div className="skill-head" style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1.02, letterSpacing: "-0.02em" }}>
            <i>Selected</i> work.
          </h2>
          <p style={{ marginTop: 16, fontSize: 16, color: "var(--ink-2)", maxWidth: "62ch" }}>
            Real engagements, lightly disguised where clients asked. Specific numbers where I have them.
          </p>
        </div>
        <div className="wm-cases">
          {cases.map((c, i) => (
            <article key={i} className="wm-case">
              <div className="wm-case-meta">
                <span>{c.meta[0]}</span>
                <span>{c.meta[1]}</span>
              </div>
              <h4>{c.title}</h4>
              <p className="wm-case-prob"><span className="k">Problem —</span> {c.problem}</p>
              <p className="wm-case-built"><span className="k">Built —</span> {c.built}</p>
              <p className="wm-case-out"><span className="k">Outcome —</span> {c.outcome.text}<b>{c.outcome.bold}</b>{c.outcome.tail}</p>
            </article>
          ))}
        </div>

        <div className="wm-quote">
          <p>&ldquo;Ian shipped the thing he said he'd ship, in the time he said he'd ship it. Rare in my experience hiring technical freelancers.&rdquo;</p>
          <div className="wm-quote-att">— COO, regulated services firm · Case 02</div>
        </div>
      </section>

      {/* § 06 WHO */}
      <section className="section-pad">
        <div className="section-label">
          <span className="bar" />
          <span className="num-label">§ 06</span>
          <span>Who I am — in one paragraph</span>
        </div>
        <div className="wm-who-grid">
          <h3 className="wm-who-h">Briefly.</h3>
          <p className="wm-who-p">
            I'm Ian Ronk. MSc Data Science from Bocconi, with a thesis on agent-based modelling and flood-risk prediction in European real estate. Day job: Head of Data at KR&amp;A, where I build data infrastructure for European real-estate funds and REITs. On the side I take on a small number of outside engagements — mostly internal tools, data pipelines, and AI-integrated systems for operator-heavy teams outside real estate. Based in Amsterdam; happy to travel for kickoffs.
          </p>
        </div>
      </section>

      {/* § 07 FAQ */}
      <section className="section-pad">
        <div className="section-label">
          <span className="bar" />
          <span className="num-label">§ 07</span>
          <span>FAQ — the things people ask on the call</span>
        </div>
        <div className="skill-head" style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1.02, letterSpacing: "-0.02em" }}>
            Before you <i>book</i>.
          </h2>
          <p style={{ marginTop: 16, fontSize: 16, color: "var(--ink-2)", maxWidth: "62ch" }}>
            If one of these answers the question you were going to ask on the call, good. If not, book the call anyway.
          </p>
        </div>
        <div className="wm-faq-list">
          {faq.map((f, i) => (
            <details key={i}>
              <summary>
                <span>{f.q}</span>
                <span className="wm-faq-plus" aria-hidden>+</span>
              </summary>
              <div className="wm-faq-a">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="yellow-band">
        <div className="big"><i>One</i> button.<br />One <i>conversation.</i></div>
        <div className="row">
          <h3>
            <a
              href="https://cal.com/ianronk/intro"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("cta_click", { cta: "book_call", location: "work_final" })}
            >
              Book a 20-minute call →
            </a>
          </h3>
          <div className="links">
            <span>Or email <a href="mailto:hi@ianronk.nl">hi@ianronk.nl</a></span>
          </div>
        </div>
        <p className="wm-band-foot">
          20 minutes, no prep needed. I'll ask you what you're trying to solve and tell you honestly whether I'm the right person for it. If I'm not, I'll often know who is.
        </p>
      </section>
    </>
  );
}
