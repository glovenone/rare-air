# Collaboration and current status

RARE Air is a free rare-answer trivia game at https://krillionunlimited.top/. Its backend uses Cloudflare Workers, D1 and SQLite Durable Objects. Source is at [glovenone/rare-air](https://github.com/glovenone/rare-air). Read [PROGRESS.md](PROGRESS.md) for dated implementation and release events.

## Verified delivery on November 19, 2026

| Platform | Actual state | Language coverage |
| --- | --- | --- |
| Website | Source `9092bb1`, Cloudflare `e6106ebe-4024-4b4e-99c9-8b620327fa8b`, 602 prompts and 99 public pages | Eleven languages |
| Android direct APK | Public 1.0.4, code 7, source `1a5fd67`, GitHub release `android-v1.0.4` | Eleven in-app catalogs |
| iOS prepared candidate | 1.0.4, build 7, same source, archived and simulator-tested, distribution export/upload pending | Eleven declared and packaged languages |
| Apple public store | Official Lookup verified 1.0.1 on November 19, released November 17 | Earlier verified build has ten in-app catalogs, public storefront metadata reports English |
| Google Play | Last dashboard observation on November 18 showed closed-track 1.0.1 published, one opted-in tester and production eligibility pending | Earlier uploaded ten-language build, current build 7 AAB is prepared locally |
| WeChat | Separate Canvas test project | Requires its own localization and social acceptance |

Korean joins English, simplified Chinese, Spanish, French, Portuguese, German, Japanese, Russian, Arabic and Indonesian. First visits traverse supported browser/device preferences and fall back to English. Saved choices persist. Korean uses cached machine translation plus selected UI and terminology corrections. Full native-speaker review is pending.

The recovered, previously unpublished CMA nominee question first releases on November 19 UTC. Published historical packs retain their prior release dates. Today's ten new US Trends candidates qualified zero additional questions.

## Gameplay and customization

The homepage has six prominent mode cards, 21px desktop and 19px phone titles, 14px supporting copy and a single-column layout at narrow widths. Header and altitude information scroll on the homepage, with an iOS status-bar safe area. The companion DOM layer is below the main controls. Android native assertions verified the actual rendered layering, and device screenshots were reviewed.

Three pilot icons are free. Six cost 120-600 earned Sky points. Verified online daily completions on their UTC day and chapter completions earn points. D1 stores balances, owned icons and selection, with retry and concurrency protection. The [homepage plan](docs/plans/2026-11-17-home-rewards.md) describes the rules.

## Release evidence

The latest [Android release](https://github.com/glovenone/rare-air/releases/tag/android-v1.0.4) contains the signed APK and SHA256SUMS. A fresh anonymous HTTPS download matched SHA-256 `a36490df2198158d9c66a0a0d4645a4655f9ed9c84b35e8daad494ea44d32d52`. The signature matches the existing project key. Version 1.0.3/code 6 remains an immutable earlier release.

TypeScript checks, all 69 unit tests and five real local D1/DO integration groups passed. Final Android API 36 tests covered rendered layers, icon changes, online lifecycle recovery, input, a five-round offline report and native sharing. iPhone 17 Pro and iPad Pro 13-inch tests on iOS 26.5 covered icons, accepted offline input, five rounds, sharing, Korean, persistence and rotation. Physical-device haptics and device-specific behavior still require hardware checks.

Both final Android packages and the final iOS archive contain the same verified game JavaScript and homepage stylesheet. All eleven language catalogs are packaged. Website analytics and AdSense verification/delivery code are excluded from native HTML. Detailed hashes, actual screenshots and failed/recovered test harness attempts are retained in the maintainer's ignored `release/private/daily-operations/2026-11-19/`.

## Resume order

1. Fetch current main and protect uncommitted work. November 18's older uncommitted worktree was recovered into this release, so inspect current source before reapplying it.
2. With computer control available, use the existing Xcode Organizer cloud-signing session for the final `release/artifacts/2026-11-19-build7/RARE-Air-1.0.4.xcarchive`. CLI export's known No Accounts error does not establish that the GUI account needs another login. Earlier build 5 and build 6 artifacts are superseded.
3. Recheck current store versions and queues. Upload and associate validated build 7, choose Apple automatic release and keep Google managed publishing off. Update Google account creation, User IDs, deletion URL and public interaction disclosures before submitting the new candidate. [Mobile workflow](release/mobile-daily.md) and the prepared metadata provide the handoff.
4. Recheck real Play enrollment and production eligibility. November 18's count is historical. Direct APK downloads do not establish Play test participation.
5. Resume GA4 and Search Console in happycoin Chrome, resubmit the existing sitemap with its expanded URLs, and record the actual reporting windows. This run had no browser/computer tool, so November 18 metrics are retained as dated historical observations.
6. Continue Korean editorial review, trend-led curation and current competitor checks. Daily additions can be zero.

## Operational boundaries

Ads remain disabled and subscriptions remain private design. Existing free gameplay, chapters, social play and earned cosmetics remain the free baseline. China store distribution remains deferred. Credentials, signing material, private contacts and service receipts belong in ignored private records. Use the existing [README](README.md) build commands and read [AGENTS.md](AGENTS.md) before further work.
