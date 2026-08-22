---
title: "LanguageBuddy — an AI language tutor that turns conversation into curriculum"
slug: languagebuddy-ai-language-tutor
excerpt: "A self-hosted AI tutor for Dutch, Italian and Spanish: chat or voice-call an LLM tutor, and every word you stumble on gets lemmatized, scheduled by SM-2 spaced repetition, and served back as tomorrow's exercises and a printable workbook."
status: published
category: project
publication_status: ""
tags: ["llm", "language-learning", "fastapi", "spaced-repetition", "tts", "product"]
abstract: "A self-hosted AI language learning platform for Dutch, Italian and Spanish (A1–C1). An adaptive CEFR placement exam scores five skills independently; daily lesson plans combine drills, listening generated with neural TTS, reading comprehension built from that day's real news, and LLM-graded writing. Free conversation — text or hands-free voice call — feeds a closed learning loop: mistakes are captured, lemmatized and scheduled by SM-2 spaced repetition into the next day's exercises and printable PDF workbooks."
read_time: "6 min"
date: "2026"
doi: ""
arxiv_id: ""
repo_url: ""
cite_as: ""
preview_image: "/projects/languagebuddy-ai-language-tutor/home-dashboard.png"
is_premium: false
---

# LanguageBuddy

## The premise

The best moments in language learning happen mid-conversation — the word you reach for and don't have, the article you get wrong, the verb you conjugate on vibes. Most apps let those moments evaporate. LanguageBuddy is my answer: a self-hosted AI tutor for Dutch, Italian and Spanish (CEFR A1–C1) where nothing you stumble on is ever thrown away. Every mistake becomes tomorrow's study material.

![LanguageBuddy home dashboard showing streak, words learned, accuracy, daily XP, A1-to-A2 progress and the daily practice checklist](/projects/languagebuddy-ai-language-tutor/home-dashboard.png)
*The daily loop: streak, accuracy, XP, level progress, and a four-part practice checklist — real data from my own account.*

## Talk first, drill later

You start with an adaptive CEFR placement exam that scores vocabulary, reading, listening, writing and speaking as five independent skills, branching difficulty as it goes. Your overall level is your weakest skill — no hiding behind a strong reading score.

Then you talk. The core of the app is free conversation with a level-adapted LLM tutor: 177 role-play scenarios — ordering at the bakker, arguing with the huisarts, small talk with the buren — in text, or fully hands-free voice calls using in-browser speech recognition plus neural TTS.

![Chat view with a sidebar of Dutch role-play scenarios: Supermarkt, Restaurant, Huisarts, Openbaar vervoer and more](/projects/languagebuddy-ai-language-tutor/chat-scenarios.png)
*Pick a scenario, type or call. The tutor stays in character and at your level.*

While you chat, the system is quietly listening for mistakes. Each one gets extracted, lemmatized and fed into an SM-2 spaced-repetition engine — the same algorithm family Anki uses. Those words resurface in the next day's exercises and in a personalized, printable PDF workbook for offline study. Conversation in, curriculum out. That's the closed loop.

## The daily grind, made sticky

Each morning the system assembles a lesson plan: cloze, grammar, translation and matching drills; listening items generated with neural text-to-speech; reading comprehension built from that day's actual news (NOS, ANSA, EFE — scraped, cleaned and levelled); and writing prompts graded by an LLM against a CEFR rubric. Duolingo-style gamification — XP with combo multipliers, streaks, hearts, milestones — keeps me coming back.

![Vocabulary translate exercise asking for the Dutch word for 'underwear', with progress dots and a Check Answer button](/projects/languagebuddy-ai-language-tutor/practice-exercise.png)
*A vocab drill mid-session. Yesterday's conversational stumbles become today's questions.*

None of the scheduling is improvised. I wrote up the learning methodology as a proper document — forgetting curves, retrieval practice, and the full SM-2 interval and easiness-factor math the engine runs on.

![Page from the learning methodology document explaining the SM-2 spaced repetition algorithm, its parameters and interval schedule](/projects/languagebuddy-ai-language-tutor/methodology-page.png)
*From the methodology doc (written under the app's Dutch working name, Taalmaatje): the SM-2 parameters and interval schedule behind every review.*

## Under the hood

The backend is FastAPI on Python 3.12 with a 35-table SQLite schema tracking sessions, transcripts, per-skill CEFR levels, vocabulary evidence and progression. LLM and TTS providers sit behind an abstraction layer, so the entire AI backend swaps via configuration. The frontend is an installable PWA with push notifications for daily nudges.

The content layer is hand-curated at a scale I'm a little proud of: 6,200+ vocabulary entries across A1–C1 in multiple languages, the 177 scenarios, grammar topic sets and verb conjugation tables — about 2 MB of curated language data.

The ~20,000 lines of Python behind it were built with **agentic coding** — AI agents writing most of the code, with me directing. What keeps that from being vibe-coding is the harness the agents work inside: a written blueprint that pins down behaviour before any code is generated, a **336-test suite** — per-language end-to-end tests and dedicated CEFR-assessment tests — that every change has to pass before it lands, and adversarial review passes where a second agent's job is to break what the first one wrote. The agents type; the spec and the tests decide.

It ships as a small Docker Compose stack with hardened containers: read-only root filesystem, dropped Linux capabilities, tmpfs-only scratch space, health checks on every service.

![Progress page with overall CEFR level, words tracked, exercises done, per-skill breakdown and milestone timeline](/projects/languagebuddy-ai-language-tutor/progress-page.png)
*Progress is per-skill, with milestones logged along the way — your level is only as good as your weakest skill.*

## Status

In active development, self-hosted, and in daily use by its first three users — friends learning alongside me. A cost analysis keeps the conversational loop economical: a 15-exchange tutoring session costs a few cents in API calls, which is exactly what makes running your own tutor on personal infrastructure realistic.
