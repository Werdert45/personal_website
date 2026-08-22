---
title: "The thesis pipeline: Airflow, MinIO and PostGIS on one server, and how it runs today"
slug: thesis-pipeline-airflow-minio-postgis-to-celery
status: draft
category: explanation
tags: ["data-engineering", "orchestration", "airflow", "postgis", "thesis", "series"]
excerpt: "The single-server stack that fed my gentrification ABM, reconstructed honestly (the original DAG files are gone), and how the same pipeline runs today on a multi-machine Celery fleet."
read_time: ""
date: "September 2026"
featured: false
is_premium: false
author: Ian Ronk
cover_image: ""
meta: {"series": "research-pipelines-are-production-systems", "track": 2}
---

<!-- DRAFT: HOLD FOR REVIEW. The multi-machine CeleryExecutor section draws on employer infrastructure. It has been genericized per blogs/CLAUDE.md (no employer names, hosts, fleet sizes, timeout values, or business specifics), but this post stays in draft until Ian signs off on the employer-sensitivity pass. -->

# The thesis pipeline: Airflow, MinIO and PostGIS on one server, and how it runs today

*Series: research pipelines are production systems. Track 2, the thesis.*

A framing note first: the research here is last year's work (my 2025 MSc thesis, an agent-based model of gentrification for Amsterdam, Utrecht and Milan), written up now. This post is about the pipeline that fed it: the data collection and processing system that turned municipal spreadsheets, GTFS feeds, news archives and street-level imagery into one spatial panel per city. It ran on a single rented server. It no longer exists in runnable form, and I want to be precise about what that means before describing it.

## The part that did not survive

The stack definition lived on the server. When the server was retired, the DAG files went with it. What survives is the layer underneath (the Python callable classes each task invoked, because those lived in a repository) and the thesis's data chapter, which documents what the pipeline did in enough detail to reconstruct the orchestration on paper. So this post is an honest reconstruction, not archaeology of running code: the stages, tables and joins below are traceable to the surviving classes and the written record; the exact DAG structure is not.

That loss is the founding anecdote of this whole series. The work was real and the outputs were real (every panel in the thesis came out of this system), but a pipeline whose orchestration layer exists only on one machine is one decommissioning away from becoming a description of itself. The rest of the series is, in large part, the consequences I drew from that.

## The original stack, reconstructed

The design was deliberately small. Four services on one rented box:

- **Airflow**, containerised, on a **LocalExecutor**, chosen for limited resources, not preference. The scheduler executed tasks itself; there was no worker fleet.
- **An S3-compatible object store** (a MinIO bucket) holding all raw data as collected: shapefiles, tabular downloads, scraped text, image files.
- **Postgres with PostGIS**, holding the cleaned, structured geographic data: the layer the models and visualisations read from.
- **Nginx** in front, forwarding ports to Airflow and Postgres over HTTPS.

The server sat in the same network group as the bucket, so raw-to-processed transfer was quick and safe. One boundary was drawn by hardware: everything non-GPU ran in the Airflow environment, while the two GPU-heavy stages (sentiment classification and street-image scoring) ran locally on my own machine, with results written back.

The development workflow was the standard research two-step: explore in a Jupyter notebook until the processing was right, then convert it into a Python class callable with input arguments from Airflow. That convention is why anything survived at all. The notebooks and DAGs were scaffolding; the classes were the pipeline.

## What the pipeline actually did

Adding a city followed a fixed sequence, and the sequence is worth spelling out because it is the shape of the whole thesis data layer:

1. **Geometry first.** Municipal neighbourhood boundaries (Buurten for Amsterdam, NIL regions for Milan) uploaded to the bucket and ingested into a `neighborhoods` table with their geometry objects.
2. **Socio-economic tables.** Population, income buckets and housing stock from national or municipal statistics bureaus, keyed to the `neighborhoods` table in a `neighborhood_data` table. The bureaus' multi-dimensional spreadsheets were flattened into a record structure (`neighborhood_name, field_name, value, year`) before joining.
3. **Public transport.** GTFS feeds for the area of interest, stored raw, then reduced to stop counts per neighbourhood via `ST_Within`. Two time points only, a concession to time constraints and to how slowly stop networks change.
4. **The remaining factors.** Street imagery from Mapillary: a K-Means pass sampling 20 spatially distributed images per neighbourhood, in two batches split at 2017, scored by LLaVA 13B against fixed aesthetic categories. Sentiment from NOS (Dutch news, back to 2010), ANSA (Italian news, back to 2014) and Reddit via PRAW, classified with pre-trained BERT-family models, local news weighted by a factor of 10 to offset its lower volume. Schools and universities from OpenStreetMap's Overpass API; greenery as the fraction of neighbourhood area covered by OpenStreetMap green-space tags.
5. **Export and imputation.** The panel extracted from the database, with imputation applied outside PostGIS, deliberately, so the database only ever held real observations. Gaps of one or two time points got a two-year moving average; a few spatial variables (aesthetics, crime) allowed nearest-neighbour spatial imputation via `ST_Distance` and `ST_Touches`. Each variable had its allowed imputations written down; education, sentiment and greenery allowed none.

The genuinely geospatial work was in the joins. Amsterdam's Buurten nest cleanly inside Wijken, so higher-level data came down via `ST_Within`. Milan was harder: Italian postcode areas (CAP) and NIL regions overlap with no containment relationship, so income buckets were assigned by largest intersection area and population by area-weighted apportionment. Sensible estimates, but estimates all the same; that caveat returns at the end of this post.

## What came out

Three panels, one per city, each a table of unique neighbourhood-city-year records:

- **Amsterdam**: 518 Buurten, 346 usable after missing-data filters, series 2010–2022, mean neighbourhood population 2,166.
- **Utrecht**: 33 Subwijken (a deliberately coarser resolution, to test what the models lose), series 2014–2022, mean population 10,954.
- **Milan**: 88 NIL regions, series 2011–2022, mean population 18,007.

The panels also carried their own warnings. Milan's income buckets are defined in absolute euro bands rather than national percentiles, which puts roughly 80% of the city's population in the middle bucket and only 14% in the low one: a definitional artefact that propagates straight into any income-share-based gentrification measure. The pipeline could not fix that; it could only record it.

## The same pipeline on today's stack

The original ran on one machine because that is what a thesis budget buys. The interesting question, writing this up a year later, is what changes when the same pipeline runs on the stack I operate now: a multi-machine CeleryExecutor deployment: one control-plane machine running the scheduler, API server, DAG processor and metadata database, and single-purpose worker machines that consume their own queues. To be plain about the framing: this is how the thesis pipeline runs *today*, not how it ran historically. And because this material draws on production infrastructure I operate professionally, the description below is genericized. The patterns are real, the identifying specifics are not included.

**The move adds a network, not capacity.** CeleryExecutor splits Airflow into producers and consumers: the scheduler serialises task messages into a broker (Redis, in my setup), and workers elsewhere pop them off. That is tolerable for this workload because the Airflow metadata database remains the source of truth: a lost broker message surfaces as a task stuck in "queued", which monitoring catches. The one broker setting that earns real thought is `visibility_timeout`: Celery redelivers any message not acknowledged within the window, Airflow acknowledges late, so the window must exceed your longest task or you get duplicate runs. Set it generously and you have accepted the mirror-image failure instead: a worker that dies holding a message leaves it invisible until the window expires. You are choosing which failure you would rather have; write down the recovery story for the one you chose.

**Queues are isolation, not load balancing.** The textbook use of Celery queues is spreading load across a pool. I use them the opposite way: each collection workload gets its own queue, each queue is consumed by exactly one worker on its own machine, and every task carries an explicit `queue=`. Mapped onto the thesis pipeline, that means the news scraping, the imagery collection and the tabular ingestion would each own a failure domain: a scraper that wedges its machine (leaking browser processes, filling a disk) takes down one source, not the platform. It also makes network identity a placement decision (a workload that must originate from a stable address just lives on that machine), and it keeps capacity arithmetic honest, because you know which workload every worker slot serves.

**Workers stay generic; jobs live in images.** The heavy task code runs as sibling containers pulled fresh from a registry at task start. Shipping a new version of a processing stage means pushing an image, not redeploying Airflow. For a research pipeline, that means the method can change without touching the orchestrator. The price is that workers need the Docker socket, a security trade-off to make consciously.

**The failure mode that only exists in distributed mode.** The bug that taught me the most: a worker starts, logs "ready", then goes silent while its queues back up: container running, ping healthcheck failing, restart loop, no errors anywhere. A Celery worker holds several broker connections (consuming, acknowledging, control), and an overlay network's load balancer was silently dropping TCP connections that sat idle past its timeout. The consuming connection stayed busy and healthy; the acknowledgement connection died without a FIN, and the worker waited forever on a socket that would never answer. The fix is layered because no single layer is trustworthy: route broker traffic past the virtual-IP layer, set application-level TCP keepalives tuned well below the network's idle timeout, add broker health checks and socket timeouts so a dead connection is found in minutes, and enable `worker_cancel_long_running_tasks_on_connection_loss` so a worker that loses the broker fails loudly. None of this exists on one machine, where the broker is a localhost socket that cannot half-die. My thesis-era stack never saw this class of bug, which is not the same as having been correct.

**Monitor at three altitudes.** Single-machine Airflow collapses monitoring into one layer; distributed Airflow needs three. Infrastructure: per-worker healthchecks that ping the *named* worker, because an anonymous ping succeeds if any worker answers. Orchestrator: scheduler and executor metrics, plus a monitoring DAG that checks the expected worker set is present and posts to chat when it is not. And the work itself, the layer research pipelines skip most often: a small exporter publishing progress and backlog per source, because task states say a job ran, not whether it collected enough. A source that silently degrades to a tenth of its volume is green at every Airflow altitude; only the backlog gauge notices. For a thesis pipeline, that last layer is the difference between discovering a gap during collection and discovering it in a reviewer's comment.

## The segue: what one missing dataset cost

One data problem in the original pipeline refused to be an engineering problem. Dutch postcode geometry is freely available; Italian postcode geometry is a commercial product of Poste Italiane. The thesis needed CAP boundaries to map postcode-level data onto Milan's NIL regions, and buying them for every candidate city would have made adding cities expensive, so the pipeline grew a workaround: take the free Eurostat postcode centroids, clip to the union of the NIL regions, and partition the city with a Voronoi diagram, assigning each location to its nearest centroid. It worked well enough for Milan's spatial joins, which were already estimates.

But the constraint shaped the study. With free, reliable postcode boundaries for European cities, the thesis could have included more cities than three: the marginal cost of a city was mostly this dataset. That thread has already been pulled elsewhere in this series: the Voronoi workaround, done properly and generalised to five countries, became a paper and a public dataset of its own.

*Earlier in the series: the data engineering behind the Voronoi postcode paper. The pipeline, the warehouse, and the two custom operators it runs on.*

<!-- SOURCE NOTES / DISCREPANCIES:
- "MinIO" appears in the brief and in the series' setup post (airflow-stack-laptop-to-hetzner-fleet.md); the thesis data chapter (data.tex §4.1) says only "an S3 bucket" without naming the product. Worded here as "S3-compatible object store (a MinIO bucket)".
- data.tex writes "Poste Italia"; the operator's actual name, Poste Italiane, is used in the body. Flagging in case the thesis wording was intentional.
- "roughly 80% middle income": data.tex says "almost 80%"; "14%" low income is exact per data.tex §4.5.4.
- The mapping of thesis stages (news scraping, imagery, ingestion) onto per-source Celery queues is a present-day design statement, not a historical claim, consistent with SERIES_PLAN.md Track 2 framing ("how the thesis pipeline runs on today's stack").
- Genericization pass applied per blogs/CLAUDE.md: fleet size, timeout values, pool/concurrency numbers, monitoring cadences and connection-pool figures present in notes/05_scaling_airflow_celery_DRAFT.md were deliberately omitted.
- FACT-CHECK PASS (2026-08-10): (a) series pointer to the Voronoi DE material changed from "next" to "earlier": per SERIES_PLAN's release calendar the Voronoi case study goes live Aug 18 (July display date), before this post's Sep 02 slot; (b) "stayed off the public internet" softened to "quick and safe": data.tex §4.1 says only "quick and safe data transfer"; (c) Overpass API attribution restricted to schools/universities: data.tex sources greenery from OSM green-space tags (fraction of area), not explicitly Overpass.
- Thesis year: SERIES_PLAN Track 2 framing rule says "last year's (2025) thesis work"; blogs/CLAUDE.md header says "anchored on the 2026 MSc thesis". Post follows the series framing rule (2025), consistent with 00_series_intro.md ("2025 work, written up now").
-->
