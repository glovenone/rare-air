# Cloudflare flight passports and social play

The game backend uses Cloudflare Workers, D1 and one SQLite Durable Object. No external account, email, websocket or AI backend is needed. Workers serves the game and authoritative JSON API; D1 stores games, optional passports, friends, rooms and rating results. `Matchmaker` serializes allocation across all pools so one passport cannot race into several rated tables.

## Deploy and validate

Apply migration `0005_passports_social.sql` before deploying the new Worker. It is additive and preserves historical sessions, question snapshots, existing route IDs and room JSON. `wrangler.jsonc` declares the SQLite-backed `Matchmaker` namespace with migration tag `matchmaker-v1`. Use an account with D1 and SQLite Durable Objects enabled; monitor the account's actual limits before a large launch.

```sh
npm ci
npm run db:local
npm run dev -- --port 8791 --infer-origin-from-routes false
# In a second shell:
TEST_URL=http://127.0.0.1:8791 node test/social.integration.mjs
```

The origin flag makes local WebAuthn use localhost rather than the configured production custom domain. Production always verifies its request origin and RP hostname. The integration test is local-only, uses real D1/DO coordination and ES256-signed software-authenticator responses. It covers history import/isolation, challenge replay, friendship spoiler gates, ten concurrent seats, rated settlement replay, blocking, recovery rotation and deletion. Browser UI and real-device passkey support remain separate checks.

## Identity and data

A passport's public UUID is separate from its private game actor. Session and recovery secrets contain 256 random bits; D1 stores SHA-256 hashes. Production authentication uses an HttpOnly, Secure, SameSite=Lax `__Host-rare_passport` cookie. Guest game cookies and relay-seat tokens are capabilities, not verified people. Public room payloads omit those secrets. Recovery rotation revokes existing sessions. Save the recovery code: no email is collected or sent.

Passkeys use resident credentials with user verification, strict RP/origin checks, five-minute one-use actor-bound challenges and conditional counter updates. D1 stores only public keys, counters and transport hints. Biometrics stay with the authenticator. Native apps restore passports by recovery code; web browsers can also register and use passkeys.

History import is explicit and links only server-stored games belonging to the current guest capability. The API never trusts client-supplied scores. Signing out clears account caches and creates another guest identity. Friends require an expiring invitation and explicit acceptance. Daily answers remain hidden until the viewer completes that day's flight.

Delete a passport from **Flight passport → Recovery and deletion**, confirming with its recovery code. The website can open this entry via `/?passport=delete`, including recovery on a second device. Deletion removes linked online flight history, sessions, keys, friends and account rating records. Room snapshots expire separately after 24 hours. Offline history is device-local.

## Matching, fairness and operations

Quick matches accept guests. Rated matches require passports; table pools have 2, 3, 6 or 10 seats, and the rating band expands with real waiting time. There are no simulated opponents. A quiet queue can be left for a smaller table or a private invite. A signed-in pilot can recover an active rated seat on another device, invalidating its old seat token.

Room updates use D1 revision compare-and-swap; the shared server clock settles missed turns. Pairwise Elo results use an insert/update/applied ledger in a D1 transaction, so simultaneous result reads cannot repeat a reward. Private games do not change Elo. This is game scoring, not an anti-collusion guarantee. Blocks exclude new matches and friendships; request quotas limit common abuse paths.

Reports are saved in `pilot_reports` for human moderation, with support available at the website's support page. Review new reports during daily operations. Do not display fabricated players, leaderboard activity or test testimonials. For substantial public traffic, inspect Worker/D1/DO metrics, matchmaking latency and abuse before choosing additional Cloudflare limits or sharding. No production-scale load test has been claimed.

## Intentional product choices

Five-question daily flights keep the original sky identity. Four major routes have 30 chapters and five other routes have six (150 total). Later chapters use distinct fixed combinations of the reviewed question bank; they do not claim entirely new questions. The original first six chapters are unchanged. Nine original route scenes and eight earned companions extend flight progression. Advertising stays off, and subscription work remains private design only.
