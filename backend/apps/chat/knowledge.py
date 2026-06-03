"""
SQLite FTS5 knowledge base for the chat widget.
Stored in a separate file from the main database — no migrations needed.
"""

import os
import sqlite3
import time

KB_PATH = os.path.join(os.path.dirname(__file__), "chat_kb.sqlite3")

IP_BLOCK_DURATION = 3600  # 1 hour

CHUNKS = [
    {
        "category": "bio",
        "content": (
            "Ian Ronk is Head of Data at KR&A in Amsterdam. He builds production spatial "
            "systems for real estate funds, climate-risk teams and alternative-data pipelines. "
            "He holds an MSc in Data Science and Business Analytics from Bocconi University "
            "and a BSc in Artificial Intelligence from the University of Amsterdam, roughly "
            "four years between the two, spent mostly on the production side."
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
            "Ian's four core competencies: (1) Machine Learning & AI — predictive models for "
            "valuation, rent and flood risk (90%+ accuracy), LLM pipelines and tool-using agents. "
            "(2) Data Engineering — Airflow, Docker, PostGIS, Postgres pipelines for REITs and funds. "
            "(3) Geospatial Analysis — agent-based modelling, street-view CV, H3 indexing, "
            "spatially-aware data science at parcel and postcode resolution. "
            "(4) AI Automation — LLM-powered workflows, RAG pipelines, React internal tools, "
            "PostgreSQL schemas."
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
            "investors. He also does personal client work, including ingoglia.de."
        ),
    },
    {
        "category": "markets",
        "content": (
            "Ian's market focus is on Dutch (NL), German (DE), UK and Italian (IT) real estate "
            "markets. He works across real estate, climate risk and alternative data sectors. "
            "He has mapped 15+ European markets."
        ),
    },
    {
        "category": "project",
        "content": (
            "Project: Gentrification agent-based model. Ten-year simulation of neighbourhood "
            "turnover in European cities, calibrated on Kadaster and CBS microdata. MSc thesis "
            "at Bocconi. Stack: Python, Mesa, GeoPandas, Postgres."
        ),
    },
    {
        "category": "project",
        "content": (
            "Project: Parcel-level flood-risk classifier. Supervised classification on LiDAR "
            "and rainfall-radar features at parcel level. 90%+ balanced accuracy on held-out "
            "insurable-loss claims. BSc thesis at University of Amsterdam. "
            "Stack: PyTorch, GeoPandas, PostGIS, LiDAR."
        ),
    },
    {
        "category": "project",
        "content": (
            "Project: Hedonic rent model across 15 EU metros. Parcel-level hedonic rent "
            "benchmarks built on PostGIS and gradient boosting across European metros. "
            "Stack: PostGIS, GeoPandas, XGBoost, H3."
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
            "Research: Postcode boundary estimation from crowdsourced address data (Voronoi "
            "approach). OSM address points, kNN outlier removal, point Voronoi, polygon "
            "dissolution. Calibrated on NL and DK authoritative data (5,160 polygons combined). "
            "Applied to Italy (4,209 CAP polygons). Preprint 2026. Target: arXiv + CEUS journal."
        ),
    },
    {
        "category": "research",
        "content": (
            "Research: When metro openings capitalise into residential rents — a seven-city "
            "European study. Staggered difference-in-differences across Milano, Amsterdam, "
            "Copenhagen, Paris, Helsinki, Rennes, Roma (n = 42,004). Key finding: +12% price "
            "step at maturity (2+ years after opening). Bootstrap inference (G=7 cities). "
            "Working paper 2026."
        ),
    },
    {
        "category": "education",
        "content": (
            "Education: MSc in Data Science and Business Analytics, Bocconi University, Milan "
            "(2024-2025). BSc in Artificial Intelligence, University of Amsterdam. "
            "Ian spent the four years between the two mostly on the production side of "
            "spatial analytics."
        ),
    },
    {
        "category": "contact",
        "content": (
            "Contact: Ian can be reached at ianronk0@gmail.com. LinkedIn: "
            "linkedin.com/in/ian-ronk-7b054a120/. GitHub: github.com/Werdert45. "
            "Based in Amsterdam, Netherlands. Available for project work and collaborations."
        ),
    },
    {
        "category": "blog",
        "content": (
            "Ian writes about geodata methods, ML pipelines and what breaks in production. "
            "Recent topics: estimating Italian postcode boundaries with Voronoi diagrams, "
            "PostGIS vs DuckDB for analyst queries, switching to H3 for real-estate geoindexing, "
            "replacing paid isochrone vendors with in-house OSRM+GTFS."
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
