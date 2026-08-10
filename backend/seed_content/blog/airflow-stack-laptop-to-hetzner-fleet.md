---
title: "One stack, three sizes: portfolio Airflow from laptop compose to a fleet of Hetzner machines"
slug: airflow-stack-laptop-to-hetzner-fleet
status: draft
category: explanation
tags: ["data-engineering", "orchestration", "airflow", "hetzner", "infrastructure", "series"]
excerpt: "The same Airflow stack at three scales — local docker-compose, a single server, and a small Hetzner fleet — without forking the architecture."
read_time: ""
date: ""
featured: false
is_premium: false
author: Ian Ronk
cover_image: ""
meta: {"series": "research-pipelines-are-production-systems", "series_part": 2, "series_total": 4}
---

# One stack, three sizes: portfolio Airflow from laptop compose to a fleet of Hetzner machines

*Series: Data orchestration & data pipelines for research — the setup post*

My MSc thesis pipeline ran on a rented server: Airflow with a LocalExecutor, MinIO for object storage, PostGIS for the spatial panel, Nginx in front. It worked, produced every panel in the thesis — and when the server was retired, the DAG files went with it. The lesson I took was not "don't rent servers" — it was that the stack definition has to live in a repo, and the server has to be the boring part.

This post is the current answer: the Airflow 3.3 stack that orchestrates every pipeline in this series, defined in one `docker-compose.yml`, runnable identically on my laptop and on a rented box — and, when a workload needs isolation instead of a bigger box, scaled out with CeleryExecutor across several Hetzner machines. The repo is public — everything below is in it.

## The topology

Airflow 3 is no longer "webserver + scheduler." The compose file runs the real service split:

![fig: The Airflow 3 service split — apiserver, scheduler, dag-processor, triggerer and one-shot init over Postgres 16](TODO-upload)
*The real four-service split over Postgres. (Image by author)*

Three of these choices need defending.

**Two executors, one definition.** On the laptop this runs LocalExecutor: one machine, a dozen research DAGs, no burst concurrency requirement, so the scheduler container executes tasks itself and carries the data mounts. The scaled-out configuration — CeleryExecutor across several Hetzner machines — gets its own section below, because it is the same compose definition with the executor swapped and workers added, not a different system. Start with the executor your workload actually needs; keep the definition so the upgrade is a diff, not a rewrite.

![fig: One compose definition deployed three ways — laptop, one hardened Hetzner box, a Celery fleet](TODO-upload)
*Same compose definition, three deployments. (Image by author)*

**The image is `apache/airflow:3.3.0` plus one pip layer.** The Dockerfile is four lines: base image, copy `requirements-docker.txt`, install. Every dependency a DAG imports at parse time must be in that file — this is a contract, not a convenience. I learned this one the embarrassing way: the DuckDB operator worked in my local venv for a day while the Docker dag-processor was failing the same DAG with `ModuleNotFoundError`, because the package existed in one environment and not the other. A committed DagBag test now runs against both.

**Paths and interpreters are environment contracts.** DAG files never hardcode where the data lives or which python runs a task:

```python
BLOGS = os.getenv("BLOGS_ROOT", "/Users/ianronk/Projects/blogs")
PY = os.getenv("PORTFOLIO_PY", "/opt/miniconda3/bin/python3")
```

Compose sets `BLOGS_ROOT=/opt/blogs` (a bind mount) and `PORTFOLIO_PY=python` (the image interpreter). The same DAG file parses on the host and in the container without edits.

![fig: The same DAG file resolving BLOGS_ROOT and PORTFOLIO_PY differently on the host and in the container](TODO-upload)
*No hardcoded paths — the environment supplies the contract. (Image by author)*

External drives are opt-in overlay files (`compose.insar.yaml`) with a guard that refuses to start if the drive isn't mounted — an unconditional bind would let Docker create an empty directory and shadow the real mount point.

## Laptop mode

```bash
./run.sh          # compose up -d --build → http://localhost:8080
./run.sh --down
```

Local-dev auth is deliberately loose: `SimpleAuthManager` with `SIMPLE_AUTH_MANAGER_ALL_ADMINS='true'`, a placeholder JWT secret, and `airflow:airflow` Postgres credentials. The compose file says, in a comment, *do not copy this block to anything reachable from a network* — and the rest of this post is what changes when you do reach a network.

## The same stack on a Hetzner VPS

A CX32 (4 vCPU / 8 GB) is comfortable for this stack; the pipelines that need serious memory (InSAR, model training) stay host-only by design, so the server runs the orchestration and the pure-Python stages.

```bash
# 1. Provision (hcloud CLI, or the console)
hcloud server create --name airflow-1 --type cx32 \
  --image ubuntu-24.04 --ssh-key <your-key>

# 2. On the box: Docker + compose plugin
apt-get update && apt-get install -y docker.io docker-compose-v2 git
adduser airflow && usermod -aG docker airflow

# 3. The stack
su - airflow
git clone <this-repo> orchestration && cd orchestration
mkdir -p docker-logs && docker compose up -d --build
```

That boots the identical topology. What follows is the hardening list, and each item is a diff against the local defaults:

**1. Real secrets.** Replace the three placeholders via a `.env` file next to the compose file (compose reads it automatically):

```
POSTGRES_PASSWORD=<generated>
AIRFLOW__API_AUTH__JWT_SECRET=<openssl rand -hex 32>
AIRFLOW_UID=1000
```

and switch the auth manager off all-admins: drop `SIMPLE_AUTH_MANAGER_ALL_ADMINS` and set `AIRFLOW__CORE__SIMPLE_AUTH_MANAGER_USERS: 'admin:admin'` with a generated password — or front it with FabAuthManager if you need real users.

**2. Don't expose 8080.** The UI has no business on the public internet. Either bind it to loopback (`"127.0.0.1:8080:8080"`) and reach it over an SSH tunnel (`ssh -L 8080:localhost:8080 airflow@<box>`), or put the box on a Tailscale tailnet and bind to the tailnet IP. A `ufw` default-deny with 22 only (or nothing but the tailnet) finishes the job. My thesis-era stack put Nginx with TLS in front instead; that's the right call only if other people need the UI.

**3. Data comes from the repo contract, not the laptop.** The bind mount `..` → `/opt/blogs` assumes the project tree sits next to the compose file. On the server that means cloning the project repos and fetching the pinned inputs (each pipeline's snapshots are hash-verified by a guard task before anything runs — a re-fetch that doesn't match the pinned SHA-256 fails loudly rather than silently drifting results).

**4. Survive reboots and disk pressure.** The services already carry `restart: always`, so `systemctl enable docker` is the only reboot insurance needed. Add a nightly `pg_dump` of the metadata DB and a log-rotation cap (`docker-logs/` grows forever otherwise):

```bash
docker exec $(docker ps -qf name=postgres) \
  pg_dump -U airflow airflow | gzip > backups/airflow-$(date +%F).sql.gz
```

**5. CI is the deploy gate.** The repo's tests (`pytest tests/`) load the DagBag and assert zero import errors plus the custom operators' contracts. Run them in the image on the server before restarting services after a pull — it is the same test that would have caught my venv-vs-image dependency drift.

## Scaling out: CeleryExecutor across Hetzner machines

One box stops being enough the moment workloads need isolation rather than just CPU: a scraper that can wedge a machine, a job that must originate from a stable network address, a batch that would starve everything else's slots. The scale-out configuration I run for that class of work is CeleryExecutor across multiple Hetzner VMs — one control-plane machine (scheduler, API server, DAG processor, metadata Postgres, broker) and single-purpose worker machines that do nothing but consume their own queues. What follows is how it's set up and what it took to make stable; it draws on a production deployment I operate, with the specifics generalized.

**The move adds a network, not just capacity.** CeleryExecutor splits Airflow into producers and consumers: the scheduler serialises task messages into a broker, workers on other machines pop them off and report into a result backend. I use Redis as the broker — sub-millisecond, easy to reason about, and safe enough here because the Airflow metadata DB stays the source of truth: a lost message shows up as a task stuck in "queued", which monitoring catches. The one Redis setting that deserves more respect than it gets is `visibility_timeout`: Celery redelivers any message not acknowledged inside that window, and Airflow acknowledges late, so the timeout must exceed your longest task or you get duplicate runs. Set it generously and you accept the mirror-image failure — a worker that dies holding a message leaves it invisible until the window expires. Decide which failure you'd rather have, then write down the recovery story for it.

**Queues pin work to machines; they don't balance load.** The textbook use of Celery queues is spreading work across a pool. I use them the opposite way: each heavy workload gets its own queue, each queue is consumed by exactly one worker service on its own VM, and every task carries an explicit `queue=`. That buys failure domains (a job that fills a disk takes down one queue, not the platform), per-machine network identity, and honest capacity math — you know exactly which workload each worker's slots serve. A small generic queue handles orchestration-only tasks. The workers themselves stay generic: the actual heavy code runs as containers pulled fresh at task start, so shipping a new job version means pushing an image, not redeploying Airflow.

**The failure mode that only exists in distributed mode.** The bug that taught me the most: a worker would start, log "ready", then go silent while its queues backed up — container running, ping healthcheck failing, restart loop, no errors anywhere. A Celery worker holds *several* broker connections (consume, acknowledge, control), and an overlay network's load balancer was silently dropping TCP connections idle longer than its timeout. The consuming connection stayed busy and healthy; the acknowledgement connection died without a FIN, and the worker waited forever on a socket that would never answer. The fix is layered because no single layer is trustworthy: bypass the virtual-IP layer for broker traffic, set application-level TCP keepalives well under the network's idle timeout via `broker_transport_options`, add broker health checks and socket timeouts so a dead connection is detected in minutes, and enable `worker_cancel_long_running_tasks_on_connection_loss` so a worker that loses the broker fails loudly. None of this exists on one machine, where the broker is a localhost socket that cannot half-die.

![fig: A Celery worker holding consume, acknowledge and control connections through an overlay network; the acknowledge connection dropped without a FIN](TODO-upload)
*The consuming connection stays healthy; the acknowledgement connection dies without a FIN. (Image by author)*

**Monitoring at three altitudes.** Distributed Airflow needs monitoring that single-machine Airflow collapses into one layer: infrastructure (node exporters, per-worker healthchecks that ping the *named* worker — an anonymous ping succeeds if any worker answers), orchestrator (StatsD metrics into Prometheus/Grafana, plus a monitoring DAG inside Airflow that checks the expected worker set and long-running tasks and posts to chat when the picture is wrong), and the work itself — a small exporter publishing progress and backlog per workload, because task states say a job ran, not whether it did enough. When a source silently degrades to a tenth of its volume, every Airflow-level signal is green; the backlog gauge is the only thing that notices.

![fig: Three monitoring altitudes — infrastructure, orchestrator, and the work itself](TODO-upload)
*Task states say a job ran — not whether it did enough. (Image by author)*

Two smaller stability items earn their place on any multi-machine setup: a connection pooler in front of the metadata Postgres (every scheduler, API server, DAG processor, triggerer and worker opens its own SQLAlchemy pool, and a dozen small pools still swamp a default server), and a pre-push parse suite that forbids top-level imports of worker-only packages — the scheduler parses every DAG file, and one worker-only import breaks DAGs that never touch that code.

## What this buys

The thesis taught me what it costs when the stack definition lives on the server: the server dies, the system becomes archaeology. This layout inverts that. The server is disposable — `hcloud server delete`, re-provision, four commands, and the stack is back, because everything that matters is a file in a repo: the compose topology, the image recipe, the DAGs, the operators, the tests, and the expectations the pipelines assert against their pinned inputs.

Next up: the first case study — the data engineering behind the Voronoi postcode paper, including the two custom operators the pipeline runs on: a DuckDB operator that makes ingestion SQL-first and transactional, and a snapshot guard that makes "pinned input" mean bytes-identical.
