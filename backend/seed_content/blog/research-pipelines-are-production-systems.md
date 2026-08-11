---
title: "Research pipelines are production systems — a series"
slug: research-pipelines-are-production-systems
status: published
published_at: 2026-07-14
category: explanation
tags: ["data-engineering", "orchestration", "airflow", "series"]
excerpt: "Why research data pipelines deserve production discipline: the series opener."
read_time: ""
date: "July 2026"
featured: false
is_premium: false
author: Ian Ronk
cover_image: "/blog-figures/research-pipelines-are-production-systems/f00_1_hero.png"
meta: {"series": "research-pipelines-are-production-systems", "series_part": 1, "series_total": 4}
---

# Research pipelines are production systems — a series

![The thesis stack in 2025 next to what survived in 2026 — the DAG files and the running system marked lost](/blog-figures/research-pipelines-are-production-systems/f00_1_hero.png)
*The results are fine. The system that produced them exists only as evidence to be reconstructed. (Image by author)*

Research code has a short half-life. Mine included. The ingestion stack behind my MSc thesis — a containerised Airflow instance with MinIO and PostGIS on a rented server — worked, produced every panel in the thesis, and then the server was retired and the DAG files went with it. What survived was the callable classes, the SQL, the exported GeoJSONs, and a chapter describing the architecture. The results are fine. The system that produced them exists only as evidence to be reconstructed.

That pattern is not an accident of one thesis. Research computing selects for it: the deliverable is the paper, the deadline is the defence or the submission, and the pipeline is whatever got the numbers out in time. Nobody budgets for the second run. But the second run always comes — a reviewer asks for a robustness check, a co-author wants a different specification, you want to reuse the accessibility routing on a new city — and that is the moment ad hoc pipelines die. Not dramatically. They die as a working directory nobody can reproduce, an environment variable nobody documented, a cache that silently serves stale data, a hyperparameter that lives in a filename suffix instead of the data model.

This series is about treating research pipelines as what they actually are: small production systems, with the same failure modes and the same remedies.

## The trilogy idea

Each project in my portfolio can be written up three ways, and I try to keep the three apart:

1. **The research post** — the question, the identification strategy, the result.
2. **The implementation post** — the model, the algorithm, the code that computes.
3. **The data-engineering post** — how the bytes moved: acquisition, idempotency, schemas, caches, validation gates, and what broke.

![Three lanes — research, implementation, data engineering — with the third highlighted](/blog-figures/research-pipelines-are-production-systems/f00_2_trilogy.png)
*The third leg is where most of the engineering hours went, and where every near-miss lived. (Image by author)*

Most research writing publishes only the first. Some publishes the second. The third almost never gets written, which is odd, because in my projects it is where most of the engineering hours went and where every near-miss lived. This series is the third leg, told across six real projects, orchestrated as Airflow DAGs in one local instance — one truthful DAG per project, pointing at the real scripts with the real dependencies, not a toy rebuilt for the blog.

"Truthful" carries weight there. Almost every DAG is `schedule=None`, because almost every input is a pinned snapshot or an annual statistical release, and a cron re-fetch would silently drift numbers already cited in papers. A scheduler that runs nothing on a schedule sounds like a joke until you have watched a rolling-window upstream quietly rewrite your treatment period.

## The lineup

The series runs as tracks, not numbered installments. First **the setup post**: the Airflow 3.3 stack every pipeline here runs on — the real four-service split over Postgres, one four-line Dockerfile, env-var path/interpreter contracts so the same DAG files parse on host and in container, the hardening deltas for a rented Hetzner box, and the scale-out configuration: CeleryExecutor across multiple Hetzner machines, with the broker, queue-pinning, network-keepalive and monitoring lessons that make it stable.

Then one **data-engineering case study per project**, chaptered, with the custom operators presented inside the case study whose method they belong to:

**Voronoi postcodes** — SQL-first ingestion into a DuckDB warehouse behind a published paper: a custom DuckDB operator and the three bugs an adversarial review found in version one; a snapshot-guard operator that makes "pinned input" mean bytes-identical; and the audit blocker that named the theme — parameters belong in the schema, not in filename suffixes.

**The thesis** (2025 work, written up now) — the Airflow + MinIO + PostGIS stack that fed a gentrification ABM for Amsterdam, Utrecht and Milan, reconstructed honestly from the surviving classes and the thesis chapter, then rebuilt to run on the multi-machine Celery stack with custom operators driving the whole research end-to-end. Alongside it, the research posts: the thesis itself, the hot/cold-spot analysis revisited, and the streetview + simulation work with MLflow discipline in the preparation.

**Italian metro** — seven cities, 17 GB, and an architecture built to make adversarial review cheap: every script writes one JSON per number and the paper compiles from that contract. Told through real failures, from a poisoned routing cache to standard errors that faked 2–7x precision.

**ABM social housing** — an experiment series run properly in MLflow: tracked runs, versioned inputs, promotion gates, and an open door for co-authors.

**GEO-JEPA** (the wildcard lane) — theory-forward representation learning for urban data, plus the experiment where the fix was in the pipeline, not the model: 77% of the "street photos" were squashed panoramas, and reprojecting them flipped a null to p = 0.000. Its MLOps layer — the embedding cache as the real dataset, a frozen evaluation gate any future encoder must beat — closes the series where data engineering crosses into model operations.

Amsterdam quays (726 GB in, 1578 rows out) and the Tokyo ODPT build keep their slots further out.

![The series lineup: one setup post, five case studies, two projects further out](/blog-figures/research-pipelines-are-production-systems/f00_3_lineup.png)
*One setup post, then one data-engineering case study per project. (Image by author)*

## Who this is for

If you write research code and have ever lost an afternoon to a cache you forgot existed, this series is for you. If you hire data engineers to serve researchers, it is also a portfolio: six pipelines, 1.5 GB to 726 GB, each of which produced a thesis chapter, a paper, or a submission, run as systems that can be re-run, audited, and handed over. Each post names the DAGs, operators and guards it describes, with the configuration decisions and the failure modes that motivated them.

Research doesn't need more infrastructure than it can operate. It needs the small set of production habits — idempotency, pinned inputs, schema contracts, honest failure — applied where a wrong number becomes a published wrong number. That is the series.
