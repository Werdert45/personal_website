// Leadership CV: the public CV served by the site. Rendered by
// scripts/generate-cv-leadership.mjs (npm prebuild) into public/ian-ronk-cv.pdf,
// with a local copy in docs/cv/.
// Positioning: hands-on data leader; research as methodological depth, not identity.

export const resumeLeadership = {
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
      "Data leader with a hands-on engineering background. Built and led the data function at KR&A from junior to Head of Data, delivering spatial data products to institutional investors and European statistical offices. Comfortable owning both the roadmap and the pipeline.",
  },

  achievements: [
    "Led a three-year study for Eurostat on house-price indices from web-scraped listings across 13 EU countries; officially published by Eurostat.",
    "Took a global connectivity score from client question to production API, rolled out across 38 countries in Europe, North America and APAC; now being productised for the wider client base.",
    "Replaced CSV-based data management with a distributed Airflow platform on Iceberg and FastAPI, making the platform reproducible and cutting infrastructure cost.",
    "Introduced agentic workflows into internal operations and replaced manual parsing of documents with OCR, saving weeks of manual data entry.",
  ],

  kra: {
    org: "KR&A",
    orgNote: "Amsterdam",
    period: "Oct 2021 – present",
    titleProgression: "",
    themes: [
      {
        theme: "Head of Data · Jul 2025 – present",
        bullets: [
          "Lead a team of 4 and own the data function: architecture, delivery and the transformation of the product offering.",
          "Run the data platform in production: 1TB+ processed across 13 servers, with agentic monitoring and containerised deployment.",
          "Own the client relationships: pension funds, real estate investors and national statistical offices; present and defend methodology to portfolio managers, senior stakeholders and PhD-level statisticians.",
        ],
      },
      {
        theme: "Medior Data Scientist · Jun 2022 – Jul 2025",
        bullets: [
          "Project lead on two multi-year engagements, including the three-year Eurostat study; the Head of Data title formalised a responsibility held since 2022.",
          "Drove the re-architecture from legacy systems to Airflow, Iceberg and FastAPI, from the decision through migration and operation.",
          "Built and operated production pipelines, including a weekly scrape of 300k records feeding spatial data products; client-facing throughout with CBS, Eurostat and pension funds.",
        ],
      },
      {
        theme: "Junior Data Scientist · Oct 2021 – Jun 2022",
        bullets: [
          "Flood-occurrence prediction from alternative data (BSc-thesis project); 90%+ accuracy in risk classification.",
          "Improved the core spatial API's response times tenfold through geospatial query optimisation, resulting in promotion.",
        ],
      },
    ],
  },

  // Single line, no bullets: five years old, part-time alongside study.
  otherExperience: [
    {
      line: "Junior Full-Stack Developer, Exact (part-time): expense management software (EmberJS, PHP)",
      period: "Sep 2019 – Oct 2021",
    },
  ],

  research: {
    heading: "Research",
    titleLine: "Independent",
    period: "2025 – present",
    text:
      "Calibrating Free Postcode Boundaries from OpenStreetMap (release expected 2026). MSc thesis: Building an Agent-Based Model to Explain Gentrification in European Cities (8/8).",
  },

  education: [
    {
      degree: "MSc Data Science & Business Analytics",
      institution: "Bocconi University",
      grade: "107/110",
      period: "2023 – 2025",
      note: ["Focus: Finance · Econometrics · Statistics · NLP"],
    },
    {
      degree: "BSc Artificial Intelligence",
      institution: "University of Amsterdam",
      grade: "",
      period: "2019 – 2023",
      note: [],
    },
  ],

  // Once AZ-104 is passed: append "Microsoft Azure Administrator (AZ-104), 2026."
  // and add "Azure" to the stack list below. Empty string hides the line.
  certifications: "DataExpert.io Data Engineering Boot Camp, Aug 2025.",

  project: {
    name: "Research pipelines as production systems (personal platform)",
    line:
      "Airflow 3 platform hosting every personal research project, scaled from a laptop to a multi-machine Celery cluster: idempotency guards, custom operators and automated recovery, run as production infrastructure on own servers.",
  },

  stack: [
    "Python",
    "SQL",
    "PostGIS",
    "Airflow",
    "Iceberg",
    "DuckDB",
    "FastAPI",
    "Docker",
    "Linux servers",
    "CI/CD",
    // After passing AZ-104: add "Azure" here and change the certifications
    // line to "Microsoft Azure Administrator (AZ-104), 2026".
  ],
};
