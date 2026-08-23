// Single source of truth for the resume: the About page section and the
// generated PDF (scripts/generate-cv.mjs) both render from this object.
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
    roleLine: "Head of Data · Engineer & Researcher",
    location: "Amsterdam, NL",
    email: "ian@ronk.org",
    links: [
      { label: "linkedin.com/in/ian-ronk-7b054a120", url: "https://linkedin.com/in/ian-ronk-7b054a120" },
      { label: "github.com/Werdert45", url: "https://github.com/Werdert45" },
      { label: "ianronk.nl", url: "https://ianronk.nl" },
    ],
    languages: "Dutch C2 · English C2 · Italian B2/C1 · German B2 · Spanish A2",
    softSkills:
      "Multi-year project management · Client & stakeholder communication · Presenting and defending methodology to technical and senior audiences · Reliability",
    summary:
      "Production data systems and the data engineering behind research: Airflow, DuckDB and PostGIS pipelines that turn open spatial data into papers. Leads a team of 4 as Head of Data; interest in research on urban dynamics.",
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
        "Improved API efficiency tenfold through spatial optimisations, resulting in promotion.",
      ],
    },
    {
      role: "Junior Full-Stack Developer",
      org: "Exact (former SRXP)",
      orgNote: "part-time",
      period: "Sep 2019 – Sep 2022",
      bullets: [
        "Enterprise expense-declaration software (EmberJS, PHP) under CI/CD and testing.",
        "Maintained a client-facing webapp, working on business logic and styling.",
      ],
    },
  ],

  research: [
    {
      title: "Calibrating Free Postcode Boundaries from OpenStreetMap",
      venue: "Release August 2026",
      year: "2026",
      result:
        "Seed-density-to-IoU calibration of an OSM-Voronoi pipeline; NL/DK references, transfer to BE, applied to Italy's 4,209 CAP polygons.",
      href: "/research/voronoi-postcodes-paper",
    },
    {
      title: "When Does Metro Infrastructure Capitalize into Property Prices?",
      venue: "Release September 2026",
      year: "2026",
      result:
        "Phase-decomposed DiD across seven European cities, n = 42,004; wild-cluster-bootstrap inference. Found some correlation, but not strong.",
      href: "/research/when-metro-capitalizes-paper",
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

  // Page 2 of the CV PDF; condensed from the site's Projects cards.
  projects: [
    {
      name: "LanguageBuddy: AI language tutor",
      line: "Self-hosted AI language tutor for Dutch, Italian and Spanish: chat or voice-call LLM tutor with SM-2 spaced repetition; every mistake feeds the next day's exercises, with a real-news reader and 6,200+ CEFR-aligned vocabulary entries.",
      stack: "FastAPI · LLM · TTS · SQLite · Docker",
    },
    {
      name: "Gentrification agent-based model",
      line: "MSc thesis: an agent-based model of neighbourhood change for Amsterdam, Utrecht and Milan, driven by income, affordability and attractiveness (streetview 'beauty' classification, GTFS connectivity, greenery, neighborhood sentiment). A two-tenure social-housing extension is in progress.",
      stack: "Python/GeoPandas · Large Vision Model · PostGIS · Agent-based Modeling",
    },
    {
      name: "Connectivity & walkability scoring (KR&A)",
      line: "Led a saturation-validated connectivity and walkability score at parcel resolution, rolled out across 38 EU/NA/APAC markets from TBs of data and 100s of sources.",
      stack: "PostGIS · S3 · Dijkstra & Network Science · Distributed Compute",
    },
    {
      name: "Monthly house-price index, 13 EU countries (KR&A)",
      line: "Web-scraping pipeline across 13 countries feeding a log-price hedonic regression; monthly indices tested as disaggregation indicators for Eurostat quarterly HPIs.",
      stack: "Python · Scrapy/Selenium · PostGIS · MongoDB · R",
    },
    {
      name: "Research pipelines as production systems",
      line: "Airflow 3 pipelines hosting every personal research project, scaling from a laptop to a multi-machine CeleryExecutor cluster; idempotency guards, custom operators and agentic monitoring.",
      stack: "Airflow · Celery · Docker · CI · DuckDB",
    },
    {
      name: "SponsoredBye: sponsor-segment detection",
      line: "Text-only sponsor-skipper for YouTube: sentence-T5 embeddings feed a BiLSTM sequence tagger that maps sponsored sentences back to timestamps, cutting segmentation error from 99% to 16% WindowDiff.",
      stack: "TensorFlow · BiLSTM · sentence-T5 · MongoDB · Huggingface",
    },
    {
      name: "FishFinder: photo-to-species ID",
      line: "Flutter app identifying 63 Dutch fish species from a photo, fully on-device: ~3,000 hand-annotated photos masked with Segment Anything, a fine-tuned ResNet50 compressed to an 8.8 MB TFLite model.",
      stack: "Flutter/Dart · TFLite · ResNet50 · Segment Anything Model (SAM) · Firebase",
    },
    {
      name: "Predicting flooding risk from local features",
      line: "BSc thesis: explaining flood risk from 33 local features across ~45,000 European locations (100GB+ of data); a Random Forest reaches 97.5% on the binary 20-year flood question.",
      stack: "scikit-learn · Random Forest · raster data · GIS",
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
