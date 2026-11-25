# Collaboration and current status

RARE Air is a free rare-answer trivia game at https://krillionunlimited.top/. Its backend uses Cloudflare Workers, D1 and SQLite Durable Objects. Source is at [glovenone/rare-air](https://github.com/glovenone/rare-air). Read [PROGRESS.md](PROGRESS.md) for dated implementation and release events.

## Verified delivery on November 24, 2026

| Platform | Actual state | Language coverage |
| --- | --- | --- |
| Website | Source `c062276`, Cloudflare `31cc4080-8f53-4aaf-892b-d41247b624fa`, deployed and publicly verified | Eleven languages, 603 prompts, 99 public pages |
| Android direct APK | Public 1.0.6, code 9, source `584b28d`, GitHub release `android-v1.0.6` | Eleven in-app catalogs, 603 offline prompts |
| iOS prepared candidate | 1.0.6, build 9, same native source, archived and simulator-tested; distribution export/upload pending | Eleven declared and packaged languages, 603 offline prompts |
| Apple public store | Official Lookup verified 1.0.1 on November 26, released November 17 | Earlier verified build has ten in-app catalogs; public storefront metadata reports English |
| Google Play | November 26: closed 1.0.1 published; 1.0.6/code 9 plus listing/privacy submitted, automated checks continuing; one tester and production eligibility pending | Earlier public ten-language build; uploaded build 9 contains eleven catalogs |
| WeChat | Separate Canvas test project | Requires its own localization and social acceptance |

The supported game languages are English, simplified Chinese, Spanish, French, Portuguese, German, Japanese, Korean, Russian, Arabic and Indonesian. First visits traverse supported browser/device preferences and fall back to English; manual choices persist. Korean has machine translation plus selected UI and terminology corrections. Full native-speaker editorial review is pending.

November 24 restored the unfinished November 23 content release. Final pre-publication review clarified the new question's scope and accepted all four original on-screen film performers through 2022. The question, ten translations, localized aliases and fingerprints were rebuilt and verified. Its first daily-pool eligibility remains November 24 UTC; practice can use it immediately. The preceding twelve daily schedules and all 150 chapter definitions remain unchanged. Today's twenty new US/GB trend signals qualified zero further additions; no empty pack was created. Published packs remain append-only.

## Gameplay and customization

The homepage separates the prominent daily launch, four game-mode cards, a gold Icons & rewards entry with balance, and the passport entry. Main titles are 22px on desktop and at least 20px on phones. Free pilot icons appear before the earned-point catalog, with visible earning guidance. Three icons are free; six cost 120–600 earned Sky points. D1 authoritatively stores balances, ownership and selection, including retry/concurrency protection. Replays only add improvements to eligible daily/chapter rewards. Existing unlocked cosmetics remain free.

Cloudflare passports, passkeys/recovery, explicit guest import, cross-device online history, spoiler-gated friend comparisons, block/report controls, real 2/3/6/10-seat rooms and exactly-once Elo remain the baseline. Public queues contain real participants only. Nine topics, 150 chapters, nine environments and eight streak companions remain free. The separate Canvas WeChat project does not inherit this acceptance automatically.

The November 20 bank pipeline correction remains in place: `bank:build` completes localized page and sitemap generation after translation generation. The current bank build preserves all 99 URLs. The November 19 homepage and rewards improvements remain included in the current native candidate and public APK.

## Release evidence

The [Android 1.0.6 release](https://github.com/glovenone/rare-air/releases/tag/android-v1.0.6) contains the signed APK and SHA256SUMS. A fresh anonymous HTTPS download matches SHA-256 `f9591f4ba8d4c7f7ba0628c36e9af22d13cd46255d294fd1a02fbea762bae0fa`. The signature matches the existing project key. Earlier public tags and assets are unchanged. The locally prepared signed AAB hash is `0488e05f92faab5dfb08db4ef9007f9eb0d047b6fd9d41c17db84ea9ba3b070e`.

TypeScript, 69 unit tests and five real local D1/DO integration groups pass. Android API 36 release instrumentation passes two cases covering rendered fonts/layers, icon persistence, input, offline five-round completion, native sharing and online background recovery. iPhone 17 Pro/iOS 26.5 passes three corresponding cases. Korean iPad Pro 13-inch/iOS 26.5 passes language persistence and rotation. Actual final Android, iPhone and landscape iPad screenshots were reviewed. Physical haptics and hardware-specific checks remain separate.

Final APK, AAB and iOS archive contain matching shared JS/CSS, 603 prompts, eleven language catalogs and 100 HTML files including licenses. Website analytics and advertising are excluded. Strict AAB verification passes against the existing trusted project keystore; standard timestamp/JAR-stream warnings remain recorded. The iOS archive has a valid development signature and still requires distribution cloud signing/export before upload. Artifacts are in `release/artifacts/2026-11-24-build9/`; full private hashes, logs, screenshots and receipts are in `release/private/daily-operations/2026-11-24/`.

The website's 99 sitemap pages pass HTTP, canonical, reciprocal language alternate, title, GA4 configuration and AdSense verification checks. All 22 localized home/rules download entries point to the verified APK and Apple listing. Shared public assets match the deployed source. Robots and ads.txt are accessible; an unknown page returns 404. Ad-delivery scripts and units are absent. These technical checks do not establish search indexing or traffic growth.

## Resume order

1. Inspect branch, upstream and worktree; pull before implementation or creating an isolated worktree. Commit authorized source and records, push normally and verify the remote before reporting completion. Preserve unrelated changes. November 23's content has now been recovered; do not duplicate its question or restore the superseded three-answer candidate.
2. Use the final `release/artifacts/2026-11-24-build9/RARE-Air-1.0.6.xcarchive`. A verified copy is in the standard November 24 Xcode Organizer folder. The older same-number November 23 Organizer archive has been moved to private backup so it is not selected accidentally. Builds 5–8 and initial local build-9 candidates are superseded for future upload.
3. Check current store versions, queues and uploaded build numbers in happycoin Chrome before uploading. If build 9 has already been handled elsewhere, prepare a higher build rather than replace it. Use the existing Organizer cloud-signing flow: Custom → App Store Connect → Export → Automatically manage signing. An old CLI No Accounts message does not prove GUI logout.
4. Save the current account creation, optional User IDs, deletion URL and public interaction/block/report disclosures in Google Play before submitting the AAB. Select Apple automatic release after approval and keep Google managed publishing off. Actual track eligibility and store queues govern submission. Direct APK downloads do not count as Play test enrollment.
5. November 26 native access recovered. The Chrome profile displayed as happy was verified as the authorized happycoin identity. GA4/GSC reports were read with actual windows and sitemap resubmission succeeded. Google Play code 9, listing and privacy were submitted; recheck review outcome before further upload. Xcode's actual GUI account list is empty and App Store Connect authentication failed. The owner was asked to restore both Apple logins. Do not describe this as a still-locked Mac or infer a current Apple queue from public Lookup.
6. Resume GA4/GSC with actual data dates, resubmit the existing sitemap and verify indexing. Continue trend-led curation, Korean review and real feedback. Twelve current competitor static pages match November 23; dynamic settings/purchases/party behavior remain unverified. Private subscription design now specifies report coverage and historical-score preservation; no public subscription feature was added.

## Operational boundaries

Ads remain disabled and subscriptions/reminders remain private design. Existing free gameplay, chapters, social play and earned cosmetics remain free. China store distribution remains deferred. Credentials, signing material, private contacts and account receipts stay in ignored private records. Use the [README](README.md) commands and read [AGENTS.md](AGENTS.md) before further work.
