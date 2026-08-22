---
title: "LanguageBuddy — an AI language tutor that turns conversation into curriculum"
slug: languagebuddy-ai-language-tutor
excerpt: "A self-hosted AI tutor for Dutch, Italian and Spanish: chat or voice-call an LLM tutor, and every word you stumble on is scheduled into spaced repetition, next-day exercises and printable workbooks."
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
preview_image: ""
is_premium: false
---

# LanguageBuddy

## What it is

LanguageBuddy is a self-hosted AI language tutor for Dutch, Italian and Spanish, covering CEFR levels A1 through C1. The premise: the most useful moments in language learning happen in free conversation, and most apps throw those moments away. LanguageBuddy keeps them — every word you stumble on while chatting or voice-calling the tutor becomes tomorrow's study material.

## How it works

A learner starts with an **adaptive CEFR placement exam** that scores vocabulary, reading, listening, writing and speaking as five independent skills, with branching difficulty. From there the system builds a personalized daily lesson plan:

- cloze, grammar, translation and matching drills;
- listening items generated with neural text-to-speech;
- reading comprehension built from **that day's real news articles** (NOS, ANSA, EFE), scraped, cleaned and levelled;
- writing prompts graded by an LLM against a CEFR rubric.

The heart of the system is the **closed learning loop**. Free-form chat with a level-adapted LLM tutor — including a hands-free voice-call mode using in-browser speech recognition plus TTS — is monitored for mistakes. Each one is extracted, lemmatized, and scheduled by an SM-2 spaced-repetition engine, then resurfaces in the next day's exercises and in a personalized, printable PDF workbook for offline study. Duolingo-style gamification (XP with combo multipliers, streaks, hearts, milestones) keeps the daily loop sticky.

## Engineering

The backend is FastAPI on Python 3.12 with a 35-table SQLite schema tracking sessions, transcripts, per-skill CEFR levels, vocabulary evidence and progression. The LLM and TTS providers sit behind an abstraction so the whole AI backend swaps via configuration. The frontend is an installable PWA with push notifications. Everything runs as a small Docker Compose stack with hardened containers: read-only root filesystem, dropped Linux capabilities, tmpfs-only scratch space, health checks on every service.

The content layer is hand-curated at unusual scale for a personal project: **6,200+ vocabulary entries** across A1–C1 in multiple languages, 177 conversation scenarios, grammar topic sets and verb conjugation tables — about 2 MB of curated language data. The codebase is ~20,000 lines of Python behind a **336-test suite**, including per-language end-to-end tests and dedicated CEFR-assessment tests.

## Status

In active development and self-hosted. A cost analysis keeps the conversational loop economical (a 15-exchange tutoring session costs a few cents in API calls), which is what makes a personal-infrastructure deployment realistic.
