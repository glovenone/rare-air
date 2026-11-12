# RARE — A little less obvious.

English daily trivia, deployed on Cloudflare Workers + D1.

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
- Curated answer bank: 30 question sets, accepted aliases, four rarity tiers worth 100, 250, 500 and 1,000 points. Invalid/skipped/expired answers get zero.
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

This is a starter launch edition. The 30-set bank repeats; expand it for sustained daily publishing. Changing the bank changes deterministic schedules; preserve a dated/versioned bank before running an established live daily calendar. Rarity improvements should use frozen historical snapshots so every player has the same scoring on a given date.

Anonymous identity is per cookie, not a verified person. Clearing cookies creates another identity. No strong anti-bot control or global request quota is included; add Cloudflare rate limiting/Turnstile for larger public launches. The basic cap is 30 new sessions per browser per hour. No traffic-scale/load test or revenue claim is made.

D1 stores opaque player IDs, game state and chosen answers. No account emails or advertising IDs. Local storage holds stats. Production resources are separate from Wrangler's ignored local development database. Wrangler may use paid quotas according to the account plan.

To attach a domain: configure a Workers custom domain in Cloudflare Dashboard for `rare-daily`; no source changes needed.
