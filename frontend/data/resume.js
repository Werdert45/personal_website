// Source of truth for the About page's resume section. The downloadable PDF
// (public/ian-ronk-cv.pdf) renders from data/resume-leadership.js instead;
// scripts/generate-cv.mjs is kept but no longer wired into the build.
// EN-only by design; content approved 2026-08-11 (v6 render).

export const resumeSections = {
  kicker: "Resume",
  engineering: "Professional Experience",
  research: "Research Topics",
  education: "Education",
  stack: "Stack",
  languages: "Languages & Soft Skills",
};

export const resume = {
  header: {
    name: "Ian Ronk",
    roleLine: "Head of Data",
    location: "Amsterdam, NL",
    email: "ian@ronk.org",
    links: [
      { label: "LinkedIn", url: "https://linkedin.com/in/ian-ronk-7b054a120" },
      { label: "GitHub", url: "https://github.com/Werdert45" },
      { label: "ianronk.nl", url: "https://ianronk.nl" },
    ],
    languages: "Dutch C2 · English C2 · Italian B2/C1 · German B2 · Spanish A2",
    softSkills:
      "Multi-year project management · Client & stakeholder communication · Presenting and defending methodology to technical and senior audiences",
    summary:
      "Production data systems and the data engineering behind research: Airflow, DuckDB and PostGIS pipelines that turn open spatial data into papers. Head of Data at KR&A; interest in research on urban dynamics.",
  },

  engineering: [
    {
      role: "Head of Data",
      org: "KR&A",
      orgNote: "Amsterdam",
      period: "Jul 2025 – present",
      bullets: [
        "Lead the data team (built up to four engineers) through a transformation of the product offering, serving pension funds, real estate investors and national statistical offices.",
        "Develop, maintain and expand data pipelines (e.g. a weekly scrape of 300k records) and spatial big data products.",
        "Delivered a global connectivity score: 1TB+ processed across 13 servers into a production API.",
        "Represent the data function with clients: methodology reviews with Eurostat and CBS statisticians, presentations to portfolio managers and senior stakeholders.",
        "Drive AI adoption: OCR and LLM document extraction, agentic pipeline monitoring.",
      ],
    },
    {
      role: "Independent Researcher",
      org: "urban dynamics",
      orgNote: "",
      period: "2025 – present",
      bullets: [
        "Self-directed research programme: two working papers and a method paper in preparation (see Research), each backed by an open, reproducible pipeline.",
      ],
    },
    {
      role: "Data Scientist & Technical Lead",
      org: "KR&A",
      orgNote: "part-time",
      period: "Jun 2022 – Jul 2025",
      bullets: [
        "Technical lead for two multi-year projects, including a hedonic house-price-index study for Eurostat, published as an official Eurostat statistical working paper: led the technical side for eight people across a two-organisation consortium, from scraping and storage to regressions and interpretation.",
        "Restructured data infrastructure from legacy systems to Airflow, Iceberg and FastAPI.",
        "Client-facing throughout, with CBS, Eurostat and pension funds.",
      ],
    },
    {
      role: "Junior Data Scientist",
      org: "KR&A",
      orgNote: "part-time",
      period: "Oct 2021 – Jun 2022",
      bullets: [
        "Flood-occurrence prediction from alternative data (BSc-thesis project); 97% accuracy in risk classification.",
        "Improved the spatial API's response times tenfold through geospatial query optimisation, resulting in promotion.",
      ],
    },
    {
      role: "Junior Full-Stack Developer",
      org: "Exact (former SRXP)",
      orgNote: "part-time",
      period: "Sep 2019 – Oct 2021",
      bullets: [
        "Enterprise expense-declaration software (EmberJS, PHP) under CI/CD and testing.",
        "Maintained a client-facing webapp, working on business logic and styling.",
      ],
    },
  ],

  research: [
    {
      title: "Calibrating Free Postcode Boundaries from OpenStreetMap",
      venue: "Release expected 2026",
      year: "2026",
      result:
        "Seed-density-to-IoU calibration of an OSM-Voronoi pipeline; NL/DK references, transfer to BE, applied to Italy's 4,209 CAP polygons.",
      href: "/research/voronoi-postcodes-paper",
    },
    {
      title: "US vs EU: Does Training-Data Geography Matter for Autonomous-Driving Object Detection?",
      cvExclude: true, // stays on the About page; CV shows only Voronoi + ABM
      venue: "preprint",
      year: "2025",
      result:
        "Controlled 2×3 fine-tuning study (YOLOv3/YOLOv8): US fine-tuning transfers roughly nothing to European streets (+0.001 vs +0.153 mAP in-domain).",
      href: "/research/us-vs-eu-transfer-autonomous-driving",
    },
    {
      title: "Building an Agent-Based Model to Explain Gentrification in European Cities",
      venue: "(MSc thesis, 8/8)",
      year: "2025",
      result: "Amsterdam · Utrecht · Milan.",
      href: "/research/gentrification-abm-european-cities",
    },
  ],

  education: [
    {
      degree: "MSc Data Science & Business Analytics",
      institution: "Bocconi University",
      grade: "107/110",
      period: "2023 – 2025",
      note: [
        "Focus: Finance · Econometrics · Statistics · NLP",
        "Thesis: Building an Agent-Based Model to Explain Gentrification in European Cities",
      ],
    },
    {
      degree: "BSc Artificial Intelligence",
      institution: "University of Amsterdam",
      grade: "7.6/10",
      period: "2019 – 2023",
      note: [
        "Minor in Linguistics, University of Amsterdam",
        "Erasmus minor, Università di Bologna (UNIBO)",
      ],
    },
  ],

  // Page 2 of the CV PDF; top 3 only, condensed from the site's Projects cards.
  projects: [
    {
      name: "Research pipelines as production systems",
      line: "Airflow 3 pipelines hosting my research projects, scaling from a laptop to a multi-machine CeleryExecutor cluster; idempotency guards, custom operators and agentic monitoring.",
      stack: "Airflow · Celery · Docker · CI · DuckDB",
    },
    {
      name: "LanguageBuddy: AI language tutor",
      line: "Self-hosted AI language tutor for Dutch, Italian and Spanish: chat or voice-call LLM tutor with SM-2 spaced repetition; every mistake feeds the next day's exercises, with a real-news reader and 6,200+ CEFR-aligned vocabulary entries.",
      stack: "FastAPI · LLM · TTS · SQLite · Docker",
    },
    {
      name: "FishFinder: photo-to-species ID",
      line: "Flutter app identifying 63 Dutch fish species from a photo, fully on-device: ~3,000 hand-annotated photos masked with Segment Anything, a fine-tuned ResNet50 (90 MB) compressed to an 8.8 MB TFLite model.",
      stack: "Flutter/Dart · TFLite · ResNet50 · Segment Anything Model (SAM) · Firebase",
    },
  ],

  stack: [
    "Python",
    "SQL",
    "PostGIS",
    "Airflow",
    "Iceberg",
    "DuckDB",
    "Docker",
    "PyTorch",
    "Bash",
  ],
};
