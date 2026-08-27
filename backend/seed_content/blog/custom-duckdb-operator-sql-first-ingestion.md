---
title: "A custom DuckDB operator: SQL-first ingestion in Airflow"
slug: custom-duckdb-operator-sql-first-ingestion
status: published
published_at: 2026-07-21
category: explanation
tags: ["data-engineering", "orchestration", "airflow", "duckdb", "sql", "series"]
excerpt: "Building a custom Airflow operator that makes DuckDB the ingestion engine: SQL-first, testable, and cheap."
read_time: ""
date: "2026-07-21"
featured: false
is_premium: false
author: Ian Ronk
cover_image: "/blog-figures/custom-duckdb-operator-sql-first-ingestion/f02_1_before_after.png"
meta: {"series": "research-pipelines-are-production-systems", "series_part": 3, "series_total": 4}
---

# A custom DuckDB operator: SQL-first ingestion in Airflow

*Voronoi postcodes data-engineering case study. Chapter: the DuckDB operator*

This post documents the ingestion operator of my postcode-boundaries pipeline: why it was needed, how it is implemented, and what improved, including the three bugs an adversarial review found in my first version, all of which generalize.

## Why a custom operator was needed

The ingestion stage of the pipeline used to be pandas loading inside python scripts: open a 618 MB JSON, build a DataFrame, apply a parse function, filter. It worked, but the ingestion logic was fused to the experiment code, untestable in isolation, and invisible to anyone who wanted to know *what exactly lands in the data* without reading a 400-line script.

The redesign: raw files flow into a DuckDB warehouse through **SQL scripts**, and a ~130-line custom operator is the only glue.

![Ingestion before (pandas fused into a 400-line script) and after (operator + SQL script + params into a DuckDB warehouse)](/blog-figures/custom-duckdb-operator-sql-first-ingestion/f02_1_before_after.png)
*The redesign in one frame: what lands in the data becomes readable without reading any python. (Image by author)*

## How it was implemented

### Operator + script + params

A task becomes *operator + script + params*:

```python
DuckDBOperator(
    task_id="ingest_ch",
    database=f"{REPO}/data/warehouse/voronoi.duckdb",
    sql="ingest_overpass_country.sql",
    params={"country": "CH",
            "raw_path": f"{RAW}/CH_osm_addresses_raw.json",
            "batch_id": "{{ run_id }}"},
)
```

`template_ext = (".sql",)` means Airflow renders the script through Jinja from the DAG's `template_searchpath`, the same mechanism `BashOperator` uses for `.sh` files. The scripts live in the *project* repo, next to the data they describe, so a clone of the research repo can run them without Airflow (a 40-line `build_warehouse.py` renders the same params). DuckDB's native readers do the heavy lifting:

```sql
DELETE FROM raw_addresses WHERE country = '{{ params.country }}';

INSERT INTO raw_addresses
SELECT '{{ params.country }}', lat, lon, postcode_raw,
       '{{ params.raw_path }}', '{{ params.batch_id }}', current_timestamp
FROM read_json('{{ params.raw_path }}', format = 'array',
               columns = {lat: 'DOUBLE', lon: 'DOUBLE', postcode_raw: 'VARCHAR'});
```

The DELETE-then-INSERT makes re-runs idempotent, so a retry cannot double-count, and the explicit `columns` map is a schema contract: a malformed snapshot fails at ingest rather than three tasks downstream.

### Hardening: three bugs, none of them typos

My first version of the operator was 87 lines and passed its manual test. A review pass whose only job was to refute it found three real defects, and none of them is specific to this operator.

**1. `sql.split(";")` is not a SQL parser.** The obvious way to run a multi-statement script (split on semicolons, execute each piece) shatters the moment a string literal or comment contains `;`. DuckDB ships the fix:

```python
statements = duckdb.extract_statements(self.sql)
for stmt in statements:
    cur = con.execute(stmt.query)
```

`extract_statements` uses the engine's own parser, and each statement object carries its `type`, which the third fix needs.

**2. DELETE and INSERT ran in autocommit.** If the INSERT failed (bad path, malformed JSON, OOM), the DELETE had already committed: the warehouse was left *empty for that country*, visibly corrupt until a retry healed it. The operator now wraps every write-mode script in one transaction:

```python
con.execute("BEGIN TRANSACTION")
try:
    ...   # all statements
    con.execute("COMMIT")
except Exception:
    con.execute("ROLLBACK")
    raise
```

A committed test proves it: a script whose second statement fails leaves the table exactly as it was.

![Two timelines: autocommit leaves the warehouse empty when INSERT fails; one transaction rolls back to the exact prior state](/blog-figures/custom-duckdb-operator-sql-first-ingestion/f02_2_transaction.png)
*The same failure, two very different states left behind. (Image by author)*

**3. The QA gate triggered on the wrong statements.** The operator has a `fail_on_rows=True` mode: point it at a violations-only SQL script and the task fails if the final query returns rows. My first implementation gated on "the last statement that produced a result set". But DuckDB DML *also* produces a result set (a one-row `Count`), so an ingest script under `fail_on_rows` would always fail on its own INSERT count. The contract is now explicit: **the gate applies only when the final statement is a SELECT** (`stmt.type == duckdb.StatementType.SELECT`), and a unit test pins exactly that behavior.

### The QA gate as a data contract

`fail_on_rows` turns a SQL file into a data contract. The warehouse gate is a UNION of violation queries (empty result means clean):

```sql
SELECT 'raw_count_mismatch' AS violation, e.country,
       'expected exactly ' || e.n_raw_expected || ', found ' || coalesce(r.n_raw, 0)
FROM expectations e LEFT JOIN raw_counts r USING (country)
WHERE coalesce(r.n_raw, 0) != e.n_raw_expected
UNION ALL
SELECT 'parse_rate_out_of_band', ...
```

The `expectations` table is loaded from a committed CSV holding each pinned snapshot's **exact** row count and a calibrated parse-survival band. Exact counts beat thresholds: they catch double-ingestion (idempotency becomes *observed*, not assumed) and they cost nothing when the inputs are pinned. The band has a floor *and* a ceiling: a parse rate that jumps from 88% to 99% means a rule silently loosened, which no floor-only check would see.

### One writing process per database file

DuckDB allows **one writing process per database file**: a second `connect()` fails on the file lock, immediately. Under Airflow's LocalExecutor, "five parallel ingest tasks" means five OS processes, so my original fan-out `create >> [five ingests] >> qa` was a lock collision wearing a parallelism costume (reproduced with three subprocess writers: two die with `IOException`). The write chain is now sequential and says why in a comment; read-only consumers (`read_only=True`) parallelize freely once the writers are done. If you want the parallel *look* without the collision, a 1-slot Airflow pool serializes execution behind the scenes. I chose the explicit chain because the constraint deserves to be visible in the graph.

![The fan-out DAG with two ingests dying on IOException next to the explicit sequential write chain with read-only consumers fanning out](/blog-figures/custom-duckdb-operator-sql-first-ingestion/f02_4_lock.png)
*Five parallel writers was a lock collision wearing a parallelism costume. (Image by author)*

## What improved

**Ingestion became readable.** What lands in the data is a SQL file plus a params dict, not 400 lines of python.

**The gate caught a real miscalibration on its first run.** The first QA run failed its own naive 90% floor, because real OSM postcode noise sits at 86–88% in three of my five countries: thresholds come from observed baselines, not intuition.

![Observed parse rates per country against their calibrated floor-and-ceiling bands, with the naive 90 percent floor cutting through the noisy countries](/blog-figures/custom-duckdb-operator-sql-first-ingestion/f02_3_parse_band.png)
*Real numbers from the warehouse: the naive 90% floor fails IT, CH and BE. The calibrated bands hold. (Image by author)*

**Failure got a defined shape.** A malformed snapshot now dies at the ingest boundary instead of three tasks downstream, and a mid-script failure rolls back to the exact prior state rather than leaving a country's rows deleted with nothing in their place.

Although custom operators are cheap (subclass `BaseOperator`, implement `execute`), that cheapness tempts you to write them casually: the three bugs above all shipped in a version that "worked" on a happy-path manual test. What made the operator trustworthy was never the writing of it but the committed contract tests (semicolon-in-literal, rollback-on-failure, DML-never-gates, empty-gate-passes) and a review pass whose job was to break it. The operator is ~130 lines; the tests are ~90. That ratio feels right.

![Stat strip: about 130 operator lines, about 90 test lines, 3 real bugs found by review, 0 of them typos](/blog-figures/custom-duckdb-operator-sql-first-ingestion/f02_5_stats.png)
*What made it trustworthy was never the operator. (Image by author)*
