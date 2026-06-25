# Website Strategic Realignment — Design Spec

- **Date:** 2026-06-25
- **Status:** Approved (design); ultracode funnel review folded in (2026-06-25). Pending: user review + a few decisions in §10.
- **Source of truth:** `inspiration/Strategic_Plan_Ian_Ronk_v10.pdf` (v10, June 2026)
- **Scope (agreed):** Full information-architecture restructure — copy *and* structure, on existing pages. No brand-new features (those are Future Work).

---

## 1. Context & problem

The strategic plan sets the north star: **a recognised European expert name** — *"Ian Ronk, a geodata engineer who works with any spatial data, with genuine research depth in gentrification and urban dynamics. Bigger than real estate, bigger than any one employer."* Publishing is the engine under the consulting, the agency, and the tenders.

The current site fights this in specific ways:

| Plan says | Current site does | Verdict |
|---|---|---|
| Lead with geodata engineer + urban-dynamics researcher | Hero highlights **"AI/ML Automation … for ops-heavy teams"** | ❌ Biggest misalignment |
| Don't be a generic automation / digital-transformation consultant | Marquee leads with "AI/ML Automation"; "AI Automation" is a co-equal competency; all three proof stats are automation outcomes | ❌ Crowded-pitch identity |
| Urban dynamics & methods = the reputation anchor | Geospatial is 1 of 4 equal competencies | ⚠️ Present, not anchored |
| Publishing is the heaviest lever; research prominent | Research is the **last** homepage section | ⚠️ Buried |
| Real estate = one application, never the frame | Sectors give real estate equal billing; About leads with "real estate funds" | ⚠️ Over-weighted |
| KR&A = a cited credential, not the lens | About/Contact lead with "Head of Data at KR&A" | ⚠️ Lens, not credential |

**Already aligned (good foundation):** geodata engineering is in the hero; the Gentrification ABM is the #1 featured project (the plan's #1 identity asset); EU HPI + LanguageBuddy are featured; Research + Thoughts sections and the "Notes from the field" newsletter exist; Italian (`it`) is already a live locale (matches the Verona market-seeding play).

## 2. Goals / non-goals

**Goals**
1. Reposition the site so it reads as **geodata engineer + urban-dynamics researcher**, not an automation consultant.
2. Make **publishing/research** structurally prominent (the reputation engine).
3. Demote **real estate** to one lane and **KR&A** to a cited credential.
4. Reframe **automation** from a headline service to *proof you ship production AI tools* — kept visible in case studies and previous work.
5. Ensure the site reads as a **funnel** that ends in **Contact**, with the **newsletter** as secondary capture.

**Non-goals (Future Work, §8)**
- Google Scholar / ORCID links and a credentials block.
- A productised data-feed / interactive-viz showcase.
- A publishing-cadence widget.
- A newsletter-prominence redesign / dedicated landing.

## 3. Direction chosen

- **Restructure depth:** Full IA restructure (copy + structure, existing pages).
- **Spine:** Reputation-led — identity first, research/papers as proof-of-expertise, the Four Lanes as "where it applies."
- **Funnel order (final decision):** Papers stay first (§03) above the Lanes (§04) — reputation-led order preserved. The funnel is achieved via **threaded CTAs**, a **new terminal Contact band**, and the **newsletter as secondary capture** — not by moving competences ahead of papers.
- **Automation treatment:** Reframe as proof. Drop "AI Automation" as a headline competency and from hero/marquee lead; keep it as (a) a capability line under the relevant lane and (b) proof of range in case studies / previous work (LanguageBuddy + reframed outcome stats).

## 4. Final homepage structure

```
HOOK  (awareness)
  01 Hero ............ identity + value · primary CTA ("Let's talk")
  02 Marquee ......... competence keywords

CREDIBILITY  (authority → interest)
  03 Selected work & papers ... research/methods, papers FIRST (reputation-led)
  04 Four Lanes ...... "What I do" (competences)   └ CTA: "Discuss a project"
  05 Proof ........... shipped outcomes reframed + LanguageBuddy AI-tool proof

TRUST  (reassurance)
  06 About teaser .... researcher identity · KR&A as credential
  07 Thoughts ........ blog + Notes from the field   └ secondary conversion: subscribe

CONVERT  (action)
  08 Contact band .... NEW terminal section: "Let's connect" → contact
```

### Section detail

**§01 Hero (Option A — Research-forward).** Direction draft (final wording via `ianify`):
> Geodata engineering and **urban-dynamics research** for decisions about place.
> *Sub:* I build production spatial systems and study how cities change — gentrification, accessibility, housing markets — at parcel and postcode resolution. The sectors vary; the question rarely does: where, how much, and what's next.
> *Role:* Head of Data @ KR&A · Amsterdam   *Stack:* Python · PostGIS · Airflow · ML · DeckGL

**§02 Marquee.** `Urban dynamics · Geospatial methods · Spatial forecasting · Data engineering · Production AI tools` ("AI/ML Automation" leaves the front; "Production AI tools" survives at the tail as range).

**§03 Selected work & papers** *(merged; elevated to credibility position).* Combines research-grade projects + the Research API preview into one block:
- **Gentrification ABM** — foregrounded (the #1 identity asset).
- **EU monthly house-price index** — *recast* from "real-estate econometrics" to **large-scale European spatial-data engineering & housing-market analysis** (plan §2.1).
- **Connectivity-score / walkability methodology** — kept as a method card with clear **"developed at KR&A"** attribution; evidence **points to the forthcoming connectivity paper** (release expected later in 2026). Until it's out, the card links to a "paper forthcoming 2026" / preprint stub, not a dead link.
- Product/tool projects (LanguageBuddy) move out to §05 Proof.
- Links through to `/research`.

**§04 Four Lanes** *(replaces the 4-competency Skills Grid).* Plan priority order:
1. **Urban dynamics & geospatial methods** — labeled the anchor.
2. **Real estate & investment** — one lane, not the frame.
3. **Supply-chain & commodity forecasting**.
4. **Spatial data products**.
Each lane: one-liner + relevant stack. The 5 current Sectors **fold in** here as a compact "applied across: urban planning, real estate, climate risk, logistics" line (no standalone Sectors strip). Automation appears only as a capability line where it belongs. CTA at section end: "Discuss a project."

**§05 Proof** *(recast).* Keep genuinely strong shipped outcomes but reframe away from "automation audit / ops-heavy teams." Add **LanguageBuddy as "ships production AI tools"** range-proof. This is where automation competence lives openly, as case-study evidence.

**§06 About teaser.** Lead with researcher+engineer identity; **KR&A as a cited credential**.

**§07 Thoughts + Notes from the field.** Blog + newsletter (owned channel, plan §15). Newsletter = secondary conversion ("not ready to talk? get the next piece").

**§08 Contact band (NEW).** Terminal conversion section so the page ends on "connect," not the blog. Threaded CTAs also appear after §04 and §05; nav keeps persistent "Let's talk."

## 5. Supporting pages

- **About page** — rewrite lede to lead with geodata-engineer + urban-dynamics-researcher; real estate as one application; KR&A cited. Keep facts, journey, portrait. Apply automation→range reframe to the on-page proof block.
- **Contact page** — light touch. Keep role title; remove ops-automation framing from bio; align to new identity. (Receives the funnel from §08.)
- **Research page** — reframe subtitle to lead with urban dynamics & spatial methods; apply EU HPI re-narration consistently.
- **Navigation** — unchanged (Home · About · Thoughts · Research · Contact + "Let's talk").

## 6. Funnel & acquisition *(validated by ultracode review, 2026-06-25 — 18 agents, all 13 recommendations survived adversarial verification)*

Reputation-led IA, papers first (§03), Four Lanes as "where it applies" (§04), page terminates on a Contact band (§08). The funnel is achieved through **threaded, low-pressure CTAs** ("ask, do not pitch") plus the **newsletter as soft secondary capture** — never popups, scarcity, or dark patterns.

### Acquisition channels

| Channel | Typical landing | On-site path | Primary conversion | Secondary conversion |
|---|---|---|---|---|
| **LinkedIn** (primary distribution) | Home `/[locale]` for identity posts; deep `/research/[slug]` or `/thoughts/[slug]` when a post links a paper/method piece | Home spine → §08 Contact band; deep landing: read → climb spine → §08, inline newsletter as soft catch | Contact (nav "Let's talk" + §08 band) | Newsletter; LinkedIn follow loop |
| **Medium** (cross-post) | On-site canonical `/thoughts/[slug]` or `/research/[slug]` — mid-funnel | Content read → inline newsletter ("before it lands on Medium") → related + `/research` → spine → §06 About → §08 | Newsletter (owned channel) | Contact for the minority with a live need (today leaks L1/L2) |
| **Notes from the field** (owned newsletter) | Page linked in the issue (paper/post/project/home) | Issue → deep page → threaded CTAs + §08 convert standing trust | Contact (warmest pool) | Forwarding / list growth |
| **GitHub / open-source** | Home from README; technical visitors → `/research`, ABM / EU HPI write-ups | Home/About → §03 papers + §05 Proof (incl. LanguageBuddy) → §04 Lanes 1+4 → §08 / newsletter | Newsletter + GitHub follow | Contact for scoping a build / co-author role |
| **Academic** (conferences, Scholar, ORCID) | `/research`, paper pages `/research/[slug]` | `/research` → paper (DOI/arXiv) → §06 About (researcher identity, KR&A credential) → Contact band | Contact (collaboration / consortium) | Newsletter / follow between conferences |
| **Tender / consortia** | Home as credibility check → `/research` + named projects (Eurostat HPI, ABM) | Home (named expert) → §03 papers + named projects → §06 About (CV-grade facts) → direct Contact | Contact — direct, high-intent | CV/dossier download (Future Work) |

### On-site funnel (single spine; every channel feeds it)

Awareness → §01 Hero (identity; **primary CTA = "Let's talk" → Contact**, not About). Authority → §03 papers (ABM foregrounded). Interest → §04 Four Lanes (threaded "Discuss a project"). Reassurance → §05 Proof + §06 About (KR&A as credential). Soft capture → §07 Thoughts + inline newsletter ("not ready to talk? get the next piece"). Convert → **§08 Contact band (NEW terminal section)**.

### Confirmed leaks (the spine must close these)

| # | Leak | Severity |
|---|---|---|
| L1 | `/research/[slug]` detail pages dead-end — no path to Contact (top academic/tender/Medium landing) | high |
| L2 | Blog-post end-CTA routes only to /thoughts + /about, never /contact | high |
| L3 | `/research` and `/thoughts` index pages: no contact CTA, no in-body newsletter (footer only) | medium |
| L4 | Homepage terminates on content (§07), no §08 Contact band exists yet | high |
| L5 | Hero **primary** CTA points to /about (key mislabeled `viewProjects`); contact is only the ghost button | medium |
| L6 | "Let's talk" CTA missing from the **mobile** nav | medium |
| L7 | Contact page "Book a call" is a **broken** link to bare `calendly.com` | high |
| L8 | Chat widget answers "how to get in touch" with text only — no actionable link | medium |
| L9 | Sitemap + hreflang cover only en+nl despite 4 live locales — undercuts Verona/IT play | medium |
| L10 | Newsletter inline capture absent from home body, both indexes, /about, /contact | medium |
| L11 | Orphaned components: `research-article.jsx` (dead), `proof-strip.jsx` (well-built, has a WORKING `cal.com/ianronk/intro` link — restore, don't delete) | low |
| L12 | Vercel Analytics always-on while others consent-gated (cookieless; keep as-is, just document) | low |

### Funnel changes (prioritized; in-scope = copy+structure)

**P0 — must ship with the restructure**
- **§08 Contact band + Four Lanes** — create the terminal "Let's connect" Contact band, place it LAST in `page.jsx`; build the Four Lanes component to replace `skills-grid.jsx` and fold in `sectors-strip.jsx`, threaded "Discuss a project" CTA. (Reorder read narrowly: append band + swap lanes in place + fold sectors. Papers stay first — do **not** demote below lanes.)
- **Hero CTA** — make `/contact` the hero **primary** (`btn primary`, keep `cta:'contact'`); demote `/about` to `btn ghost`. Rename the misleading copy key `viewProjects → aboutMe` across all four message files (values unchanged).
- **Mobile nav** — render "Let's talk" inside the open mobile menu (`letsTalk` key already exists in all four locales).
- **Book-a-call** — fix or remove the broken `calendly.com` button (candidate: the working `cal.com/ianronk/intro` from `proof-strip.jsx` — pending confirmation, §10).

**P1**
- **Research detail Contact thread** (L1) — calm "Working on something spatial? Let's talk" → `/contact` after the inline newsletter.
- **Blog-post Contact link** (L2) — add a low-stakes third end-CTA to `/contact`.
- **Index-page tail capture** (L3) — inline newsletter at the end of `/research` and `/thoughts`; a single quiet "Discuss a project" on `/research` only.
- **Home secondary capture** (L10) — inline newsletter in the §07 Thoughts section ("not ready to talk? get the next piece").
- **Chat widget contact affordance** (L8) — when an assistant message `category === 'contact'`, render a real `/contact` link (trigger off backend category, not the English string, so it works in all locales).

**P2**
- **Sitemap + hreflang to de+it** (L9) — `sitemap.ts` `['en','nl'] → ['en','nl','de','it']`; extend per-page hreflang alternates across ~7 routes. (Validate detail pages whose body sources from Django.) **Gated on the locale decision in §10.**
- **Orphaned components** (L11) — **delete** `research-article.jsx` (dead, non-locale links); **restore** `proof-strip.jsx` into the recast §05 Proof and harvest its working `cal.com` link.

**Deferred to Future Work (§8):** R13 Scholar/ORCID + CV/dossier credibility surface (the conversion enabler for academic + tender channels); R12 analytics consent posture (keep Vercel always-on — cookieless and already disclosed — + a post-restructure QA pass that `cta_click`/`contact_submit` reach GA4).

## 7. Cross-cutting concerns

- **Locales (verified 2026-06-25):** `i18n/routing.ts` has **four live locales** (`en/nl/de/it`), each message file ~335 keys, fully translated. (The 2026-06-03 audit had dropped IT/DE; they were re-added — `sitemap.ts` is the lone holdout, still `['en','nl']`, hence leak L9.) So every copy string lives in **four** files — author once in EN (in voice), propagate to NL/DE/IT; **Italian gets human review** (Verona market-seeding), not blind machine translation. ⚠️ If the user instead wants DE dropped (see §10), file count and the L9 fix change accordingly.
- **Source files (targets for implementation):**
  - Copy: `frontend/messages/{en,nl,de,it}.json`
  - Homepage + order: `frontend/app/[locale]/page.jsx` and section components in `frontend/components/`
  - Marquee: `frontend/components/marquee.jsx`
  - New: Four Lanes component (replaces Skills Grid), Contact band component
  - About: `frontend/app/[locale]/about/*` + messages
  - Contact: `frontend/components/contact-content.jsx` + messages
  - Research: `frontend/app/[locale]/research/*` + messages

## 8. Future work (explicitly deferred)

Google Scholar/ORCID + credentials block **and a downloadable CV/master dossier** on `/research` + `/about` (R13 — the conversion enabler for academic + tender channels) · productised data-feed/viz showcase · publishing-cadence widget · newsletter-prominence redesign. These are the plan's "reputation-engine features" — a later slice. Also out of scope: changing the Vercel Analytics consent posture (R12 — keep it always-on; it's cookieless and already disclosed in the cookie policy).

## 9. Verification

- `next build` passes; homepage renders in all 4 locales; no missing-translation keys.
- Visual pass: new section order reads as designed; "AI/ML Automation" no longer headlines anywhere.
- Funnel pass: every homepage section + every deep content/index page offers a path toward Contact or newsletter; page terminates on the Contact band; no dead-ends (L1–L4, L10 closed).
- No broken CTAs: contact-page booking link reaches a real calendar; mobile nav shows "Let's talk"; hero primary CTA = Contact (L5–L7 closed).
- Analytics QA: after the restructure, confirm `cta_click` and `contact_submit` reach GA4 through the consent gate (R12).
- ✅ Ultracode funnel review (§6) completed; all 13 recommendations folded in.

## 10. Open items

**Resolved**
- Locale config verified: 4 live, translated locales (en/nl/de/it); sitemap gap is L9.
- Ultracode funnel review folded into §6.

**Decisions made (2026-06-25)**
1. **Locale scope** → **keep all 4** (en/nl/de/it); extend sitemap + hreflang to all four (L9 fix). Copy changes touch 4 message files.
2. **Book-a-call** → point the contact page at **`cal.com/ianronk/intro`** (the working link from `proof-strip.jsx`).
3. **Connectivity-score card** → **keep, credited to KR&A**, with evidence pointing to the **forthcoming connectivity paper (later 2026)**; placeholder/preprint stub until release.
4. **Conversion verb** → **"Let's talk"** across hero + nav + §08 (final wording via `ianify`).

**Defaults assumed**
- **Proof section**: fold `proof-strip.jsx`'s quote + outcomes into the recast §05 Proof (reuse content, harvest the working `cal.com` link) rather than mounting it verbatim.
- Final copy for every changed string gets the `ianify` voice pass at implementation; IT strings flagged for human review.
