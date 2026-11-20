# Collaboration and current status

RARE Air is a free rare-answer trivia game at https://krillionunlimited.top/. Its backend uses Cloudflare Workers, D1 and SQLite Durable Objects. Source is at [glovenone/rare-air](https://github.com/glovenone/rare-air). Read [PROGRESS.md](PROGRESS.md) for dated implementation and release events.

## Verified delivery on November 20, 2026

| Platform | Actual state | Language coverage |
| --- | --- | --- |
| Website | Website source `2168254`, Cloudflare `8f74e7e4-3912-401c-ae21-3e7ddbdac001`, published and fresh public assets verified | Eleven languages, 602 prompts, 99 public pages |
| Android direct APK | Public 1.0.5, code 8, source `0d5b99c`, GitHub release `android-v1.0.5` | Eleven in-app catalogs |
| iOS prepared candidate | 1.0.5, build 8, same source, archived and simulator-tested, distribution export/upload pending | Eleven declared and packaged languages |
| Apple public store | Official Lookup verified 1.0.1 on November 20, released November 17 | Earlier verified build has ten in-app catalogs, public storefront metadata reports English |
| Google Play | Last dashboard observation on November 18 showed closed-track 1.0.1 published, one opted-in tester and production eligibility pending | Earlier uploaded ten-language build, current build 8 AAB is prepared locally |
| WeChat | Separate Canvas test project | Requires its own localization and social acceptance |

Korean joins English, simplified Chinese, Spanish, French, Portuguese, German, Japanese, Russian, Arabic and Indonesian. First visits traverse supported browser/device preferences and fall back to English. Saved choices persist. Korean uses cached machine translation plus selected UI and terminology corrections. Full native-speaker review is pending.

The published CMA nominee question retains its first release of November 19 UTC. Published historical packs remain unchanged. Today's ten new US Trends candidates qualified zero additions; the bank stays at 602 and no empty pack was created.

## Gameplay and customization

The November 19 homepage follow-up separates the daily launch, four game-mode cards, a full-width gold icon/reward entry and a separate passport entry. Main action titles are 22px on desktop and at least 20px on phones; the rewards title is 25px/23px. Supporting copy is 15px/14px with dark text on opaque surfaces. Narrow screens use one-column mode cards. The daily action preserves its eyebrow and title when updated to resume or review a flight. Header and altitude information still scroll on the homepage, with an iOS status-bar safe area. The companion DOM layer remains below the main controls.

The rewards center shows free icons first, followed by earning guidance and the earned-point catalog. Guests see a "3 free icons" badge on home; signed-in users see their authoritative balance. Automated local browser checks covered six viewport/language cases, including 320px, landscape and Arabic RTL, with no horizontal overflow or page errors. A local-only UI fixture verified confirmation, redemption from 180 to 60 points, insufficient-balance feedback and persisted selection. The fixture account was deleted. Screenshots and results are retained in ignored `release/private/home-emphasis-20261119/`.

Three pilot icons are free. Six cost 120-600 earned Sky points. Verified online daily completions on their UTC day and chapter completions earn points. D1 stores balances, owned icons and selection, with retry and concurrency protection. The [homepage plan](docs/plans/2026-11-17-home-rewards.md) describes the rules.

The homepage follow-up is now included in public Android 1.0.5 and the prepared iOS 1.0.5 archive. Source `0d5b99c` also completes localized pages at the end of `bank:build`, preserving all 99 URLs and runtime language markers. The original incomplete local pipeline failed the existing site check; the corrected pipeline passed before final synchronization and packaging.

All eleven public homepages, shared homepage CSS, game JavaScript, rewards UI and translation bundle were freshly downloaded and matched the committed assets. Android and Apple download links returned HTTP 200. GA4 configuration is retained and no advertisement delivery script was introduced. Source and deployment receipts are recorded in [PROGRESS.md](PROGRESS.md).

## Release evidence

The latest [Android release](https://github.com/glovenone/rare-air/releases/tag/android-v1.0.5) contains the signed APK and SHA256SUMS. A fresh anonymous HTTPS download matched SHA-256 `3456cccc605b354c7c0cbbf767f85573aee6678fc448222aef351a54b2f25650`. The signature matches the existing project key. Earlier 1.0.3/code 6 and 1.0.4/code 7 releases remain immutable. The signed, locally prepared AAB hash is `00e15252b59afa8bfbe264122d0db9a6308d9fc167c8737e3456ac06d1e95af2`.

TypeScript checks, all 69 unit tests and five real local D1/DO integration groups passed. Final Android API 36 tests covered actual 20px+ labels and 28px daily text, rendered layers, icon changes, online lifecycle recovery, input, a five-round offline report and native sharing. iPhone 17 Pro and iPad Pro 13-inch tests on iOS 26.5 covered icons, accepted offline input, five rounds, sharing, Korean, persistence and rotation. A transient application screenshot crop during rotation was corrected by waiting for orientation and capturing the full screen; the final landscape image was reviewed. Physical-device haptics and device-specific behavior still require hardware checks.

Both final Android packages and the final iOS archive contain the same verified game JavaScript and homepage stylesheet. All eleven language catalogs are packaged. Website analytics and AdSense verification/delivery code are excluded from native HTML. Detailed hashes, actual screenshots and failed/recovered test harness attempts are retained in the maintainer's ignored `release/private/daily-operations/2026-11-20/`.

## Resume order

1. Inspect the branch, upstream and uncommitted work, then pull current main before implementation or creating an isolated worktree. On completion, commit the authorized changes and records, push normally and verify the remote commit. Preserve unrelated changes and report synchronization failures. November 18's older uncommitted worktree was already recovered, so inspect current source before reapplying it.
2. With computer control available, use the existing Xcode Organizer cloud-signing session for the final `release/artifacts/2026-11-20-build8/RARE-Air-1.0.5.xcarchive`. A verified copy is imported in the standard November 20 Organizer archive folder. CLI export's known No Accounts error does not establish that the GUI account needs another login. Earlier unuploaded build 5/6/7 candidates are superseded. Reuse build 8 if source is unchanged.
3. Recheck current store versions and queues. Upload and associate validated build 8, choose Apple automatic release and keep Google managed publishing off. Update Google account creation, User IDs, deletion URL and public interaction disclosures before submitting the new candidate. [Mobile workflow](release/mobile-daily.md) and the prepared metadata provide the handoff.
4. Recheck real Play enrollment and production eligibility. November 18's count is historical. Direct APK downloads do not establish Play test participation.
5. Resume GA4 and Search Console in happycoin Chrome, resubmit the existing sitemap with its expanded URLs, and record the actual reporting windows. This run had no browser/computer tool, so November 18 metrics are retained as dated historical observations.
6. Continue Korean editorial review, trend-led curation and current competitor checks. Daily additions can be zero.

## Operational boundaries

Ads remain disabled and subscriptions remain private design. Existing free gameplay, chapters, social play and earned cosmetics remain the free baseline. China store distribution remains deferred. Credentials, signing material, private contacts and service receipts belong in ignored private records. Use the existing [README](README.md) build commands and read [AGENTS.md](AGENTS.md) before further work.
