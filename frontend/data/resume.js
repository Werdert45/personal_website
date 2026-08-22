// Single source of truth for the resume: the About page section and the
// generated PDF (scripts/generate-cv.mjs) both render from this object.
// EN-only by design; content approved 2026-08-11 (v6 render).

export const resumeSections = {
  kicker: "Resume",
  engineering: "Engineering & Leadership",
  research: "Research & Publications",
  education: "Education",
  stack: "Stack",
  languages: "Languages & Soft Skills",
};

export const resume = {
  header: {
    name: "Ian Ronk",
    roleLine: "Head of Data · Engineer & Researcher",
    location: "Amsterdam, NL",
    email: "ianronk0@gmail.com",
    links: [
      { label: "linkedin.com/in/ian-ronk-7b054a120", url: "https://linkedin.com/in/ian-ronk-7b054a120" },
      { label: "github.com/Werdert45", url: "https://github.com/Werdert45" },
      { label: "ianronk.nl", url: "https://ianronk.nl" },
    ],
    languages: "Dutch C2 · English C2 · Italian B2/C1 · German B2 · Spanish A2",
    softSkills:
      "Team leadership · Multi-year project management · Client & stakeholder communication · Presenting and defending methodology to technical and senior audiences",
    summary:
      "Production data systems and the data engineering behind research: Airflow, DuckDB and PostGIS pipelines that turn open spatial data into papers. Leads a team of 4 as Head of Data; publishes independent research on urban dynamics.",
  },

  engineering: [
    {
      role: "Head of Data",
      org: "KR&A",
      orgNote: "Amsterdam",
      period: "Jul 2025 – present",
      bullets: [
        "Lead a team of 4 through a transformation of the product offering, serving pension funds and leading FinTechs.",
        "Develop, maintain and expand data pipelines (e.g. a weekly scrape of 300k records) and spatial big data products.",
        "Delivered a global connectivity score: 1TB+ processed across 13 servers into a production API.",
        "Represent the data function with clients: defending methodology against PhD-level scrutiny, presenting to portfolio managers and senior stakeholders.",
        "Drive AI adoption: OCR and LLM document extraction, agentic pipeline monitoring, agent-assisted development.",
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
      role: "Medior Data Scientist",
      org: "KR&A",
      orgNote: "",
      period: "Jun 2022 – Jul 2025",
      bullets: [
        "Project lead for two multi-year projects, including a 3-year hedonic house-price-index project for Eurostat: scraping, storing and managing the data, building the regressions, interpreting results.",
        "Restructured data infrastructure from legacy systems to Airflow, Iceberg and FastAPI.",
        "Client-facing throughout, with CBS, Eurostat and pension funds.",
      ],
    },
    {
      role: "Junior Data Scientist",
      org: "KR&A",
      orgNote: "",
      period: "Oct 2021 – Jun 2022",
      bullets: [
        "Flood-occurrence prediction from alternative data (BSc-thesis project); 90%+ accuracy in risk classification.",
        "Improved API efficiency tenfold through spatial optimisations.",
      ],
    },
    {
      role: "Junior Full-Stack Developer",
      org: "Exact (former SRXP)",
      orgNote: "part-time",
      period: "Sep 2019 – Sep 2022",
      bullets: [
        "Enterprise expense-declaration software (EmberJS, PHP) under CI/CD and testing.",
      ],
    },
  ],

  research: [
    {
      title: "Calibrating Free Postcode Boundaries from OpenStreetMap",
      venue: "preprint (arXiv 2026)",
      year: "2026",
      result:
        "Seed-density-to-IoU calibration of an OSM-Voronoi pipeline; NL/DK references, transfer to BE, applied to Italy's 4,209 CAP polygons.",
      href: "/research/voronoi-postcodes-paper",
    },
    {
      title: "When Does Metro Infrastructure Capitalize into Property Prices?",
      venue: "working paper",
      year: "2026",
      result:
        "Phase-decomposed DiD across seven European cities, n = 42,004; wild-cluster-bootstrap inference.",
      href: "/research/when-metro-capitalizes-paper",
    },
    {
      title: "A Saturation-Validated Connectivity Score at Parcel Resolution",
      venue: "method paper in preparation",
      year: "2026",
      result: "",
      href: null,
    },
    {
      title: "Building an Agent-Based Model to Explain Gentrification in European Cities",
      venue: "(MSc thesis, 8/8)",
      year: "2023",
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
      note: "Focus: Finance · Econometrics · Statistics · NLP",
    },
    {
      degree: "BSc Artificial Intelligence",
      institution: "University of Amsterdam",
      grade: "",
      period: "2019 – 2023",
      note: [
        "Minor in Linguistics, University of Amsterdam",
        "Erasmus minor, Università di Bologna (UNIBO)",
      ],
    },
  ],

  stack: [
    "Python",
    "SQL",
    "PostGIS",
    "Airflow",
    "DuckDB",
    "PyTorch",
    "MLflow",
    "Bash",
    "LLM pipelines",
  ],
};
