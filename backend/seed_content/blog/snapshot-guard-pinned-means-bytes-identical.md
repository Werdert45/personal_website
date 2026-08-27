---
title: '"Pinned" should mean bytes-identical: a snapshot-guard operator'
slug: snapshot-guard-pinned-means-bytes-identical
status: published
published_at: 2026-07-28
category: explanation
tags: ["data-engineering", "orchestration", "airflow", "reproducibility", "data-integrity", "series"]
excerpt: "An operator that treats pinned inputs as a contract: if the bytes changed, the pipeline should refuse to pretend otherwise."
read_time: ""
date: "2026-07-28"
featured: false
is_premium: false
author: Ian Ronk
cover_image: "/blog-figures/snapshot-guard-operator-pinned-means-bytes-identical/f03_1_contract.png"
meta: {"series": "research-pipelines-are-production-systems", "series_part": 4, "series_total": 4}
---

# "Pinned" should mean bytes-identical: a snapshot-guard operator

*Voronoi postcodes, data-engineering case study. Chapter: the snapshot guard*

Every pipeline in this series runs on **pinned inputs**: OSM snapshots fetched once, dated, and never silently refreshed, because the published numbers downstream are only reproducible against those exact bytes. The DAGs therefore *assert* their inputs rather than fetch them: acquisition is a guard, not a download.

## Why this was needed

My first version of that guard was a bash task:

```bash
for f in $SNAPSHOTS; do
  [ -f "$f" ] || { echo "missing pinned snapshot $f"; exit 1; }
done
```

It checks the wrong thing: "the file exists" is a filename contract, while the reproducibility claim is a contract about content. A re-fetched snapshot with the same name (different Overpass day, different bytes, every downstream IoU moved) sails through an existence check. My project's two worst documented incidents were both of this class: provenance carried in filenames and conventions, nothing machine-checking what the artifact actually was.

![Two files with the same name and different bytes: the existence check passes both, the SHA-256 guard blocks the drifted one](/blog-figures/snapshot-guard-operator-pinned-means-bytes-identical/f03_1_contract.png)
*"The file exists" is a filename contract; reproducibility is a contract about content. (Image by author)*

## How it was implemented

### Sidecars carry the hash

Each snapshot already had a `.meta.json` sidecar (source, fetch time, feature count, bbox). The fix adds one field:

```json
{
  "file": "CH_osm_addresses_raw.json",
  "source": "overpass-api.de",
  "feature_count": 671340,
  "sha256": "1779253351f0c41d…"
}
```

A small script writes hashes once (`hash_snapshots.py --write`, refusing to overwrite a *differing* hash without `--force`, because that means the pinned bytes changed and you should know). Honesty note that survives in the sidecar: the fetch timestamp is a file mtime, not the Overpass DB timestamp. Sidecars should record their own limitations.

### The operator

Verification then becomes a reusable task instead of a per-DAG bash snippet:

```python
SnapshotGuardOperator(
    task_id="guard_snapshots",
    retries=0,
    files=[f"{RAW}/{c}_osm_addresses_raw.json" for c in COUNTRIES],
)
```

The `execute()` itself is deliberately boring: stream each file through SHA-256, compare against the sidecar. The design choices that took longer than the hashing:

**Check everything, then fail once.** The operator collects violations across *all* files before raising, and puts the detail in the exception message, not just the log. A guard that dies on the first missing file makes you fix five problems in five runs; and an error message that says "failed, see log" is a worse contract than one that says what failed (task logs get rotated; exception messages land in the UI, in alert payloads, and in tests).

**`retries=0` belongs to the semantics.** Airflow's default retry is right for flaky I/O and wrong for pure asserts: a wrong or missing pinned file cannot fix itself, so a retry just delays the failure by `retry_delay`. Encoding retries=0 at the call site documents that this task is a fact-check, not an operation.

**Distinguish the failure modes.** "Sidecar missing", "file missing but sidecar present", "sidecar has no hash yet", and "hash mismatch" are four different human actions (pin it, restore it, hash it, *stop and think*). The mismatch message spells out the consequence, because the person reading it is about to make a provenance decision:

> HASH MISMATCH: pinned `1779253351f0c41d…` vs on-disk `8a01bc…` (the pinned bytes changed; re-pin deliberately and expect downstream numbers to move)

![Four failure modes mapped to four human actions: pin it, restore it, hash it, stop and think](/blog-figures/snapshot-guard-operator-pinned-means-bytes-identical/f03_4_quadrant.png)
*Four failures, four different human actions. (Image by author)*

### Where it sits in the graph

![The DAG chain: extract, pin, then the guard as a gate before ingestion, QA and parity](/blog-figures/snapshot-guard-operator-pinned-means-bytes-identical/f03_3_dag.png)
*The guard is a gate: retries=0, a fact-check rather than an operation. (Image by author)*

![The real Graph view of the Voronoi DAG: extract, pin and guard_snapshots feeding the sequential DuckDB ingest chain](/blog-figures/snapshot-guard-operator-pinned-means-bytes-identical/airflow_voronoi_graph.png)
*The same chain in the running instance: `SnapshotGuardOperator` between acquisition and the `DuckDBOperator` ingest chain. (Screenshot of the local Airflow 3.3 UI)*

Nothing ingests until the guard passes, so every row the warehouse ever holds descends from bytes-verified inputs; the ingest tasks stamp a `batch_id` (the Airflow `run_id`), which closes the chain: every warehouse row traces back to a run, the run to a set of verified hashes, and the hashes to the pinned snapshots the paper cites.

![The provenance chain from pinned snapshot through sidecar hash, guard, DAG run and warehouse row to the number in the paper](/blog-figures/snapshot-guard-operator-pinned-means-bytes-identical/f03_2_provenance.png)
*Read it right to left: every published number descends from verified bytes. (Image by author)*

## What improved

The operator replaced two bash tasks and net-deleted DAG code, but the deletion is not the argument; the argument is that a *contract you rely on in several DAGs* now has a tested implementation: the guard has six unit tests (pass, byte-drift, missing file, missing sidecar, unpinned hash, multi-violation reporting) that run in CI in under a second, coverage a heredoc in a `bash_command` will never have. My rule of thumb after this: bash tasks are for *running things*; the moment a task's job is to *decide* something (verify, gate, compare), it wants to be an operator with tests.

The same rule produced the DuckDB operator's `fail_on_rows` mode in the previous chapter. Between the two of them, every decision point in the ingestion path (are the inputs the pinned ones? did the load land exactly what was expected? does the SQL parse equal the python parse?) is now a tested, reusable component rather than a convention someone has to remember.
