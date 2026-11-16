# RARE question publishing

## Daily contract
At 07:00 Asia/Shanghai the Codex task checks current search trends and news relevant to English-speaking players. Add source-verified questions when a trend offers worthwhile new trivia. The number depends on suitable material, and a day may add zero questions. When nothing qualifies, record the review and skip creating a pack. This replaces the fixed daily quota following the owner's November 16, 2026 instruction.

Use Google Trends Trending Now and current authoritative reporting or official announcements. Record the observation date and time, market, trend terms, evidence URLs and the reason each candidate was selected or skipped in the private daily record. Build questions around bounded facts with complete accepted-answer sets. Date time-sensitive facts and distinguish announced events from completed results. Check existing questions and aliases before adding material.

The local computer and Codex must be running for the scheduled task. It uses existing Codex usage and Wrangler authorization. A scheduled attempt can fail, and publication requires a successful deployment.

## Files
`content/packs/<date>-daily.json` is one append-only dated batch. Initial expansion lives in `2026-11-12-expansion.json` (270 new questions, plus 30 legacy questions). Generate `src/bank.js` with `npm run bank:build`. Do not edit that generated file by hand. It is server-only.

Pack schema:
```json
{"batch":"2026-11-13-daily","releasedOn":"2026-11-14","questions":[{"id":"unique-slug","category":"SCIENCE","prompt":"Name ...","explanation":"Scope and judging notes.","sources":["https://primary-source.example/relevant-page"],"answers":[{"label":"Canonical answer","aliases":["Common variant"],"tier":1}]}]}
```
Never use a placeholder source URL. Read the sources. Every new question needs 3–60 different valid answers, no ambiguous or overlapping normalized aliases, a specific scope and a complete answer list within that scope. Initial legacy prompts retain their existing content and scores.

## Quality
- Each addition must bring a distinct idea supported by a current trend. Judge the underlying knowledge and answer set when checking for repeated questions.
- Prefer stable finite sets. For changing membership/date-sensitive facts specify a historical cutoff.
- Fully enumerate the prompt's accepted answers. Never ask for an unlimited class while judging a small handpicked subset.
- All common English names/abbreviations must be recognized. No generated incorrect examples. Invalid entries must be removed before publication.
- Explain editorial rarity; it is not live population data. Tier 1 familiar, 2 less obvious, 3 obscure, 4 exceptional. Ranking is a content judgment, not a length-based statistic.
- No arbitrary serial-number windows, one-question variants with only a changed number, or repeated answer sets used to inflate counts.
- Follow the topics that qualify on the day. A small single-topic pack is valid. Review the overall bank's balance over time.

## Release and compatibility
Set new batches' `releasedOn` to the next UTC date, never retroactively. Practice can use all published questions immediately. Daily selection includes only batches released by the puzzle date. Today's launch puzzle and every prior launch result remain the original five. Session snapshots freeze exact prompts/answers/scoring when started; sessions predating snapshots use the original 30-set bank.

Do not reorder/modify/delete published packs. Corrections need a versioned replacement strategy. Re-running a day's automation must reuse the recorded selection and publication state to prevent duplicate additions. Published packs remain append-only. Keep changes scoped when other uncommitted work exists.

## Verification and deployment
For each new or versioned question, update its contextual prompt and answer translations in all nine additional languages before building. Follow `content/translations/README.md` for fingerprints, reviewed terminology and localized aliases. English remains the canonical fact-checking source. Preserve literal codes and unchanged scoring. A missing, stale or ambiguous translation blocks publication rather than silently falling back in a newly added question.

1. `npm run bank:build` (fails on schema errors/duplicate IDs/prompts/answer sets/aliases).
2. `npm run check` and `npm test`.
3. Start `npm run dev` (apply `npm run db:local` when needed), then `node test/api.integration.mjs`. Stop only the server you started.
4. Review content and actual cited sources. Automated structural checks do not establish factual correctness.
5. `npm run deploy`. Schema migrations require applying `npm run db:remote` before deploy. Do not edit old migrations.
6. GET `https://rare-daily.happycoin8899.workers.dev/api/puzzle`; verify `bankSize`/`latestBatch`. Commit relevant files after successful verification. Report failures instead of marking the batch complete.
