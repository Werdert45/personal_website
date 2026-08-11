# Adversarial review — ianronk.nl vs data-engineering & urban-analytics heavyweights

Date: 2026-08-11 · Method: 14-agent ultracode workflow (site snapshot; heavyweight
profiles: Willison/Boykis/Huyen/Vanlightly/Stancil and Boeing/Pereira/Whong/Poorthuis/Rae;
four adversarial lenses, each finding re-verified against the live site; parallel
LLM-discoverability research + technical audit). Scores: recruiter 4.5, peer-DE 7,
urban-academic 3.5, copy/IA ~2 (verifier reported 0.95 as review-accuracy, not site score).

Status notes (post-review, same day):
- Finding 5 (editorial comments visible on live pages) HOTFIXED: publish script now
  strips HTML comments; all 13 pieces re-upserted; cache clears on next deploy.
- Findings verified by spot-check before acceptance: canonical→ianronk.com (dead
  domain) CONFIRMED; research pages 84 visible words pre-hydration CONFIRMED.

## Scorecard

| Lens | Score /10 | One-line verdict |
|---|---|---|
| Recruiter | 4.5 | Heavyweight-grade prose and real systems, undermined by a 404 on the flagship project card, contradictory numbers, and missing artifacts. |
| Peer (data engineering) | 7* | The "open pipelines" claim fails the first click a Vanlightly-reader makes: zero research repos exist behind it, and leaked editorial comments expose the drafting pipeline. |
| Urban academic | 3.5 | Status labels without manuscripts: "preprint (arXiv 2026)" with no arXiv link, no PDF/DOI/BibTeX anywhere, and paper permalinks that are empty pre-hydration. |
| Copy / IA | 0.95* | Generic hero, dead ends on the highest-intent clicks, incoherent section numbering, and decorative chrome outweighing working substance. |

\* Scores were supplied inconsistently by the verifiers: copy-ia's 0.95 explicitly measures review accuracy (7/7 findings confirmed), not site quality — its implied site score is the lowest of the four. Peer-de's 7 was not re-derived by its verifier.

**Overall:** The writing and the underlying research are genuinely strong — the econometrics is heavyweight-grade prose and the About page's status labels are honest — but the site repeatedly makes checkable claims that fail the check: "public repos" with no repos, "linked below" with no links, "I ship production systems" behind a 404. The single worst technical fact is that every canonical URL, sitemap entry, JSON-LD url, and hreflang tag points at ianronk.com, a domain with no DNS records — the live site formally canonicalizes to nothing. Until claims and artifacts match, every precise number on the site ("SE 52", "p = 0.004", "+813") reads as texture rather than receipts.

## How it stacks up

**Vs. the DE heavyweights (Willison, Boykis, Vanlightly, Huyen, Stancil)**
- *No apparatus shown.* Zero `<pre>`/code blocks across all five engineering posts. Willison never publishes a claim without runnable code; Vanlightly shows the benchmark rig. "One JSON per Published Number" never shows a JSON. (peer-de)
- *The reproducibility claim is false.* "The DAGs and the instance are public in the repo" — GitHub API confirms all 14 public repos are unrelated (a high-school project, a Flutter to-do app, forks). Vanlightly's blog got him hired because the claims survived the click. (peer-de, recruiter)
- *No visible archive or cadence.* /en/thoughts serves "Loading…" to any fetcher; no dated list exists. Boykis's homepage IS the archive. (recruiter)

**Vs. the urban-science heavyweights (Boeing, Pereira, Whong, Poorthuis, Rae)**
- *No link battery.* Pereira attaches PDF + Cite + Code + Dataset + DOI to every paper; Poorthuis does it in bracketed suffixes. Here: no PDF, no DOI, no BibTeX, no per-paper repo, no ORCID/Scholar anywhere. (urban-academic, recruiter)
- *No named artifact.* Boeing has OSMnx; Whong has SubwaySheds. The "open source" claim resolves to a bare profile named Werdert45. (recruiter, peer-de)
- *No map renders.* On a geospatial portfolio, both interactive maps serve "Loading map…" and four thesis figures ship as placeholder text. Whong's credibility unit is live map + write-up. (copy-ia, urban-academic)

**Genuine, verified edges**
- Blog-post and About detail pages are fully server-rendered — the metro post's content is complete in raw HTML, which most JS-heavy portfolios fail (technical audit: pass).
- robots.txt allows all AI crawlers; no noindex anywhere; unique descriptive titles per page.
- The About page labels every research entry's status honestly (working paper / preprint / thesis), and the homepage server-renders the metro abstract — the honesty instinct is right, it just isn't backed by artifacts yet.
- The content itself (fixed-effects design, wild-bootstrap inference, ABM validation) is at the level of the benchmark sites; nothing needs to be rewritten, only substantiated.

## Findings

**1. HIGH — Flagship project card 404s; second card has an empty link.** *(all four lenses)*
Homepage ABM card links `/research/gentrification-abm` → HTTP 404 (live slug: `gentrification-abm-european-cities`, which the homepage itself links correctly two sections down). The Eurostat HPI card ships `"link":""`. On a site whose About hero says "I ship production systems," this is self-refuting.
**Fix:** Correct the slug, add a redirect from the short slug, fill or remove the Eurostat link, add a CI link-checker (lychee or a Playwright crawl).

**2. HIGH — The "open pipelines" claim is falsifiable in one click, and it's false.** *(peer-de, recruiter)*
"The DAGs and the instance are public in the repo; every post links to the scripts it describes" — verified false via GitHub API: no metro pipeline, Voronoi, ABM, or scraper repo among Werdert45's 14 public repos; no post links any script.
**Fix:** Publish the italian-metro and voronoi_postcodes repos before the claim goes live, or excise every "public repo" sentence today. Then name and pin one flagship artifact (e.g. the Voronoi postcode-boundaries dataset with a README) — adoption is the credential.

**3. HIGH — Papers exist as labels, not artifacts: no PDF, DOI, arXiv link, or citation block anywhere.** *(urban-academic, recruiter, peer-de)*
"preprint (arXiv 2026)" has no arXiv ID; the metro paper's PDF is "available on request" and exists on the page only as a TODO comment; the only sitewide PDF is the CV. Meanwhile posts assert causal findings (M5 raised prices ~5.6%, wild-bootstrap p = 0.004) no reader can verify, and one estimate was silently revised (+36,400 → +31,900) with the correction visible only in view-source.
**Fix:** Deposit both manuscripts (OSF/SSRN/arXiv or self-hosted versioned PDFs), link them from the existing status labels, add BibTeX per entry, and add a reader-facing "Changes" note for corrected numbers.

**4. HIGH — Posts promise links they don't deliver.** *(peer-de, recruiter, urban-academic, copy-ia)*
Two metro posts state in rendered body text "The working paper and (full) replication code are linked below." — no such links render in either. The Milan post closes with "An open invitation" with nothing to accept; scripts (`ring_d_milano.py`, `scrape_compravendite.py`) are named with zero URLs.
**Fix:** Wire the related-research link resolution before publishing, or delete every promise until the artifact exists. An unkept in-text promise damages the "methodologically honest" voice more than absence would.

**5. HIGH — Editorial scaffolding ships to readers as visible text, including fabrication admissions and a local file path.** *(peer-de, urban-academic)*
HTML comments are escaped and render as literal text: a "SOURCE DISCREPANCY NOTES" block admitting an invented "poisoned routing cache" anecdote was fact-checked out; a known-thesis-error note mid-article; `<!-- fig placeholder -->` strings; and `/Users/ianronk/Projects/blogs/italian-metro/...` shipped to every reader.
**Fix:** Strip HTML comments in the markdown publish step (one line); keep provenance in git. Convert the known-thesis-error note into a formatted erratum on both the post and the paper page. Then audit remaining anecdotes — the fact-check pipeline is actually a credibility asset if its output is clean.

**6. HIGH — The research pillar is invisible pre-hydration.** *(urban-academic, copy-ia, recruiter, peer-de)*
/en/research and /en/thoughts server-render only "Loading…" skeletons; paper permalinks deliver ~80 visible words of chrome with the body in React flight payloads; zero Highwire/Dublin Core citation meta tags. Blog detail pages prove the stack can SSR — the listings and paper pages just don't.
**Fix:** Move listings and paper pages to server components/ISR (data already comes from the Django API — an afternoon), add `citation_*` meta tags for Scholar.

**7. MEDIUM — No figures, no maps, no code where the argument needs them.** *(recruiter, urban-academic, copy-ia, peer-de)*
Four thesis figures exist only as placeholder text; both interactive maps serve "Loading map…" with no static fallback; five engineering posts contain zero code blocks. A model-fit post with no charts and a spatial argument with no map are category failures.
**Fix:** Export figures as static PNGs; give every map a static-image fallback; put each post's central artifact inline (the JSON contract, the DuckDB DDL, 20 lines of DAG).

**8. MEDIUM — Generic hero and inconsistent facts.** *(recruiter, copy-ia)*
"Transforming spatial data into insights" is templated consultant-speak the page's own lede outclasses. 250k vs 300k weekly records; "Head of Data" vs "Data Lead — Engineering Systems & Research"; "Medior Data Scientist" (Benelux jargon) on an international EN site.
**Fix:** Lead with the receipt ("Head of Data at KR&A — I lead a team of 4 running spatial pipelines ingesting 300k records weekly across 13 servers"). Reconcile every number; one title everywhere; "Medior" only in the NL locale.

**9. MEDIUM — IA incoherence and empty slots.** *(copy-ia)*
Nav says "03 Work"/"04 Academics" but URLs are /thoughts and /research; homepage § numbering skips 02 and uses 03 twice; About has two overlapping publication sections; the payload ships an empty testimonial (`"quote":""`).
**Fix:** One name per lane matching the URL; renumber or drop the § scheme; merge publications into one section with [PDF] [code] [preprint] suffixes; delete empty slots.

**10. LOW — No academic identity plumbing, no dated archive, chrome over substance.** *(urban-academic, recruiter, copy-ia)*
No ORCID/Scholar links; no visible dates or reverse-chronological list; coordinate stamps and dual subscribe forms on every page while the one map doesn't load.
**Fix:** Create ORCID, add ORCID/Scholar/GitHub header icons; render /thoughts as a plain dated list; halve the chrome and reinvest in one working interactive artifact.

## LLM & AI-search visibility plan

The audit's headline defect: **every canonical, hreflang, og:url, JSON-LD url, sitemap `<loc>`, and llms.txt link points to ianronk.com — a domain with no DNS records.** The live .nl site tells every engine its authoritative version lives on a dead domain. This can suppress indexing entirely and gates every other tactic.

### Quick wins (this week)

1. **Fix the domain constant.** Set `metadataBase` / the site-URL env var in the Next.js app to `https://ianronk.nl` (single change in `app/[locale]/layout` metadata config). Verify canonical, hreflang, og:url, and JSON-LD `url` all flip. Redeploy. *(Well-evidenced: canonicals to a non-resolving host block indexing.)*
2. **Fix www.** DNS for `www.ianronk.nl` still CNAMEs to `proxy-ssl.webflow.com` and hard-fails TLS. Point it at the current host and 301 to the apex. Also either register/redirect ianronk.com or purge every reference to it.
3. **Dynamic sitemap.** Replace the static 30-URL sitemap (all dead-domain, zero content slugs) with an app-router `app/sitemap.js` that fetches post and paper slugs from the Django API, emits .nl URLs with real `lastmod`, covering all four locales. Fix the `Sitemap:` line in robots.txt.
4. **Fix the 404s and empty links** (Finding 1). Vercel/MERJ data: AI crawlers burn 34%+ of fetches on 404s and follow redirects badly — a small site's crawl allocation can't afford broken flagship links. Add the link-checker to CI.
5. **Add og:image to the homepage** (posts already have the dynamic endpoint; the homepage only has a twitter:image on the dead domain).
6. **Bing Webmaster Tools + IndexNow.** Verify ianronk.nl, submit the new sitemap, add an IndexNow ping to the Django publish flow (`publish_content_api.py` already centralizes publishing — one POST on publish). Bing gates ChatGPT search, Copilot, and part of Perplexity. *(Well-evidenced.)*

### Structural (this month)

1. **SSR/ISR the research index, thoughts index, and paper pages** (Finding 6). This is the strongest-evidenced practice in the entire GEO literature: GPTBot executes zero JavaScript; ClaudeBot downloads JS but never runs it. Right now the research pillar — the positioning's core — is literally blank to every AI engine. Blog posts already SSR, so the pattern exists in the codebase; convert the remaining routes to server components fetching the Django API with ISR revalidation.
2. **Static fallbacks for maps and figures** (Finding 7) — the same no-JS rule applies to the visual evidence.
3. **Upgrade JSON-LD.** Keep Person + BlogPosting (now with .nl URLs); add `ScholarlyArticle` for the two papers; wire `sameAs` on Person to GitHub, LinkedIn, ORCID (create it), and arXiv once deposited. Validated, tied to visible content. *(Well-evidenced for Google AI Overviews; secondary for ChatGPT/Claude/Perplexity, which read raw HTML — another reason SSR comes first.)*
4. **Citation meta tags** (Highwire `citation_title`, `citation_author`, `citation_pdf_url`) on paper pages once PDFs exist — this is what makes Google Scholar indexing possible at all.
5. **Entity consistency.** Pick one canonical name string and one niche line ("data engineer working on geospatial analytics and transit economics") and use them identically on the site, GitHub, LinkedIn, ORCID, and arXiv, with reciprocal links. Rename or bio-annotate the Werdert45 GitHub handle so the entity graph connects. *(Well-evidenced mechanism, unquantified effect size.)*
6. **llms.txt: fix, don't invest.** The existing file's links all point at the dead domain — fix them in the same domain-constant pass, but per the Ahrefs 137K-domain study (97% of llms.txt files got zero fetches), spend no further effort here.

### Compounding (ongoing)

1. **Answer-first extractable posts.** Open each post with a 2–3 sentence direct answer to the title's question; question-phrased H2s; statistics with named sources; quotations. The Princeton GEO paper (peer-reviewed, KDD 2024) found cite-sources/statistics/quotations the three strongest interventions (~30–40% relative visibility lift). The metro posts already have the statistics — they need the provenance links (Finding 3) to convert precision into extractable, citable spans.
2. **Own the long tail.** ~95% of AI citations spread across thousands of small domains; "Milan metro M5 capitalization" is exactly the niche query where the best extractable answer wins regardless of domain authority. The content is already the best answer — it just has to be server-rendered and linked.
3. **Cross-post to LinkedIn and Medium with canonical URLs to ianronk.nl; deposit papers on arXiv.** LinkedIn is ~15% of Google AI Mode citations and rising; ~75% of cited LinkedIn authors post 5+/month; arXiv enters both training corpora and scholarly retrieval. *(Well-evidenced that engines cite those domains; labeled speculative that citation authority transfers back to the personal domain — the reliable win is name/entity association.)*
4. **Verify quarterly.** Ask ChatGPT-with-search, Perplexity, and Claude about your URLs and "Ian Ronk Milan metro"; grep server logs for OAI-SearchBot / Claude-SearchBot / PerplexityBot. "Could not read this page" responses are the cheapest rendering diagnostic available.
5. **Cadence over volume.** One Vanlightly-style deep analysis per quarter, on a visible dated archive, with every claim carrying its artifact — that is the entire remaining gap between this site and the benchmark set.
