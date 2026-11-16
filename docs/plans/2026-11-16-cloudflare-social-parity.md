# Cloudflare social and multiplayer parity implementation plan

> **For Claude:** Execute this plan task by task using the executing-plans workflow; the owner has authorized implementation and publication.

**Goal:** Deliver the remaining meaningful competitor capabilities using Cloudflare, with an original flight passport, social flight deck and richer sky progression.

**Architecture:** Workers handle HTTP and passkey verification; D1 stores passport sessions, linked game identities, friends, moderation, rooms and rating ledgers. A SQLite Durable Object serializes matchmaking decisions. Existing authoritative room CAS, fixed historical question snapshots and daily timers are preserved. Passports use passkeys and a random 256-bit recovery code, replacing Google login without an external account backend. Native clients can recover a passport by code without embedding a third-party login page.

**Tech Stack:** Cloudflare Workers, D1, SQLite Durable Objects, WebAuthn via SimpleWebAuthn, existing vanilla JS/CSS/Canvas and Capacitor.

## Acceptance and tasks

1. `migrations/0005_passports_social.sql`, `src/passport-api.ts`, `src/auth.ts`: create/recover/logout/delete a passport, rotate recovery codes, HttpOnly hashed sessions, single-use session-bound WebAuthn challenges, strict RP/origin verification, explicit guest-history import. No email/password collection. Test expired/replayed credentials, origin checks and data isolation.
2. Integrate authenticated effective player identity and linked guest histories in `src/worker.ts` and `src/progression.js`. Expose server-side completed-flight log; never import arbitrary client scores. Avoid copying a local guest's history into an unrelated account without consent. On logout clear account-specific caches.
3. Friends use expiring random invitations, explicit acceptance, removal, blocking and reporting. Daily comparisons reveal answers only after the viewer completes that date. Passport ratings and public names exclude recovery/session secrets. Test unauthorized reads and blocked relationships.
4. Extend `src/relay.js` and `src/relay-api.ts`: table sizes 2/3/6/10, public/private rooms, extra-heart charge from rare answers, self-consistent final rankings, membership per browser identity, bounded room expiry, rematches. Existing private rooms remain readable.
5. `src/matchmaker.ts`: SQLite Durable Object gates queue allocation; D1 keeps resumable queue/room records. Quick play works for guests; rated play requires a passport and records pairwise Elo exactly once using a transactional ledger. No fake players, no rating gains for private rooms, no repeated reward for a result replay. Cancel and rejoin queues safely. Integration tests include racing joins and duplicate result processing.
6. `public/passport.js/css`, `public/relay.js/css`, `public/app.js`, `public/index.html`: original flight-deck UI with passport, friend invite/list/daily board, public room browser, queue controls/rating feedback, selected companions and report/block actions. Preserve input during polling, IME and Arabic RTL; show honest empty/waiting states.
7. Extend original earned companions to eight milestones through 150 days, retaining existing trails and progress. Add distinct route environments in CSS/Canvas and extend four major themed routes to 30 stable chapters, reusing the reviewed bank with distinct deterministic chapter sets. Preserve the existing first six chapters exactly and acknowledge reused question combinations. Do not bulk-generate filler questions.
8. Translate every new interface/guide message into all nine translations, retain 601 question translations. Update privacy/rules for passkeys, recovery, synchronization, friends, public names, matchmaking and ratings. Advertising stays off; subscriptions stay private; China publication stays deferred.
9. Run type checks, unit tests, real-D1/DO integrations, native packaging and browser UI acceptance (at least two isolated players). Test account recovery/import, friends and spoiler gate, quick/rated result replay, 10-seat room, timeout/extra life, routes/companions, offline failure and narrow RTL layout. Review security before production migration.
10. Push reviewed commits, apply additive D1 migration and deploy Worker/DO/assets. Verify real public paths and temporary test cleanup. Build increasing native candidates from the delivered source and progress eligible store submissions without replacing the currently pending candidate blindly. Record exact app/store limitations instead of claiming every installed app updated.

## Design decisions

Keep five-question/30-second flight pacing and the sky identity. Match capabilities rather than copying artwork or requiring identical rules. A passport provides account continuity on Cloudflare with no paid email service. Ranked matching initially uses exact table-size pools and rating bands, widening with actual server-observed waiting time; visitors can switch to a two-seat quick room or invite friends while traffic is small. Public rooms list only recent waiting hosts, with block/report controls. Future subscription work remains design only.
