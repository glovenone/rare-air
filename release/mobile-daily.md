# Daily iOS and Android releases

Updated November 20, 2026, Asia/Shanghai.

## November 20 native homepage delivery

Android direct release 1.0.5/code 8 is public from `0d5b99c`. It includes the November 19 refined homepage, gold rewards entry, balance and free-first icon catalog. Final signed APK SHA-256 is `3456cccc605b354c7c0cbbf767f85573aee6678fc448222aef351a54b2f25650`; the fresh public download and signature match the existing project key. The prepared signed AAB hash is `00e15252b59afa8bfbe264122d0db9a6308d9fc167c8737e3456ac06d1e95af2`. Website source `2168254`, Cloudflare `8f74e7e4-3912-401c-ae21-3e7ddbdac001`, links the new APK across all eleven localized homepage/rules entries. Earlier release assets remain unchanged.

The matching iOS 1.0.5/build 8 archive is at `release/artifacts/2026-11-20-build8/RARE-Air-1.0.5.xcarchive`. It passes strict signing, bundle and simulator checks. Final packages contain 602 prompts, eleven language catalogs and the same verified JS/CSS, with website analytics/advertising excluded. All 69 tests, TypeScript and five real local D1/DO groups pass. Android API 36 release instrumentation passes both cases; iPhone 17 Pro/iOS 26.5 passes three flows; Korean iPad Pro 13-inch/iOS 26.5 passes preference persistence and rotation. Physical haptics/hardware checks remain separate.

An incomplete intermediate bank pipeline was caught by the existing site test, then corrected to finish localized site generation before synchronization. Final products were rebuilt afterward. The intended Android test target is `:app:assembleReleaseAndroidTest`; broad root test tasks can pull unrelated plugin-library tests. A transitional iPad crop was corrected with stable-orientation full-screen capture. Exact logs and final screenshots remain private.

No store upload/submission or distribution export occurred on November 20. Browser/computer tools and connected store/analytics adapters are unavailable. Official public Apple Lookup still shows 1.0.1, while Google console state remains the dated November 18 observation. Gmail has no matching review mail since November 18, which does not establish queue state. Check current uploaded codes/drafts before proceeding. Build 8 supersedes unuploaded older candidates; preserve in-review builds unless a verified problem requires replacement. Use existing Organizer cloud signing for the latest archive, save the prepared Google account/data/public-interaction disclosures, and retain Apple automatic release and Google managed publishing off. Do not rebuild or increment again if source has not changed.

## November 19 additional homepage follow-up

Website source `96c10fb` adds 22px desktop/20px phone action titles, a persistent two-line daily button, a separate gold Icons & rewards entry and a full-width passport entry. The rewards center shows three free icons before six earned icons, with visible earning guidance. All eleven languages and the shared mobile web bundle build, 69 tests and TypeScript pass, and the real local D1 integration and browser redemption flow pass. See [the current collaboration state](../COLLABORATION.md).

This follow-up is live on the website as Cloudflare `fdcd2d3e-b3ef-4a76-af1f-10693337ef60`. It is newer than public APK 1.0.4/code 7 and the prepared iOS/AAB build 7 artifacts. Do not claim those artifacts contain the follow-up, and do not replace immutable public APK assets. Include it in the next increasing native version after checking current store state.

## November 17 homepage and earned icon update

The shared frontend now has a high-contrast six-card launch menu with 17px mode labels, a larger daily action, a direct customization center and a rewards entry on the completed-flight screen. Narrow screens scroll while preserving readable text. Pilot icons are separate from the existing streak companions and trails. Three icons are freely selectable and six are redeemable for 120–600 earned Sky points. Passport icon selection and redemption records use Cloudflare D1 migration `0006_avatar_rewards.sql`.

Points count verified daily flights completed on their UTC date and unique chapters. Each eligible challenge earns 10 completion points plus one point per 100 best meters, capped at 60. Improved replays add the difference. Explicitly imported eligible history counts. Redemption uses a conditional SQLite insert and an account/item unique key, with server-owned prices and balance calculations. Guest free-icon choices remain device-local. Passport redemptions and selection restore across devices and are removed with passport deletion.

Validation includes 68 tests, original game, relay, progression, social and reward integration against real local D1/DO, and browser checks at desktop, 390px and 320px including Arabic RTL. Local UI fixtures verified cancellation, 240→120 point redemption, equipped icon persistence after reload and visible balance. Those fixtures stay in the isolated local database. Initial reward refresh waits for passport history synchronization and discards previous-account responses. The packaged shared mobile bundle builds successfully with the website analytics and ad tags excluded.

The existing 1.0.3 (5) archive and Android artifacts predate this update. Package this source into the next increasing native build and complete native acceptance and store checks before its submission. Current store availability and review state require their own verification.

## November 17 passport continuity maintenance

Website source `ed3fff1` is deployed to Cloudflare version `b6850206-9233-42c1-8342-47992715ca14`. Expired or switched passports clear previous online caches while preserving offline history and preferences. Same-passport refresh retains daily resume IDs. Background history loading updates statistics without restarting an active flight, and stale game/status/history responses cannot restore a previous identity. Cross-tab account changes are recognized.

All 64 tests passed, including actual game startup/answer/countdown cancellation and asynchronous passport-history tests. The original game and real D1/DO social integration passed. Bank 601 and 629 source messages remain unchanged in ten languages. A 90-page live SEO audit found no canonical/hreflang/verification-tag errors or ad-delivery scripts. Today's verified trend review selected zero new prompts.

Prepared native version **1.0.3, build/code 5**, using the same shared frontend. iOS archive succeeds. Android signing uses a separately verified Temurin 21 toolchain because the local Homebrew `openjdk@21` alias currently resolves to Java 25, which Gradle 8.14.3 rejects. Build 5 is a local candidate, not a published APK/store release. Fresh native GUI acceptance and current GA4/Search Console/store verification are blocked by the locked Mac and failing browser connection. The public direct APK remains 1.0.2/code 4. Store 1.0.1/build 3 review status is the last confirmed November 16 observation; no review queue was canceled or replaced today. Existing automatic-release preferences are retained. A later signing check on November 17 confirmed that the existing Xcode account and team Admin access are valid. Organizer successfully exported build 5 with the existing Cloud Managed Apple Distribution certificate, without another login. Strict IPA signature verification passed. Fresh native gameplay acceptance and current store status still require verification before submission.

## November 17 Xcode signing verification

The Xcode account remains present with the correct team Admin role. The login keychain has no timeout, and the selected command-line developer directory points to the installed Xcode. Two listed Apple Distribution certificates show “Not in Keychain”; the local code-signing identity list contains development identities and a Developer ID Application identity, with no local Apple Distribution private key. The CLI error alone does not establish that the account session expired. Its account-discovery failure has not been conclusively diagnosed.

Using the existing session, Organizer → Distribute App → Custom → App Store Connect → Export → Automatically manage signing located the existing Cloud Managed Apple Distribution certificate and provisioning profile, both expiring August 2, 2027. Keep “Manage version and build number” unchecked to preserve the prepared identifiers. Export of **1.0.3 (5)** succeeded. The IPA contains the expected bundle identifier and frontend, and passes strict code-signature verification. SHA-256 is `1db3b115c4047c943801e8fea54caa54414b551041b3a3459870ce5bd6de00e3`. The export is retained locally at `release/artifacts/2026-11-17-build5/ios-export-current/App.ipa`.

For future export failures, first inspect the existing GUI account, team access and signing identities. If the local distribution private key is absent, use this verified Organizer cloud-signing workflow. Request authentication refresh when Xcode explicitly reports an authentication problem or the account is actually absent. Preserve existing team certificates. Native gameplay acceptance and store submission are separate checks.

Apple documents this workflow in [Cloud-managed certificates](https://developer.apple.com/help/account/certificates/cloud-managed-certificates/).

## November 16 social update — current candidate

The website now uses Cloudflare Workers, D1 and a SQLite Durable Object for optional flight passports, cross-device history, friends, public/quick/rated multiplayer and exactly-once Elo results. Source `6ec5970` includes the final native keyboard, safe-area and iOS focus-zoom fixes. Nine illustrated route environments, 150 fixed chapters and eight earned companions are included; later chapters reuse reviewed questions in distinct fixed combinations. The question bank remains 601 prompts in ten languages.

Android **1.0.2 versionCode 4** is signed and public at [android-v1.0.2](https://github.com/glovenone/rare-air/releases/tag/android-v1.0.2). A fresh anonymous download verified the original signature and SHA-256 `8b9a828bf4c29065a9eb141450ebd288897f50d7d8454c3971f2cf518397b6f5`. Signed AAB SHA-256 `9dcd105f57c2f6da756fcb2d19cb76ccf969c9531f6bd45aaadbc315c90c80d7`. Website download entries now point to the new APK.

Type checking, 48 unit tests and four real-D1/DO integration groups passed. Android signed-release testing verified creation, saved recovery code, logout and restoration to the same passport. Two final iPhone 17 Pro / iOS 26.5 XCTest tests passed native creation, logout, recovery, actual account deletion and selecting the ten-seat control. Earlier failed runs exposed iOS input focus zoom and test locator assumptions; product input sizes and keyboard handling were corrected before the final run. Device passkey hardware and physical haptics remain separate hardware checks. Website analytics and AdSense are absent from the packaged HTML and runtime modules.

iOS **1.0.2 build 4** archives successfully. The earlier CLI distribution export returned **No Accounts** and a missing iOS Distribution private-key identity. The initial request to restore login incorrectly treated that failure as evidence of a missing GUI session. The November 17 check below verified the existing account through a successful build 5 Organizer export. An earlier export predates the keyboard fixes and is explicitly marked stale in the ignored artifact folder; do not upload it. No build 4 store binary has been uploaded or submitted. Current build 3 Apple and Google review queues remain intact, with automatic release after approval. The prepared build 4 Google data-safety draft requires updated optional account/User IDs/deletion answers and IARC public multiplayer/block/report answers before its next submission. Do not report the local draft as saved in Play Console. Production testing eligibility remains unchanged.

## November 16 earlier candidate and direct Android release

Prepared iOS **1.0.1 build 3** and Android **1.0.1 versionCode 3** from feature commit `8dc9e94`, merged through PR #5. Both package 601 offline questions. The shared game includes ten languages, nine topic choices, 54 fixed chapters, UTC daily streak rewards and private Sky Relay rooms. Rules and store metadata describe the required online connection for chapters, streaks and multiplayer.

Type checking, 45 unit tests, the original game and relay integrations and the new real-D1 progression integration passed. Browser checks completed a chapter, retained its highest score and stars, unlocked the following chapter, preserved a selected reward and checked Chinese and Arabic layouts at 320px. Local reward testing used synthetic local completion records. Production Chinese play finished five stages with a timed-out second round, retained 4,000 meters and three stars, and unlocked Chapter 2. Online API responses omit upcoming answers.

Android debug APK, signed release APK and signed AAB builds succeeded. APK v2 signing matches the public 1.0 certificate, SHA-256 `3384950945247c1887cfd5efc0973bee178d014ce5c3e7ab561293632d8cd740`. Package `com.letuzhixing.rareair`, minimum API 24 and target API 36. The AAB verifies with jarsigner. APK, AAB and iOS archive contain the identical shared game bundle, with website analytics and AdSense excluded. The Android debug candidate was installed as an upgrade on Rare_Air_Validation / Android 16 API 36. Native checks covered launch, the route and chapter pickers, online chapter entry and server timeout/round progression. The iOS candidate was installed and launched on iPhone 17 Pro / iOS 26.5. A standalone XCTest UI run on the iPhone simulator passed chapter entry, typed-answer scoring, all five rounds, report, Chapter 2 unlock and offline-practice entry. Hardware haptics still require a physical device.

The signed Android APK is public at [GitHub Release android-v1.0.1](https://github.com/glovenone/rare-air/releases/tag/android-v1.0.1). A fresh public download matches SHA-256 `d00a704402f4a9a8a4eb260b45cbf7d1f1f3d3241ff4ebf72e40c8fbf11a81c4`. The website central download URL and all localized homepage and rules links now use this release. AAB SHA-256 is `29f0eac699988afbcbbe8acfb2c81d6e929e28861e751a84dfdf173b76a1e9f9`. Main-checkout artifacts are in ignored `release/artifacts/2026-11-16-build3/`.

The iOS distribution export and upload both succeeded after Xcode account setup. IPA identity, version, ten language declarations, shared bundle and strict signature checks passed. IPA SHA-256 is `9219606d95d20984f9a4c898a8ee6cf1bdadf7a2a2613bcd97037183986abae9`. App Store Connect processed build 3, which was attached to 1.0.1 and submitted on November 16 at 16:40 Asia/Shanghai. Submission `cdd1e695-6750-4741-848b-22920612003d` displays **Waiting for Review**. Automatic release and immediate availability to all eligible users are selected. This update has not yet been approved or publicly released.

Google Play accepted and validated versionCode 3. The Alpha 1.0.1 update and refreshed IARC questionnaire were submitted together; publishing overview displays **Changes in review**, with automated pre-review checks still running at the last observation. Managed publishing remains off, so approval triggers publication to Alpha. The questionnaire retains the existing violence/alcohol references and adds user interaction restricted to invited friends, reflecting player-chosen room nicknames. No chat, location sharing, purchases or advertising were added. The rating contact now uses the preferred operational email. The upload's sole nonblocking warning concerns the absent deobfuscation file; this release does not enable minification. The latest dashboard reports **1** opted-in tester, with the production-access requirement still unmet.

Browser file-URL access was used for the AAB upload. After the upload, the owner explicitly requested leaving this permission enabled; closure is no longer pending. Exact upload, native XCTest and submission evidence is retained in the ignored release directory.

Earlier build 2 artifacts remain available in the November 16 execution record. Resume the existing build 3 review submissions after checking current store records; do not upload duplicates. Exact logs, hashes, source and browser recovery notes are in the main checkout's ignored `release/private/progression-20261116/` folder.

## Owner authorization and current state

The owner authorized daily feature development, testing, store-information maintenance, submission and publication of ready updates for both apps. Future iOS versions use automatic release after approval. Google Play uses standard publishing with managed publishing off.

Apple approved iOS 1.0 build 1. On November 15 the approved version was released into its existing 174 selected regions, and App Store Connect changed to **Ready for Distribution**. Its initial version had used manual release. The public page initially showed page-not-found, then became available during the same session. The US listing now displays the correct app, developer, free price, English language, screenshots and iPhone/iPad support. The website's availability flag has been updated following that public verification. [Public App Store listing](https://apps.apple.com/us/app/rare-air-daily-trivia/id6834294339)

Created the next iOS version draft, **1.0.1**, and saved **Automatically release this version** with immediate availability to all eligible users after approval. The version inherits the existing listing, screenshot sets and review details. Build 3, factual release notes and review instructions are now submitted as recorded above.

Google Play confirms managed publishing is off. Version 1.0 (1) is approved and open on the Alpha closed-test track. The November 16 dashboard check reports one opted-in tester. The production-access application requires the account's displayed testing conditions and subsequent Google approval. See [Android testing](android-testing.md) for enrollment, outreach and feedback records.

## Daily workflow

1. Read current source, review messages, actual feedback, outstanding bugs and the Krillion comparison. Select the highest-value actionable feature or fix with a concrete acceptance condition. Record the selection and update both shared gameplay and platform behavior as applicable.
2. Start from the latest merged source in an isolated worktree. Reuse existing gameplay, offline scoring and native platform adapters. Associate changes with a source commit and preserve historical game sessions and the existing free capabilities.
3. Run the bank and site builds, TypeScript checks, existing tests and relevant local API integration. Add targeted regression checks for changed behavior. Build the mobile package, synchronize Capacitor and inspect the bundled origin, question count, licenses, privacy manifest and tracking exclusions.
4. Exercise the changed feature through the normal app entry points on the available iOS simulator and Android emulator or device. Verify daily and practice entry, offline use, input and timer behavior, background/resume, round transitions, final results, history, sharing and relevant rotation/accessibility behavior. Record the device, OS, build and results, including hardware-specific checks awaiting a device.
5. Check the stores' latest version and build records before incrementing identifiers. Keep iOS build numbers and Android version codes increasing. Match version names to the prepared store version. Build signed distribution artifacts using existing external signing material, then verify their identity, version and signature.
6. Upload through the available authorized store or native distribution workflows. Record artifact hashes, source commits, upload receipts and processing results. Resume matching completed uploads when a run is retried.
7. Maintain English store names, subtitle or short description, keywords, complete description, factual release notes, real screenshots, support and privacy links, review access, content rating and data disclosures. Match offline question counts and feature claims to the uploaded build. Declare the generated artwork used in store assets according to the actual asset provenance.
8. Select automatic release on each new Apple version. Keep Google managed publishing off and submit the validated candidate to the currently eligible track. Continue legitimate closed testing and apply for production access when the displayed conditions are met. Once access is approved, prepare and submit the validated production release.
9. Check store review outcomes daily, resolve actionable rejection feedback and continue the release. Keep an in-review candidate associated with its source commit while newer development is prepared for the next eligible submission.
10. After publication, verify the public product page and version. Update the website's Apple availability flag when the public page becomes available. For a new Android direct-download release, publish the signed APK to GitHub Releases, verify its signature and fresh-download hash, then update the central download URL and deploy the website.

The daily run records development, testing, upload, review and public availability as separate observed steps. Store approval and rollout times determine when a submitted build becomes available.

## Store assets checked in this session

Apple's approved version has three medium-display iPhone screenshots, three iPad screenshots, an English description and keywords, custom-domain support and marketing URLs, review instructions and the attached build. Its promotional copy for the next draft now describes rare answers, five daily questions and offline practice.

Google Play's default English listing has the app icon, feature graphic and four actual Android screenshots. Its short description has been revised to describe daily trivia, balloon lift, online play and offline practice. The store's asset flow has been updated to label the icon, feature graphic and four screenshots containing generated game artwork as AI-generated or edited. The source screenshots remain actual captures of the running app.

The single English listing change was submitted for Google review. A subsequent November 15 check confirms approval and automatic publication. Publishing overview has no outstanding review item for this change and displays the application-update-published notification. Standard publishing remains enabled. The app's production-access requirement continues to apply to the production track.

Cloudflare version `a436bfa7-ee01-44ce-b4ef-1c9d2e6d4649` publishes the website's available App Store download label on the homepage and How to play page. The site build, type check and all 22 tests passed. Live browser checks confirmed the Apple and Android links, GA4 and AdSense verification metadata, and zero ad-delivery scripts or units.

The subscription proposal remains an internal design deliverable. The current app versions retain their free functionality. Website advertising remains in verification-only mode.

## Official workflow references

- [Apple version release options](https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/select-an-app-store-version-release-option/)
- [Google review and publishing controls](https://support.google.com/googleplay/android-developer/answer/9859654?hl=en)
- [Google store-asset AI declarations](https://support.google.com/googleplay/android-developer/answer/17262077?hl=en)


## November 16 public-link check

The generic app URL and explicit US listing both rendered RARE Air in happycoin Chrome. The US listing still carries the published 1.0 description with 400 offline prompts. A China-store search for RARE Air did not return this app; that search alone does not establish the configured regional availability. App Store Connect requires a fresh login, so current territory settings could not be verified. The website now uses the verified full US listing URL. A storefront URL cannot guarantee installation with an Apple Account from another region. The owner was asked for the exact error and account region to complete diagnosis.

## 2026-11-17T15:29:36+08:00 additional Google administrator

The owner confirmed administrator access for the requested additional Google identity. The RARE Air GA4 property and shared AdSense publisher show administrator access, with AdSense displaying active status. The shared publisher grant includes its associated sites and the linked AdMob access described by Google. Recipient details and verification screenshots are retained in ignored `release/private/google-access-20261117/`.

## November 18 homepage release handoff

Website source `785532e` is live in Cloudflare deployment `1c613514-932f-49ed-9d1b-a741d76f301c`. It strengthens homepage action typography and contrast, synchronizes the equipped rewards icon and clarifies free-passport onboarding. Type checking, all 68 tests, the real local D1 rewards integration and shared mobile web packaging passed. Integrate this commit into the next native release candidate before synchronization, native testing and store upload. See [the progress record](../PROGRESS.md) for verification scope.


## November 19 final release and store handoff

The final native candidate is 1.0.4 build/code 7, source `1a5fd67`. It includes the November 18 readable homepage and rewards, Korean, ordered device-language selection, one recovered source-verified question and the native scrolling/decoration corrections. The previous 1.0.3 (6) release stays available with its original signature and checksum.

Android direct release `android-v1.0.4` is public. The fresh anonymous APK download matches SHA-256 `a36490df2198158d9c66a0a0d4645a4655f9ed9c84b35e8daad494ea44d32d52`, and its signing certificate matches the existing key. The prepared AAB hash is `70aecd0f994c35c4708299a1a88daf7911a13206f92dfd067346d60cc270ff25`. Website source `9092bb1` and Cloudflare `e6106ebe-4024-4b4e-99c9-8b620327fa8b` point all current translated download entries to the final APK.

Final native packages contain 602 prompts and eleven language catalogs. Both Android packages and the iOS archive match the verified shared JavaScript and homepage CSS, including the actual companion DOM layer correction. Analytics and advertising are excluded. Native Android API 36 and iOS 26.5 iPhone/iPad UI checks passed, including icons, online lifecycle recovery, accepted input, offline completion, sharing, Korean persistence and tablet rotation. Exact per-device cases and screenshots are retained privately. Physical-device-only behavior remains a hardware follow-up.

The iOS archive is `release/artifacts/2026-11-19-build7/RARE-Air-1.0.4.xcarchive`, with team and strict signature verification intact. It has been archived and tested. Distribution cloud signing, IPA export, upload and review submission are pending. An earlier build 6 CLI export repeated the known No Accounts/distribution-key failure. Use the previously verified Organizer session and cloud-signing workflow when computer control returns. Do not infer GUI logout from that CLI message or upload older build 5/6 artifacts.

Official Apple Lookup on November 19 verified public version 1.0.1, released November 17. Its storefront language metadata is English, while the previously verified build contains ten in-app catalogs. Google Play's November 18 dashboard observation showed closed-track 1.0.1 published, one opted-in tester and production eligibility pending twelve testers for fourteen continuous days. This run lacked browser/computer control, so these Google observations retain their original date. The happycoin Gmail search returned no matching review message after November 17, which does not establish a new store state.

Before Google upload, save the prepared account creation, optional User IDs, deletion URL and public interaction/block/report disclosures from `google-data-safety-draft.json`. Verify current version codes and queue, then upload the signed build 7 AAB to the eligible track and keep managed publishing off. For Apple, verify the current store draft, attach processed build 7 and choose automatic release after approval. The current metadata describes eleven languages, 602 bundled prompts and earned cosmetics accurately. Browser and computer tools were unavailable during this run, so no store form or submission is claimed.
