# Topic practice

The owner asked for concrete follow-up on Krillion's current gameplay. Today's browser review verified Puffer Party's rated and casual entry points, selectable room sizes, lives, minimum turn duration, heart cap and points-per-heart settings. Its existing themed packs also provide a topic-led entry into play.

Add a free topic-practice entry to RARE Air. Players select a knowledge area and play five distinct questions using the existing flight, scoring, timing and result flow. Keep the one-click mixed practice entry. Curated paid chapters and subscription flows remain in their internal design stage.

Return topic names and question counts in puzzle metadata. Select questions server-side and freeze them in the existing session snapshot. Encode the selected topic in the session seed so resume and another-flight actions recover it without a database migration. Validate topic IDs and allow them for practice sessions. Existing daily seeds, sessions and mixed practice retain their existing selection behavior.

Reuse the current dialog, typography, palette and sky. Provide an accessible responsive topic-card grid. Verify the picker, five-round play, topic continuity, cancellation, legacy flows, mobile layout and reduced motion. Run targeted rule and API checks, the existing suite and the mobile web bundle build, then deploy the website and record the native-app release state accurately.

## Verified delivery

Commit `70483cb` adds the nine free topic choices, server-side selection, persisted topic identity, another-flight continuity and regression checks. The website deployment is Cloudflare version `d8fb2bd0-9103-47ed-bf58-4ba094ded68c`. All 25 unit tests, TypeScript checks, local API integration and the mobile web bundle build passed. Browser checks exercised the five-round science flight and another-flight continuity locally, plus the live picker and topic entry. Desktop and 390-pixel mobile layouts were inspected.

New native binaries still require platform testing, signing, upload and store review. Existing public app versions precede this feature.

## Next gameplay candidate

Build an original multiplayer flight relay with private rooms and a join code. A room coordinator owns the current question, ordered turns, accepted normalized answers and shared deadline. Reuse the existing answer evaluator and immutable question snapshots. Resolve an answer and a timeout atomically, accept a submitted answer once and retain authoritative room state across disconnects.

The first playable acceptance covers two independently controlled clients joining the same room, starting together, taking turns, rejecting a repeated answer, handling a timeout, reconnecting to the current state and seeing the same final result. A third client attempting an invalid or full-room join receives an actionable error. Verify these flows before exposing a public entry. Review the current Cloudflare deployment configuration and available room-state primitives during implementation, then document the chosen persistence and operating cost.

Krillion research verified public entry points, rules and a one-participant room's settings. Full competitor multiplayer play remains a research follow-up. RARE Air's private Sky Relay shipped on November 16. Its implementation and independent-client verification are recorded in docs/plans/2026-11-16-sky-relay.md.
