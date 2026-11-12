# RARE Daily Implementation Plan

**Goal:** Ship an English daily trivia game on Cloudflare, with less obvious correct answers earning more points.

**Architecture:** A Worker serves static HTML/CSS/JS and an anonymous JSON API. D1 owns sessions, round clocks, results and answer statistics. Answer lists never enter the public assets. UTC determines the daily puzzle; a versioned deterministic schedule gives everyone the same five questions. Initial rarity tiers are editorial, explicitly disclosed, and fixed for equal daily scores.

**Tech Stack:** Cloudflare Workers static assets, D1, TypeScript, vanilla browser JavaScript, Wrangler.

## Design
An editorial puzzle journal: cream paper, forest green, coral accents, large serif headings, geometric orbit motif. Responsive and keyboard accessible. Main screen offers a daily challenge, instructions, local statistics, unlimited practice, an archive and real leaderboard. No fabricated player counts or traffic claims.

## Tasks
1. Create curated English question bank, aliases and deterministic scheduling; unit test normalization and scoring.
2. Create append-only D1 schema for anonymous daily attempts, bounded timed rounds, and aggregate answer counts.
3. Implement APIs for puzzle discovery, session resume, atomic answers/timeout, results and leaderboard. Cookie identifies browser, opaque token identifies session. Validate lengths, mode and dates, enforce same origin and server clocks. Do not trust client scores.
4. Build welcome/play/result views, help and archive dialogs, retry states, share fallback, countdown, local progress and reduced motion.
5. Typecheck; run rule and HTTP integration tests against local D1; inspect desktop/mobile in a browser.
6. If Cloudflare authentication exists, create isolated D1 database, apply migrations and deploy using Wrangler. Otherwise provide runnable source and exact deploy steps, identifying the login requirement.

## Limits
Curated starter bank repeats as a scheduled rotation; growing it is content work. Anonymous daily enforcement is per browser, not strong identity. No multiplayer or paid products. Initial rarity is authored, not asserted to represent population survey data.
