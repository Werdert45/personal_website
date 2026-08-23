"""
SQLite FTS5 knowledge base for the chat widget.
Stored in a separate file from the main database — no migrations needed.
"""

import os
import sqlite3
import time

from django.core.cache import cache
from django.utils import timezone

KB_PATH = os.path.join(os.path.dirname(__file__), "chat_kb.sqlite3")

IP_BLOCK_DURATION = 3600  # 1 hour

# Global daily cap on paid LLM calls. Counter resets each calendar day (UTC).
CHAT_DAILY_LIMIT = int(os.environ.get("CHAT_DAILY_LIMIT", "500"))


def daily_cap_reached() -> bool:
    """Increment today's global LLM-call counter and report whether the cap is hit.

    Returns True once the number of calls for the current UTC day exceeds
    CHAT_DAILY_LIMIT, so the caller can short-circuit before the paid API call.
    Uses Django's cache; survives ~2 days then expires.
    """
    today = timezone.now().date().isoformat()
    key = f"chatspend:{today}"
    cache.add(key, 0, 60 * 60 * 48)
    try:
        count = cache.incr(key)
    except ValueError:
        cache.set(key, 1, 60 * 60 * 48)
        count = 1
    return count > CHAT_DAILY_LIMIT

CHUNKS = [
    {
        "category": "bio",
        "content": (
            "Ian Ronk is Head of Data at KR&A in Amsterdam. He builds and leads production "
            "data systems; his specialty is the data engineering behind research — Airflow, "
            "DuckDB and PostGIS pipelines that turn open spatial data into papers. Research "
            "focus: urban dynamics — gentrification, accessibility, housing markets. "
            "He holds an MSc in Data Science and Business Analytics from Bocconi University "
            "and a BSc in Artificial Intelligence from the University of Amsterdam, roughly "
            "five years between the two, spent mostly on the production side."
        ),
    },
    {
        "category": "bio",
        "content": (
            "Ian works at the intersection of geospatial analytics, ML and the data "
            "infrastructure that makes both useful — the pipelines, schemas and spatial joins "
            "that do not appear in papers but determine whether the model ships. He speaks "
            "Dutch, English, German and Italian."
        ),
    },
    {
        "category": "skills",
        "content": (
            "Ian's five core competencies: (1) Big Data & Pipelines — scrape and ETL "
            "infrastructure that keeps running: three years of weekly collection across "
            "8 authenticated sources, 250k+ records, Airflow and PostGIS underneath. "
            "(2) Network Science — graph methods on real geographies, including a "
            "saturation-validated Connectivity Score at parcel resolution. "
            "(3) Timeseries & Forecasting — a monthly house-price index across 13 EU "
            "countries tested with Eurostat, plus nowcasting for sparse official statistics. "
            "(4) Spatial Analysis & Simulation — agent-based models of neighbourhood change, "
            "hedonic pricing, H3 and PostGIS as daily tools. "
            "(5) Product Ownership & Leadership — end-to-end from method to shipped API: a "
            "13-server build delivered two weeks ahead of plan, a team of 4-5 led at KR&A. "
            "Machine learning sits inside these rather than above them — predictive models "
            "for valuation and spatial risk, street-view CV — deployed through the same "
            "pipelines."
        ),
    },
    {
        "category": "stack",
        "content": (
            "Ian's technical stack: Python, PostGIS, Airflow, Docker, PyTorch, XGBoost, "
            "LangChain, RAG, React, Next.js, H3, DeckGL, Mapbox, GeoPandas, PostgreSQL, "
            "n8n, QGIS, Kepler.gl, LLM APIs."
        ),
    },
    {
        "category": "work",
        "content": (
            "Ian is currently Head of Data at KR&A, an Amsterdam-based FinTech for European "
            "real estate. KR&A clients include Eurostat, CBS and institutional real estate "
            "investors."
        ),
    },
    {
        "category": "markets",
        "content": (
            "Ian's market focus is on Dutch (NL), German (DE), UK and Italian (IT) real estate "
            "markets. He works across real estate, climate risk and alternative data sectors. "
            "The house-price index pipeline he leads at KR&A covers 13 EU countries, tested "
            "with Eurostat."
        ),
    },
    {
        "category": "project",
        "content": (
            "Project: Gentrification agent-based model. MSc thesis (2025): an agent-based "
            "model of neighbourhood change driven by attractiveness and affordability, "
            "applied to Amsterdam, Utrecht and Milan on open spatial data. "
            "Stack: Python, Mesa, GeoPandas, Postgres/PostGIS, Airflow."
        ),
    },
    {
        "category": "project",
        "content": (
            "Project: Research data engineering in the open. A public data-orchestration "
            "repository: Airflow 3 pipelines behind Ian's research projects, with custom "
            "operators (a DuckDB SQL-ingestion operator, a snapshot-guard operator that "
            "verifies pinned inputs by SHA-256), tests and CI. Written up as a blog series "
            "on treating research pipelines as production systems."
        ),
    },
    {
        "category": "project",
        "content": (
            "Project: Facade and commerce signals from street-view imagery. CNN extraction "
            "of facade and commerce features from ~4M street-view frames across six EU cities. "
            "Stack: PyTorch, OpenCV, GeoPandas, Postgres."
        ),
    },
    {
        "category": "research",
        "content": (
            "Research: Calibrating Free Postcode Boundaries from OpenStreetMap. One "
            "OSM-Voronoi pipeline calibrated against authoritative NL and DK layers "
            "(5,160 polygons), a seed-density-to-IoU curve (asymptote ~0.76-0.82 mean "
            "matched IoU), out-of-sample transfer tested on Belgium, applied to Italy's "
            "4,209 CAP polygons. Preprint; arXiv planned August 2026."
        ),
    },
    {
        "category": "research",
        "content": (
            "Research: When Does Metro Infrastructure Capitalize into Property Prices? "
            "Phase-decomposed difference-in-differences across seven European cities "
            "(n = 42,004, property prices, wild cluster bootstrap). The pooled average puts "
            "the largest response at maturity, but the defensible magnitudes are per-city — "
            "foremost Milano's +167 EUR/m2 (p = 0.004). Working paper, 2026."
        ),
    },
    {
        "category": "education",
        "content": (
            "Education: MSc in Data Science and Business Analytics, Bocconi University, Milan "
            "(2023-2025). BSc in Artificial Intelligence, University of Amsterdam. "
            "Ian spent the five years between the two mostly on the production side of "
            "spatial analytics."
        ),
    },
    {
        "category": "contact",
        "content": (
            "Contact: Ian can be reached at ian@ronk.org. LinkedIn: "
            "linkedin.com/in/ian-ronk-7b054a120/. GitHub: github.com/Werdert45. "
            "Based in Amsterdam, Netherlands. Open to conversations about data engineering "
            "for research, research collaborations, and co-authorship."
        ),
    },
    {
        "category": "blog",
        "content": (
            "Ian writes about geodata methods, research data engineering, and what breaks "
            "in production. The series starting August 2026: the Airflow stack behind his "
            "research pipelines (including a multi-machine CeleryExecutor setup), a "
            "data-engineering case study of the postcode-boundaries paper, case studies of "
            "the MSc thesis, and the Italian metro capitalization work."
        ),
    },
]

SYSTEM_PROMPT = (
    "You are an AI assistant for Ian Ronk's personal website at ianronk.com. "
    "Answer questions about Ian using only the context provided. Be helpful, concise and direct. "
    "Speak in third person about Ian, or first person if asked directly (\"what do you do?\"). "
    "If the context does not contain the answer, say so briefly rather than making something up. "
    "Keep responses to 2-4 sentences. "
    "If the question is clearly not about Ian Ronk, his work, research, background, skills, "
    "or how to contact him, reply with only the single word: OFFTOPIC"
)


def init_kb():
    conn = sqlite3.connect(KB_PATH)
    conn.execute(
        "CREATE VIRTUAL TABLE IF NOT EXISTS chunks "
        "USING fts5(category, content, tokenize='porter unicode61')"
    )
    conn.execute(
        "CREATE TABLE IF NOT EXISTS ip_blocks "
        "(ip TEXT PRIMARY KEY, blocked_until INTEGER)"
    )
    conn.commit()
    conn.close()


def seed_kb():
    init_kb()
    conn = sqlite3.connect(KB_PATH)
    conn.execute("DELETE FROM chunks")
    conn.executemany(
        "INSERT INTO chunks(category, content) VALUES (?, ?)",
        [(c["category"], c["content"]) for c in CHUNKS],
    )
    conn.commit()
    conn.close()
    return len(CHUNKS)


def search_kb(query: str, limit: int = 4) -> list[str]:
    results = search_kb_with_category(query, limit)
    return [r[1] for r in results]


def search_kb_with_category(query: str, limit: int = 4) -> list[tuple[str, str]]:
    """Returns list of (category, content) ordered by FTS rank."""
    if not os.path.exists(KB_PATH):
        return []
    conn = sqlite3.connect(KB_PATH)
    try:
        rows = conn.execute(
            "SELECT category, content FROM chunks WHERE chunks MATCH ? ORDER BY rank LIMIT ?",
            (query, limit),
        ).fetchall()
    except sqlite3.OperationalError:
        rows = []
    conn.close()
    return rows


def is_ip_blocked(ip: str) -> bool:
    if not os.path.exists(KB_PATH):
        return False
    conn = sqlite3.connect(KB_PATH)
    try:
        row = conn.execute(
            "SELECT 1 FROM ip_blocks WHERE ip = ? AND blocked_until > ?",
            (ip, int(time.time())),
        ).fetchone()
    except sqlite3.OperationalError:
        row = None
    conn.close()
    return row is not None


def block_ip(ip: str) -> None:
    init_kb()
    conn = sqlite3.connect(KB_PATH)
    conn.execute(
        "INSERT OR REPLACE INTO ip_blocks (ip, blocked_until) VALUES (?, ?)",
        (ip, int(time.time()) + IP_BLOCK_DURATION),
    )
    conn.commit()
    conn.close()
