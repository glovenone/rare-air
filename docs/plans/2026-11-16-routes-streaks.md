# Theme chapters and daily streak rewards

Extend the existing free topic practice into nine fixed routes of six chapters. Each chapter contains five existing questions. Save explicit question IDs in a versioned content manifest so later bank additions preserve the chapter order. Unlock the following chapter when a complete five-question flight is recorded, and retain the highest score. Award one, two and three stars at 1,000, 2,500 and 4,000 meters. Existing topic practice continues through its current entry point.

Use the current D1 sessions and answer records for progress. A chapter is a practice session with an explicit chapter seed and frozen question snapshot. The API validates sequential access and derives completion and best scores from finished sessions. Repeated and concurrent submissions use the existing atomic scoring path.

Add a nullable completion timestamp to sessions. Record it exactly once when the fifth answer is committed. Count a streak day when a daily flight finishes on that same UTC date. Archive completions and late finishes therefore do not backfill a streak. Previous records retain their totals and history, but their missing completion times cannot establish dated streak completions. Explain this transition to returning players when legacy completions exist.

Unlock permanent cosmetic flight trails at best streaks of 3, 7, 14 and 30 days. A player selects an earned trail in the flight log. Apply its colors to the existing Canvas particle and paper-plane effects. Cache the last server-confirmed progress for viewing during a connection interruption. Store visual selection locally and preserve the existing analytics consent rules.

1. Add the frozen route manifest, chapter lookup and pure progress calculations. Add targeted tests for chapter stability, stars, sequential access and UTC streak boundaries.
2. Add migration 0004, chapter session creation, completion timestamps and a progress endpoint. Exercise replay, concurrent completion, legacy rows and archive exclusion against local D1.
3. Add the routes dialog and rewards in the flight log using the established typography, sky artwork and responsive layout. Translate new interface and guide text into all ten selected languages.
4. Verify normal browser entry points, chapter completion/replay, progress after reload, mobile and Arabic RTL. Run the existing game and relay integrations and native bundle compatibility builds.
5. Push source, apply the additive migration, deploy and verify the public game. Refresh the existing daily automation and actual mobile candidate records. Check store build identifiers before packaging the new shared native source.
