# RARE question publishing

## Daily contract
At 07:00 Asia/Shanghai the Codex task adds exactly 100 new verified English prompts. Local computer and Codex must be running; this is not a Cloudflare Cron trigger. It uses existing Codex usage and Wrangler authorization, not a separate paid AI API. A scheduled attempt can fail; only a successful deployment is publication.

## Files
`content/packs/<date>-daily.json` is one append-only dated batch. Initial expansion lives in `2026-11-12-expansion.json` (270 new questions, plus 30 legacy questions). Generate `src/bank.js` with `npm run bank:build`. Do not edit that generated file by hand. It is server-only.

Pack schema:
```json
{"batch":"2026-11-13-daily","releasedOn":"2026-11-14","questions":[{"id":"unique-slug","category":"SCIENCE","prompt":"Name ...","explanation":"Scope and judging notes.","sources":["https://primary-source.example/relevant-page"],"answers":[{"label":"Canonical answer","aliases":["Common variant"],"tier":1}]}]}
```
Never use a placeholder source URL. Read the sources. Every new question needs 3–60 different valid answers, no ambiguous or overlapping normalized aliases, a specific scope and a complete answer list within that scope. Initial legacy prompts retain their existing content and scores.

## Quality
- Distinct ideas, not paraphrases or filler. Geography/alphabet filters are acceptable puzzles in moderation, not the entire daily batch.
- Prefer stable finite sets. For changing membership/date-sensitive facts specify a historical cutoff.
- Fully enumerate the prompt's accepted answers. Never ask for an unlimited class while judging a small handpicked subset.
- All common English names/abbreviations must be recognized. No generated incorrect examples. Invalid entries must be removed before publication.
- Explain editorial rarity; it is not live population data. Tier 1 familiar, 2 less obvious, 3 obscure, 4 exceptional. Ranking is a content judgment, not a length-based statistic.
- No arbitrary serial-number windows, one-question variants with only a changed number, or repeated answer sets used to inflate counts.
- Use several subject areas in every daily batch; aim for 8+ categories, max 25 questions per category.

## Release and compatibility
Set new batches' `releasedOn` to the next UTC date, never retroactively. Practice can use all published questions immediately. Daily selection includes only batches released by the puzzle date. Today's launch puzzle and every prior launch result remain the original five. Session snapshots freeze exact prompts/answers/scoring when started; sessions predating snapshots use the original 30-set bank.

Do not reorder/modify/delete published packs. Corrections need a versioned replacement strategy. Re-running a day's automation must not add another 100. Keep changes scoped when other uncommitted work exists.

## Verification and deployment
1. `npm run bank:build` (fails on schema errors/duplicate IDs/prompts/answer sets/aliases).
2. `npm run check` and `npm test`.
3. Start `npm run dev` (apply `npm run db:local` when needed), then `node test/api.integration.mjs`. Stop only the server you started.
4. Review content and actual cited sources. Automated structural checks do not establish factual correctness.
5. `npm run deploy`. Schema migrations require applying `npm run db:remote` before deploy. Do not edit old migrations.
6. GET `https://rare-daily.happycoin8899.workers.dev/api/puzzle`; verify `bankSize`/`latestBatch`. Commit relevant files after successful verification. Report failures instead of marking the batch complete.
