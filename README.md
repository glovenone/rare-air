# RARE DIVE — Below the ordinary.

A full-screen pixel-ocean English daily trivia game, deployed on Cloudflare Workers + D1.

Live: https://rare-daily.happycoin8899.workers.dev

## Run locally

```sh
npm ci
npm run db:local
npm run dev
```

Open http://localhost:8787. No external API keys or AI service required.

## Verify

```sh
npm run check
npm test
# With local development server running:
node test/api.integration.mjs
```

The integration test creates local game records. Run against the local URL, not production. Test rules cover every alias, normalized spelling, scoring tiers, deterministic dates and absence of public answer keys.

## Deploy to the configured Cloudflare account

```sh
npm run db:remote
npm run deploy
```

The tracked Wrangler file refers to the dedicated `rare-daily-db` database. For a different account run `npx wrangler login`, `npx wrangler d1 create rare-daily-db`, replace `database_id`, apply migrations, then deploy. The database ID is a resource identifier, not a credential. Authentication remains in Wrangler's user configuration.

## Game

- Five prompts per daily game, 30 seconds for each; daily reset at midnight UTC (08:00 China time).
- One attempt per browser per date. Practice gets a new random seed. Daily dates use a deterministic versioned shuffle.
- Curated answer bank: 400 question sets, accepted aliases, four rarity tiers worth 100, 250, 500 and 1,000 points. Invalid/skipped/expired answers get zero.
- Rarity is editorial, clearly explained in the game. It is not a population survey. Answers are stored in D1 so aggregate answer distributions can be analyzed later.
- Refreshing restores the current daily game. Elapsed time comes from the server. Leaving freezes no clock; an expired pending round is recorded when resumed and submitted, then the next round starts.
- Atomic D1 batches and unique round keys prevent duplicate scoring. Scores are derived server-side. Active sessions never expose their answer lists.
- Completed daily games appear under generated anonymous names on the top-20 leaderboard. Ties use game creation time.
- Browser-local daily statistics and a copyable spoiler-free scorecard; clipboard denial falls back to visible copyable text.

## Structure

- `src/worker.ts`: static assets, JSON API, origin checks, anonymous ownership, session clock, D1 records.
- `src/questions.js`: server-only question bank, answer normalization, scoring, puzzle schedule. Add prompts here; do not move this file into `public/`.
- `public/`: responsive buildless frontend, no external assets or trackers.
- `migrations/`: immutable ordered D1 schema migrations.
- `test/`: rule tests and real local Worker/D1 lifecycle tests.

## Content and operations

The bank contains 30 immutable legacy prompts, 270 expansion prompts, and the November 13 daily batch of 100 new prompts. Practice uses all 400 immediately; the new daily pool starts November 13, 2026 UTC. Dated packs are append-only and filtered by release date, so later packs cannot change old daily puzzles. Every new session stores exact question and scoring snapshots; pre-migration sessions retain the legacy bank. See `content/EDITORIAL.md` for content quality and publishing rules. Rarity is editorial, not a measured answer frequency.

Anonymous identity is per cookie, not a verified person. Clearing cookies creates another identity. No strong anti-bot control or global request quota is included; add Cloudflare rate limiting/Turnstile for larger public launches. The basic cap is 30 new sessions per browser per hour. No traffic-scale/load test or revenue claim is made.

D1 stores opaque player IDs, game state and chosen answers. No account emails or advertising IDs. Local storage holds stats. Production resources are separate from Wrangler's ignored local development database. Wrangler may use paid quotas according to the account plan.

To attach a domain: configure a Workers custom domain in Cloudflare Dashboard for `rare-daily`; no source changes needed.

## Daily 100-question task

Codex automation `rare-100` runs daily at 07:00 Asia/Shanghai, beginning November 13, 2026. It creates `content/packs/YYYY-MM-DD-daily.json`, verifies 100 distinct prompts, builds, tests, and deploys with the existing Wrangler authorization. The local computer and Codex app need to be running. Runs consume Codex usage; no separate AI API is configured. A failed run does not silently count as a published batch.

Use `npm run bank:build` to validate packs and regenerate server-only `src/bank.js`. Each daily pack must have exactly 100 prompts. Public `/api/puzzle` reports `bankSize` and `latestBatch` for deployment verification, without exposing answers.

## Pixel-ocean interface

The surface is the playable start screen. The original canvas scene (`public/ocean.js`) draws a boat, clouds, waves, fish, bubbles, plants, jellyfish and an original diving robot. The camera follows score-derived depth (2 meters per point, maximum 10,000m); animated HUD numbers match earned server scores. Sound is off by default and only enabled by user input. Reduced-motion settings freeze ambient drift and remove interpolation.

An answer now leads to a rarity/reward screen. The server stores `started=0` between rounds. `/api/next` starts the clock exactly once and reveals the next prompt; repeated calls do not reset it. While waiting, `/api/resume` and `/api/answer` responses never reveal the next prompt or a running deadline. The last answer also has a result moment before the full dive report. Legacy sessions and scores are preserved. The daily task continues to maintain the same bank.

Fonts: locally hosted VT323 and Press Start 2P, with their SIL Open Font Licenses alongside the font files. No reference-game artwork, sprites, source code or data is bundled.

Search content: `/games-like-krillion/` explains the independent alternative and links the original honestly. robots.txt and sitemap.xml include the public pages and exclude APIs. Titles/descriptions/canonical URLs target the currently deployed workers.dev origin; update all three after binding a custom domain. Search Console submission and measured ranking/traffic are not configured or promised.
