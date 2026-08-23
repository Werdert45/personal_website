# Site copy (EN) — full text per page

Every user-facing English string on ianronk.nl, grouped by page. The `code` label above each string is its key in `frontend/messages/en.json` (or the file noted). **Edit the text in place, leave the key labels untouched**, and I can write your edits back mechanically. Dutch, German and Italian will be re-derived from your English.


## Global chrome (every page)
*Navigation bar, footer, cookie consent, chat widget (Ask Ian launcher currently hidden)*

### Navigation

- `Navigation.home`  
  Home
- `Navigation.about`  
  About
- `Navigation.visualizations`  
  Blogs
- `Navigation.contact`  
  Contact
- `Navigation.letsTalk`  
  Contact
- `Navigation.menu`  
  Menu
- `Navigation.projects`  
  Projects & Papers

### Footer

- `Footer.copyright`  
  {year} Ian Ronk. All rights reserved.
- `Footer.crmLogin`  
  CRM
- `Footer.privacyPolicy`  
  Privacy Policy
- `Footer.termsOfService`  
  Terms of Service
- `Footer.cookiePolicy`  
  Cookie Policy
- `Footer.work`  
  Contact

### Consent

- `Consent.dialogLabel`  
  Cookie consent
- `Consent.title`  
  Privacy preferences
- `Consent.body`  
  I use cookies to understand site usage and (with your consent) for retargeting. You can change preferences anytime from the footer.
- `Consent.policyLink`  
  Read the cookie policy
- `Consent.acceptAll`  
  Accept all
- `Consent.rejectAll`  
  Reject all
- `Consent.customize`  
  Customize
- `Consent.hidePrefs`  
  Hide preferences
- `Consent.savePrefs`  
  Save preferences
- `Consent.tierAnalytics`  
  Analytics
- `Consent.tierAnalyticsDetail`  
  Google Analytics, Microsoft Clarity. Pageviews, behavior, heatmaps.
- `Consent.tierMarketing`  
  Marketing
- `Consent.tierMarketingDetail`  
  LinkedIn Insight Tag. Aggregated audience demographics, retargeting.
- `Consent.cookiePreferences`  
  Cookie preferences
- `Consent.accept`  
  Accept
- `Consent.decline`  
  Decline

### Chat

- `Chat.toggle`  
  ASK IAN
- `Chat.toggleAria`  
  Ask Ian's AI assistant
- `Chat.panelAria`  
  Chat with Ian's AI assistant
- `Chat.closeAria`  
  Close chat
- `Chat.initialMessage`  
  Hi. Ask me anything about Ian: his work, research, background, or how to get in touch.
- `Chat.starter1`  
  What does Ian work on?
- `Chat.starter2`  
  Tell me about his research
- `Chat.starter3`  
  How do I get in touch?
- `Chat.contactCta`  
  Reach out via the contact page
- `Chat.placeholder`  
  Ask about Ian's work or research…
- `Chat.inputAria`  
  Your question
- `Chat.sendAria`  
  Send
- `Chat.noResponse`  
  No response received.
- `Chat.connectionError`  
  Connection error. Try again shortly.

### Author

- `Author.roleLine`  
  Head of Data · Engineer & Researcher
- `Author.bio`  
  I lead data teams and build production data systems in Amsterdam. This site collects the case studies, papers and field notes.
- `Author.cta`  
  Full bio →


## Homepage

### Hero (jumbotron)

- `Hero.location`  
  Amsterdam, NL
- `Hero.role`  
  Data Lead · Data Engineer & System Architecture
- `Hero.title`  
  Transforming
- `Hero.titleHighlight`  
  complex data
- `Hero.titleEnd`  
  into insights.
- `Hero.description`  
  I am Ian and I build and maintain production data systems and the analytics on top, from any complex data type: weekly high-volume web-scraped data, geospatial, graph or tabular data. I answer stakeholder questions using this data.
- `Hero.aboutMe`  
  About me
- `Hero.workWithMe`  
  Get in touch
- `Hero.expertise`  
  Focus areas
- `Hero.expertiseAreas[0]`  
  Data Engineering
- `Hero.expertiseAreas[1]`  
  System Architecture
- `Hero.expertiseAreas[2]`  
  Complex Data Products
- `Hero.expertiseAreas[3]`  
  Analytics & ML

### Marquee (moving ribbon)
*Hardcoded in `frontend/components/marquee.jsx`*

- `marquee[0]`  
  Data engineering
- `marquee[1]`  
  System Architecture & Networking
- `marquee[2]`  
  Geospatial & Network Data
- `marquee[3]`  
  AI, LLM & OCR

### About teaser (section 2)

- `AboutTeaser.kicker`  
  About: who am I
- `AboutTeaser.titleLine1`  
  Hi, I'm
- `AboutTeaser.titleLine1Italic`  
  Ian.
- `AboutTeaser.titleLine2`  
  I create insights using
- `AboutTeaser.titleLine2Underline`  
  data
- `AboutTeaser.bio1`  
  I work as a Head of Data, where I build and maintain data systems, collecting, processing and structuring data for different data products, used by pension funds, bureaus of statistics and real estate investors with 10B AuM.
- `AboutTeaser.bio2`  
  Over the course of my career I worked with many different types of data and tools, creating custom systems for the data problems at hand, talking to client stakeholders and creating innovative solutions.
- `AboutTeaser.factRoleK`  
  Role
- `AboutTeaser.factRoleV`  
  Data Lead · Data Engineer
- `AboutTeaser.factBasisK`  
  Based
- `AboutTeaser.factBasisV`  
  Amsterdam, NL
- `AboutTeaser.factEduK`  
  Education
- `AboutTeaser.factEduV`  
  MSc Bocconi · BSc AI, UvA
- `AboutTeaser.factStackK`  
  Stack
- `AboutTeaser.factStackV`  
  Bash · Python · PostGIS/SQL · Airflow · Iceberg
- `AboutTeaser.cta`  
  Read the full bio

### Focus areas

- `Lanes.kicker`  
  Focus Areas
- `Lanes.titleItalic`  
  Focus
- `Lanes.titleRest`  
  Areas
- `Lanes.subtitle`  
  Working as Head of Data I wear many hats. My four focus areas are building the data infrastructure, setting up the systems itself, handling different types of data and running analytics on top.
- `Lanes.items[0].name`  
  Data Engineering
- `Lanes.items[0].blurb`  
  Building and maintaining data pipelines and efficient storage, such as three years of weekly collection/scraping across 8 different sources for a real estate fund with 10B AuM and then structuring, cleaning and deduplicating this data automatically.
- `Lanes.items[0].stack[0]`  
  Airflow
- `Lanes.items[0].stack[1]`  
  Python
- `Lanes.items[0].stack[2]`  
  ETL
- `Lanes.items[0].stack[3]`  
  Monitoring
- `Lanes.items[0].stack[4]`  
  Iceberg
- `Lanes.items[1].name`  
  System Architecture
- `Lanes.items[1].blurb`  
  Setting up the platform underneath: server instances, PostGIS, distributed Iceberg compute and data processing servers, networking/VPN, APIs and security. Example: 13 different services run as production infrastructure to handle loads of complex data products.
- `Lanes.items[1].stack[0]`  
  Linux/Bash
- `Lanes.items[1].stack[1]`  
  Resource Management & S3
- `Lanes.items[1].stack[2]`  
  Networking & APIs
- `Lanes.items[1].stack[3]`  
  Docker
- `Lanes.items[1].stack[4]`  
  Distributed Compute
- `Lanes.items[2].name`  
  Complex Data Products
- `Lanes.items[2].blurb`  
  Turning complex and unconventional data types into usable data for analytics: spatial and network data, document data and time series, owned end-to-end from raw data to insights.
- `Lanes.items[2].stack[0]`  
  Spatial
- `Lanes.items[2].stack[1]`  
  Graph
- `Lanes.items[2].stack[2]`  
  NoSQL/MongoDB
- `Lanes.items[2].stack[3]`  
  OCR
- `Lanes.items[2].stack[4]`  
  Data Validation
- `Lanes.items[3].name`  
  Analytics & ML
- `Lanes.items[3].blurb`  
  The analysis layer on top: nowcasting, ABM simulations, regressions, statistical methods and applied ML that ships: from hedonic price models, to image classification to statistically sound time series analyses.
- `Lanes.items[3].stack[0]`  
  Regression
- `Lanes.items[3].stack[1]`  
  Time Series
- `Lanes.items[3].stack[2]`  
  Simulations
- `Lanes.items[3].stack[3]`  
  Insights
- `Lanes.items[3].stack[4]`  
  Statistical Analysis

### Projects & Papers cards (also on /projects; the 2 KR&A cards sit last)

- `Projects.kicker`  
  Projects & papers: systems, products, research
- `Projects.titlePrefix`  
  Projects
- `Projects.titleItalic`  
  & papers.
- `Projects.subtitle`  
  Nine pieces of work across the four lanes: production systems, shipped products, and the research they make possible.
- `Projects.items[0].viz`  
  language
- `Projects.items[0].badge`  
  PROJECT
- `Projects.items[0].sector`  
  AI product
- `Projects.items[0].title`  
  LanguageBuddy: AI language tutor
- `Projects.items[0].outcome`  
  A self-hosted AI language tutor for Dutch, Italian and Spanish, built on language learning research that includes a chat or voice-call LLM tutor and SM-2 repetition. Every mistake is captured into a spaced-repetition queue that drives the next day's exercises and uses a real-news scraper for reading learning. Follows the CEFR framework with 6,200+ vocabulary entries and helps users reach CEFR alignment faster.
- `Projects.items[0].stack[0]`  
  FastAPI
- `Projects.items[0].stack[1]`  
  LLM
- `Projects.items[0].stack[2]`  
  TTS
- `Projects.items[0].stack[3]`  
  SQLite
- `Projects.items[0].stack[4]`  
  Docker
- `Projects.items[0].link`  
  /research/languagebuddy-ai-language-tutor
- `Projects.items[1].viz`  
  abm
- `Projects.items[1].badge`  
  RESEARCH
- `Projects.items[1].sector`  
  MSc Thesis · Bocconi
- `Projects.items[1].title`  
  Gentrification agent-based model
- `Projects.items[1].outcome`  
  My MSc Thesis research on gentrification, where I built an agent-based model of neighbourhood change: households interact with neighborhoods in the treated cities Amsterdam, Utrecht and Milan based on their own income, the affordability of the neighborhood and the attractiveness, based on elements such as streetview imagery 'beauty' classification, GTFS connectivity, greenery and neighborhood sentiment online. A two-tenure social-housing extension is in progress.
- `Projects.items[1].stack[0]`  
  Python/GeoPandas
- `Projects.items[1].stack[1]`  
  Large Vision Model
- `Projects.items[1].stack[2]`  
  PostGIS
- `Projects.items[1].stack[3]`  
  Agent-based Modeling
- `Projects.items[1].link`  
  /research/gentrification-abm-european-cities
- `Projects.items[2].viz`  
  pipelines
- `Projects.items[2].badge`  
  PROJECT
- `Projects.items[2].sector`  
  Engineering
- `Projects.items[2].title`  
  Research pipelines as production systems
- `Projects.items[2].outcome`  
  Every personal research project I undertake uses Airflow 3 data pipelines that are hosted in this project. It can scale from a laptop to a multi-machine CeleryExecutor cluster. This project was built with idempotency guards, custom operators and agentic monitoring.
- `Projects.items[2].stack[0]`  
  Airflow
- `Projects.items[2].stack[1]`  
  Celery
- `Projects.items[2].stack[2]`  
  Docker
- `Projects.items[2].stack[3]`  
  CI
- `Projects.items[2].stack[4]`  
  DuckDB
- `Projects.items[2].link`  
  /thoughts/research-pipelines-are-production-systems
- `Projects.items[3].viz`  
  sponsor
- `Projects.items[3].badge`  
  PROJECT
- `Projects.items[3].sector`  
  NLP · sequence tagging
- `Projects.items[3].title`  
  SponsoredBye: sponsor-segment detection
- `Projects.items[3].outcome`  
  A text-only sponsor-skipper for YouTube, built before YouTube Premium shipped one: sentence-T5 embeddings feed a BiLSTM sequence tagger that flags sponsored sentences and maps them back to timestamps, cutting segmentation error from 99% to 16% WindowDiff.
- `Projects.items[3].stack[0]`  
  TensorFlow
- `Projects.items[3].stack[1]`  
  BiLSTM
- `Projects.items[3].stack[2]`  
  sentence-T5
- `Projects.items[3].stack[3]`  
  MongoDB
- `Projects.items[3].stack[4]`  
  Huggingface
- `Projects.items[3].link`  
  /research/sponsoredbye-sponsored-segment-detection
- `Projects.items[4].viz`  
  fish
- `Projects.items[4].badge`  
  PROJECT
- `Projects.items[4].sector`  
  Mobile ML
- `Projects.items[4].title`  
  FishFinder: photo-to-species ID
- `Projects.items[4].outcome`  
  A Flutter app that identifies 63 Dutch fish species from a photo, fully on-device, and fills a Pokédex-style FishDex as you catch them. The training pipeline: ~3,000 hand-annotated photos masked with Segment Anything Model, then a fine-tuned ResNet50 compressed to an 8.8 MB TFLite model for on-device use.
- `Projects.items[4].stack[0]`  
  Flutter/Dart
- `Projects.items[4].stack[1]`  
  TFLite
- `Projects.items[4].stack[2]`  
  ResNet50
- `Projects.items[4].stack[3]`  
  Segment Anything Model (SAM)
- `Projects.items[4].stack[4]`  
  Firebase
- `Projects.items[4].link`  
  /research/fishfinder-on-device-fish-id
- `Projects.items[5].viz`  
  flood
- `Projects.items[5].badge`  
  RESEARCH
- `Projects.items[5].sector`  
  BSc Thesis · UvA
- `Projects.items[5].title`  
  Predicting flooding risk from local features
- `Projects.items[5].outcome`  
  My BSc thesis, looking at whether flood risk can be explained by local features instead of a black-box hydrodynamic simulation. Collected 33 features across ~45,000 European locations, such as ground imperviousness, ground type and distance to river, across 100GB+ of data and ran a Random Forest to find their relation. Findings: 97.5% on the binary 20-year flood question, with surrounding imperviousness and relative height doing most of the work.
- `Projects.items[5].stack[0]`  
  scikit-learn
- `Projects.items[5].stack[1]`  
  Random Forest
- `Projects.items[5].stack[2]`  
  raster data
- `Projects.items[5].stack[3]`  
  GIS
- `Projects.items[5].link`  
  /research/predicting-flooding-risk-local-features
- `Projects.items[6].viz`  
  connectivity
- `Projects.items[6].badge`  
  KR&A
- `Projects.items[6].sector`  
  Developed at KR&A
- `Projects.items[6].title`  
  Connectivity & walkability scoring
- `Projects.items[6].outcome`  
  A project led and conducted while working at KR&A: a saturation-validated connectivity and walkability score at parcel resolution, rolled out across 38 EU/NA/APAC markets, working with TBs of data and 100s of data sources.
- `Projects.items[6].stack[0]`  
  PostGIS
- `Projects.items[6].stack[1]`  
  S3
- `Projects.items[6].stack[2]`  
  Dijkstra & Network Science
- `Projects.items[6].stack[3]`  
  Distributed Compute
- `Projects.items[6].link`  
  https://connectivityscore.krafin.tech
- `Projects.items[7].viz`  
  hedonic
- `Projects.items[7].badge`  
  KR&A
- `Projects.items[7].sector`  
  Developed at KR&A
- `Projects.items[7].title`  
  Monthly house-price index · 13 EU countries
- `Projects.items[7].outcome`  
  A project conducted while working at KR&A: a web-scraping pipeline across 13 countries feeding a log-price hedonic regression; monthly indices tested as disaggregation indicators for Eurostat quarterly HPIs.
- `Projects.items[7].stack[0]`  
  Python
- `Projects.items[7].stack[1]`  
  Scrapy/Selenium
- `Projects.items[7].stack[2]`  
  PostGIS
- `Projects.items[7].stack[3]`  
  MongoDB
- `Projects.items[7].stack[4]`  
  R
- `Projects.items[7].link`  
  https://ec.europa.eu/eurostat/web/products-statistical-working-papers/w/ks-01-26-025
- `Projects.viewCase`  
  Read more
- `Projects.ctaAll`  
  See all papers

### Papers section (§ 05, list of published papers)

- `Papers.kicker`  
  Papers
- `Papers.titleItalic`  
  Papers
- `Papers.subtitle`  
  Methods, data and results behind the projects.
- `Papers.viewAll`  
  All papers →
- `Papers.empty`  
  Papers land here as they publish.


## About page (/about)

### Page copy

- `About.expertiseBadge`  
  Expertise
- `About.coreCompetencies`  
  Core Competencies
- `About.expertiseSubtitle`  
  Four competences, one constraint: a calibrated pipeline tends to outlast a clever one.
- `About.educationBadge`  
  Education
- `About.experienceBadge`  
  Experience
- `About.educationSubtitle`  
  AI as an undergraduate, data science and analytics as a graduate: the methods side of the toolkit. The production side came from work.
- `About.experienceSubtitle`  
  5+ years building and leading production data systems (pipelines, forecasting, geospatial) across European markets and academic research.
- `About.heroTitleLine1a`  
  Data
- `About.heroTitleLine1aItalic`  
  Lead
- `About.heroTitleLine2`  
  Engineering
- `About.heroTitleLine2Underline`  
  Systems
- `About.heroTitleLine3`  
  & Data.
- `About.lede1`  
  I'm Ian, a data engineer from Amsterdam. Two loves have shaped most of my choices: languages and complex problems. The first has me at five languages and pulled me to Italy for part of my studies. The second became my work: taking a messy, real-world problem and building the system that answers it. Cities are my favourite version of that problem, which is why my research keeps returning to urban dynamics: how neighbourhoods change, when a metro line moves prices, what makes a place reachable.
- `About.lede2`  
  My skillset: translating stakeholder requirements into sustainable business solutions that work.
- `About.journeyTitlePrefixItalic`  
  Five
- `About.journeyTitleRest`  
  years building
- `About.journeyTitleLine2`  
  production data systems.
- `About.expertise[0].name`  
  Data Engineering
- `About.expertise[0].blurb`  
  Building and maintaining pipelines and efficient storage: three years of weekly collection across 8 authenticated sources at 300k records a week, with schema, orchestration and failure handling designed up front.
- `About.expertise[0].stack[0]`  
  Airflow
- `About.expertise[0].stack[1]`  
  Python
- `About.expertise[0].stack[2]`  
  ETL
- `About.expertise[0].stack[3]`  
  Monitoring
- `About.expertise[0].stack[4]`  
  Iceberg
- `About.expertise[1].name`  
  Analytics & ML
- `About.expertise[1].blurb`  
  The analysis layer on top: nowcasting on sparse official statistics, a monthly house-price index across 13 EU countries, regressions and hedonic pricing, and simulations such as agent-based gentrification models.
- `About.expertise[1].stack[0]`  
  Regression
- `About.expertise[1].stack[1]`  
  Time Series
- `About.expertise[1].stack[2]`  
  ABM Simulations
- `About.expertise[1].stack[3]`  
  Applied ML
- `About.expertise[2].name`  
  System Architecture
- `About.expertise[2].blurb`  
  The platform underneath: server instances, PostGIS, distributed Iceberg compute, networking/VPN, APIs and security. 13 different services run as production infrastructure.
- `About.expertise[2].stack[0]`  
  Linux/Bash
- `About.expertise[2].stack[1]`  
  Networking & APIs
- `About.expertise[2].stack[2]`  
  Docker
- `About.expertise[2].stack[3]`  
  Distributed Compute
- `About.expertise[2].stack[4]`  
  S3
- `About.expertise[3].name`  
  Product Ownership
- `About.expertise[3].blurb`  
  End-to-end ownership from method to shipped API: a 13-server build, client stakeholders from pension funds to statistics bureaus, and a team of 4–5 led at KR&A.
- `About.expertise[3].stack[0]`  
  Team of 4–5
- `About.expertise[3].stack[1]`  
  Stakeholders
- `About.expertise[3].stack[2]`  
  Roadmap
- `About.expertise[3].stack[3]`  
  Shipped APIs
- `About.downloadCv`  
  Download the CV (PDF)
- `About.cvBelow`  
  Full CV below

### Resume content
*Lives in `frontend/data/resume.js` (EN-only by design); also renders the downloadable CV PDF.*

- `resumeSections.kicker`  
  Resume
- `resumeSections.engineering`  
  Professional Experience
- `resumeSections.research`  
  Research Topics
- `resumeSections.education`  
  Education
- `resumeSections.stack`  
  Stack
- `resumeSections.languages`  
  Languages & Soft Skills
- `resume.header.name`  
  Ian Ronk
- `resume.header.roleLine`  
  Head of Data · Engineer & Researcher
- `resume.header.location`  
  Amsterdam, NL
- `resume.header.email`  
  ian@ronk.org
- `resume.header.links[0].label`  
  LinkedIn
- `resume.header.links[0].url`  
  https://LinkedIn
- `resume.header.links[1].label`  
  GitHub
- `resume.header.links[1].url`  
  https://GitHub
- `resume.header.links[2].label`  
  ianronk.nl
- `resume.header.links[2].url`  
  https://ianronk.nl
- `resume.header.languages`  
  Dutch C2 · English C2 · Italian B2/C1 · German B2 · Spanish A2
- `resume.header.softSkills`  
  Multi-year project management · Client & stakeholder communication · Presenting and defending methodology to technical and senior audiences · Reliability
- `resume.header.summary`  
  Production data systems and the data engineering behind research: Airflow, DuckDB and PostGIS pipelines that turn open spatial data into papers. Leads a team of 4 as Head of Data; interest in research on urban dynamics.
- `resume.engineering[0].role`  
  Head of Data
- `resume.engineering[0].org`  
  KR&A
- `resume.engineering[0].orgNote`  
  Amsterdam
- `resume.engineering[0].period`  
  Jul 2025 – present
- `resume.engineering[0].bullets[0]`  
  Lead a team of 4 through a transformation of the product offering, serving pension funds and leading FinTechs.
- `resume.engineering[0].bullets[1]`  
  Develop, maintain and expand data pipelines (e.g. a weekly scrape of 300k records) and spatial big data products.
- `resume.engineering[0].bullets[2]`  
  Delivered a global connectivity score: 1TB+ processed across 13 servers into a production API.
- `resume.engineering[0].bullets[3]`  
  Represent the data function with clients: defending methodology against PhD-level scrutiny, presenting to portfolio managers and senior stakeholders.
- `resume.engineering[0].bullets[4]`  
  Drive AI adoption: OCR and LLM document extraction, agentic pipeline monitoring, agent-assisted development.
- `resume.engineering[1].role`  
  Independent Researcher
- `resume.engineering[1].org`  
  urban dynamics
- `resume.engineering[1].period`  
  2025 – present
- `resume.engineering[1].bullets[0]`  
  Self-directed research programme: two working papers and a method paper in preparation (see Research), each backed by an open, reproducible pipeline.
- `resume.engineering[2].role`  
  Medior Data Scientist
- `resume.engineering[2].org`  
  KR&A
- `resume.engineering[2].period`  
  Jun 2022 – Jul 2025
- `resume.engineering[2].bullets[0]`  
  Project lead for two multi-year projects, including a 3-year hedonic house-price-index project for Eurostat: scraping, storing and managing the data, building the regressions, interpreting results.
- `resume.engineering[2].bullets[1]`  
  Restructured data infrastructure from legacy systems to Airflow, Iceberg and FastAPI.
- `resume.engineering[2].bullets[2]`  
  Client-facing throughout, with CBS, Eurostat and pension funds.
- `resume.engineering[3].role`  
  Junior Data Scientist
- `resume.engineering[3].org`  
  KR&A
- `resume.engineering[3].period`  
  Oct 2021 – Jun 2022
- `resume.engineering[3].bullets[0]`  
  Flood-occurrence prediction from alternative data (BSc-thesis project); 90%+ accuracy in risk classification.
- `resume.engineering[3].bullets[1]`  
  Improved API efficiency tenfold through spatial optimisations, resulting in promotion.
- `resume.engineering[4].role`  
  Junior Full-Stack Developer
- `resume.engineering[4].org`  
  Exact (former SRXP)
- `resume.engineering[4].orgNote`  
  part-time
- `resume.engineering[4].period`  
  Sep 2019 – Sep 2022
- `resume.engineering[4].bullets[0]`  
  Enterprise expense-declaration software (EmberJS, PHP) under CI/CD and testing.
- `resume.engineering[4].bullets[1]`  
  Maintained a client-facing webapp, working on business logic and styling.
- `resume.research[0].title`  
  Calibrating Free Postcode Boundaries from OpenStreetMap
- `resume.research[0].venue`  
  Release August 2026
- `resume.research[0].year`  
  2026
- `resume.research[0].result`  
  Seed-density-to-IoU calibration of an OSM-Voronoi pipeline; NL/DK references, transfer to BE, applied to Italy's 4,209 CAP polygons.
- `resume.research[0].href`  
  /research/voronoi-postcodes-paper
- `resume.research[1].title`  
  When Does Metro Infrastructure Capitalize into Property Prices?
- `resume.research[1].venue`  
  Release September 2026
- `resume.research[1].year`  
  2026
- `resume.research[1].result`  
  Phase-decomposed DiD across seven European cities, n = 42,004; wild-cluster-bootstrap inference. Found some correlation, but not strong.
- `resume.research[1].href`  
  /research/when-metro-capitalizes-paper
- `resume.research[2].title`  
  A Multi-Modal Accessibility Score for NA, EU and APAC: Construction, Decomposition, and Compute
- `resume.research[2].venue`  
  Research by KR&A
- `resume.research[2].year`  
  2026
- `resume.research[2].href`  
  https://connectivityscore.krafin.tech
- `resume.research[3].title`  
  Building an Agent-Based Model to Explain Gentrification in European Cities
- `resume.research[3].venue`  
  (MSc thesis, 8/8)
- `resume.research[3].year`  
  2025
- `resume.research[3].result`  
  Amsterdam · Utrecht · Milan.
- `resume.research[3].href`  
  /research/gentrification-abm-european-cities
- `resume.education[0].degree`  
  MSc Data Science & Business Analytics
- `resume.education[0].institution`  
  Bocconi University
- `resume.education[0].grade`  
  107/110
- `resume.education[0].period`  
  2023 – 2025
- `resume.education[0].note[0]`  
  Focus: Finance · Econometrics · Statistics · NLP
- `resume.education[0].note[1]`  
  Thesis: Building an Agent-Based Model to Explain Gentrification in European Cities
- `resume.education[1].degree`  
  BSc Artificial Intelligence
- `resume.education[1].institution`  
  University of Amsterdam
- `resume.education[1].grade`  
  7.6/10
- `resume.education[1].period`  
  2019 – 2023
- `resume.education[1].note[0]`  
  Minor in Linguistics, University of Amsterdam
- `resume.education[1].note[1]`  
  Erasmus minor, Università di Bologna (UNIBO)
- `resume.stack[0]`  
  Python
- `resume.stack[1]`  
  SQL
- `resume.stack[2]`  
  PostGIS
- `resume.stack[3]`  
  Airflow
- `resume.stack[4]`  
  DuckDB
- `resume.stack[5]`  
  PyTorch
- `resume.stack[6]`  
  MLflow
- `resume.stack[7]`  
  Bash
- `resume.stack[8]`  
  LLM pipelines


## Projects & Papers page (/projects)
*Cards come from the Projects namespace above; the papers list below it:*

- `Research.loadingFallback`  
  Paper index is temporarily unreachable. Try again in a moment.
- `Research.title`  
  Research & Articles
- `Research.searchPlaceholder`  
  Search articles...
- `Research.readMore`  
  Read more
- `Research.noResults`  
  No articles found matching your criteria.
- `Research.loading`  
  Loading research articles...
- `Research.previewBadge`  
  Research & Blog
- `Research.viewAll`  
  View All
- `Research.listKicker`  
  Research: papers & methods
- `Research.listTitleItalic`  
  Papers
- `Research.listSubtitle`  
  Working papers, preprints and method write-ups on research in urban dynamics, network analysis, geospatial methods and data science.
- `Research.previewTitlePrefix`  
  Selected
- `Research.previewTitleItalic`  
  papers
- `Research.previewSubtitleShort`  
  Recent work on urban dynamics, geospatial methods and large-scale European spatial-data engineering.
- `Research.loadingArticle`  
  Loading article...
- `Research.backToResearch`  
  Back to Research
- `Research.articleNotFound`  
  Article not found
- `Research.articleNotFoundBody`  
  The requested research article doesn't exist.
- `Research.browseAll`  
  Browse all articles
- `Research.byAuthor`  
  by
- `Research.youMightAlsoLike`  
  You might also like
- `Research.readArticle`  
  Read article
- `Research.endCtaKicker`  
  § Next
- `Research.endCtaHeading`  
  Questions about a method, a dataset or a role? Get in touch.
- `Research.endCtaButton`  
  Get in touch
- `Research.indexDiscuss`  
  Get in touch


## Blogs page (/thoughts)
*A single list of entries: case studies AND papers, newest first.*

- `Thoughts.loadingFallback`  
  No posts yet. The first case studies, on the data engineering behind the research, are in the works.
- `Thoughts.kicker`  
  Work: case studies & field notes
- `Thoughts.recentTitle`  
  Recent
- `Thoughts.recentItalic`  
  work
- `Thoughts.subtitle`  
  Case studies and papers, newest first: what got built, what broke, and what it changed.
- `Thoughts.loading`  
  Loading…
- `Thoughts.featuredKicker`  
  Featured ·
- `Thoughts.readPiece`  
  Read the piece →
- `Thoughts.readShort`  
  Read →
- `Thoughts.viewAll`  
  View all →
- `Thoughts.backToList`  
  ← Back to work
- `Thoughts.notFoundTitle`  
  Post not
- `Thoughts.notFoundItalic`  
  found
- `Thoughts.notFoundBody`  
  hasn't been published yet.
- `Thoughts.notFoundBodyPrefix`  
  The post at
- `Thoughts.bylinePrefix`  
  Written by
- `Thoughts.bylineSuffix`  
  · Amsterdam
- `Thoughts.minRead`  
  min read
- `Thoughts.endCtaKicker`  
  § More
- `Thoughts.endCtaTitle`  
  More writing on the
- `Thoughts.endCtaTitleItalic`  
  blog.
- `Thoughts.endCtaBody`  
  Browse other essays on geodata, AI/ML and operations, or read more about who's behind the writing.
- `Thoughts.endCtaButton`  
  More writing
- `Thoughts.endCtaSecondary`  
  About me
- `Thoughts.endCtaContact`  
  Questions about the build? Get in touch
- `Thoughts.relatedKicker`  
  Related work
- `Thoughts.empty`  
  No posts yet. The first case studies, on the data engineering behind the research, are in the works.


## Contact page (/contact) + homepage contact band

- `Contact.aboutBadge`  
  About Me
- `Contact.name`  
  Ian Ronk
- `Contact.roleTitle`  
  Head of Data · Engineer & Researcher
- `Contact.bio`  
  I am Ian and I build and maintain production data systems and the analytics on top, from any complex data type: weekly high-volume web-scraped data, geospatial, graph or tabular data. I answer stakeholder questions using this data.
- `Contact.location`  
  Amsterdam, Netherlands
- `Contact.company`  
  Head of Data · KR&A, Amsterdam
- `Contact.yearsExperience`  
  5+ years in data engineering & spatial analytics
- `Contact.formSubtitle`  
  Questions about a role, research or collaboration? The inbox is open.
- `Contact.formTitle`  
  Get in Touch
- `Contact.nameLabel`  
  Name
- `Contact.namePlaceholder`  
  Your name
- `Contact.emailLabel`  
  Email
- `Contact.emailPlaceholder`  
  your@email.com
- `Contact.phoneLabel`  
  Phone (Optional)
- `Contact.phonePlaceholder`  
  +31 6 12345678
- `Contact.subjectLabel`  
  Subject
- `Contact.subjectPlaceholder`  
  What's this about?
- `Contact.messageLabel`  
  Message
- `Contact.messagePlaceholder`  
  Your message
- `Contact.captchaLabel`  
  Verify you're human
- `Contact.captchaHint`  
  Please complete the captcha to send your message
- `Contact.sendButton`  
  Send Message
- `Contact.sending`  
  Sending...
- `Contact.privacy`  
  Your message is encrypted and only used to reply to you.
- `Contact.successMessage`  
  Message sent. I'll get back to you soon.
- `Contact.errorEmail`  
  Please enter a valid email address
- `Contact.errorSpam`  
  Your message was flagged as potential spam. Please try again.
- `Contact.errorShort`  
  Please enter a longer message (at least 10 characters)
- `Contact.errorCaptcha`  
  Please complete the captcha verification
- `Contact.errorGeneric`  
  Error sending message. Please try again.
- `Contact.sectionKicker`  
  Contact: roles, collaborations, questions
- `Contact.letsTalkPrefix`  
  Let's
- `Contact.letsTalkItalic`  
  talk
- `Contact.formHeadRef`  
  REF
- `Contact.bandLine1`  
  Questions,
- `Contact.bandLine2Italic`  
  ideas, roles?
- `Contact.bandLine3`  
  Get in touch.
- `Contact.linkLinkedIn`  
  LinkedIn
- `Contact.linkGitHub`  
  GitHub
- `Contact.linkBookCall`  
  Book a call


## Widgets

### Newsletter

- `Newsletter.compactHeading`  
  Notes from the field
- `Newsletter.compactDescription`  
  Occasional notes on geospatial methods, ML pipelines and what breaks in production.
- `Newsletter.inlineHeading`  
  Get the next post by email
- `Newsletter.inlineDescription`  
  Occasional. No spam. Unsubscribe any time.
- `Newsletter.homeThoughtsHeading`  
  Get the next piece.
- `Newsletter.homeThoughtsDescription`  
  Notes from the field: occasional pieces on urban dynamics, geospatial methods and what breaks in production.
- `Newsletter.emailPlaceholder`  
  you@domain.com
- `Newsletter.submit`  
  Subscribe
- `Newsletter.success`  
  Thanks, you're on the list.
- `Newsletter.error`  
  Something went wrong. Try again or email directly.
- `Newsletter.privacy`  
  We won't share your address.

### Share

- `Share.label`  
  Share
- `Share.linkedin`  
  LinkedIn
- `Share.twitter`  
  X / Twitter
- `Share.copy`  
  Copy link
- `Share.copied`  
  Copied


## Page metadata (SEO descriptions)
*Hardcoded in the page files noted; shown in Google results and link previews, not on the page itself.*

- `about.metadata.title` (frontend/app/[locale]/about/page.jsx)  
  Resume & competences: Head of Data
- `about.metadata.description` (frontend/app/[locale]/about/page.jsx)  
  Resume of Ian Ronk, data lead and geodata specialist based in Amsterdam: competences across big data, network science, forecasting and spatial analysis, plus experience, education and publications.
- `projects.metadata.description` (frontend/app/[locale]/projects/page.jsx)  
  Projects and papers by Ian Ronk: production data systems, shipped products, and research on urban dynamics, housing markets and geospatial methods.
- `thoughts.metadata.title` (frontend/app/[locale]/thoughts/page.jsx)  
  Work: case studies & field notes
- `thoughts.metadata.description` (frontend/app/[locale]/thoughts/page.jsx)  
  Case studies, papers and field notes from shipped data projects (pipelines, forecasting, geospatial methods) by Ian Ronk, data lead in Amsterdam.
- `contact.metadata.description` (frontend/app/[locale]/contact/page.jsx)  
  Contact Ian Ronk, data lead and urban-dynamics researcher based in Amsterdam. Questions about the research, the pipelines, a role or a collaboration.
- `site.metadata.title` (frontend/app/layout.tsx)  
  Ian Ronk | Head of Data: data systems, analytics, and urban-dynamics research


## Currently unused (kept for reference)
*Not rendered anywhere right now; skip unless you want them revived.*

### Proof

- `Proof.kicker`  
  Proof: outcomes that shipped
- `Proof.titlePrefix`  
  Things that
- `Proof.titleItalic`  
  shipped
- `Proof.titleSuffix`  
  and stuck.
- `Proof.outcomes[0].value`  
  13
- `Proof.outcomes[0].unit`  
  EU countries · one pipeline
- `Proof.outcomes[0].context`  
  Monthly house-price index · tested with Eurostat
- `Proof.outcomes[1].value`  
  1 score
- `Proof.outcomes[1].unit`  
  every parcel · saturation-validated
- `Proof.outcomes[1].context`  
  Connectivity Score · 13-server build
- `Proof.outcomes[2].value`  
  300k
- `Proof.outcomes[2].unit`  
  records a week · 8 sources · 3 years
- `Proof.outcomes[2].context`  
  Web-scraping pipeline · feeds the monthly house-price index
- `Proof.ctaPrimary`  
  Download the CV (PDF)
- `Proof.ctaSecondary`  
  Get in touch

### AboutPage

- `AboutPage.readMore`  
  Read more
- `AboutPage.backToAbout`  
  Back to About


---
**Total: 2,586 words.**
