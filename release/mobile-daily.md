# Daily iOS and Android releases

Updated November 16, 2026, Asia/Shanghai.

## November 16 candidate and direct Android release

Prepared iOS **1.0.1 build 3** and Android **1.0.1 versionCode 3** from feature commit `8dc9e94`, merged through PR #5. Both package 601 offline questions. The shared game includes ten languages, nine topic choices, 54 fixed chapters, UTC daily streak rewards and private Sky Relay rooms. Rules and store metadata describe the required online connection for chapters, streaks and multiplayer.

Type checking, 45 unit tests, the original game and relay integrations and the new real-D1 progression integration passed. Browser checks completed a chapter, retained its highest score and stars, unlocked the following chapter, preserved a selected reward and checked Chinese and Arabic layouts at 320px. Local reward testing used synthetic local completion records. Production Chinese play finished five stages with a timed-out second round, retained 4,000 meters and three stars, and unlocked Chapter 2. Online API responses omit upcoming answers.

Android debug APK, signed release APK and signed AAB builds succeeded. APK v2 signing matches the public 1.0 certificate, SHA-256 `3384950945247c1887cfd5efc0973bee178d014ce5c3e7ab561293632d8cd740`. Package `com.letuzhixing.rareair`, minimum API 24 and target API 36. The AAB verifies with jarsigner. APK, AAB and iOS archive contain the identical shared game bundle, with website analytics and AdSense excluded. The Android debug candidate was installed as an upgrade on Rare_Air_Validation / Android 16 API 36. Native checks covered launch, the route and chapter pickers, online chapter entry and server timeout/round progression. The iOS candidate was installed and launched on iPhone 17 Pro / iOS 26.5. A standalone XCTest UI run on the iPhone simulator passed chapter entry, typed-answer scoring, all five rounds, report, Chapter 2 unlock and offline-practice entry. Hardware haptics still require a physical device.

The signed Android APK is public at [GitHub Release android-v1.0.1](https://github.com/glovenone/rare-air/releases/tag/android-v1.0.1). A fresh public download matches SHA-256 `d00a704402f4a9a8a4eb260b45cbf7d1f1f3d3241ff4ebf72e40c8fbf11a81c4`. The website central download URL and all localized homepage and rules links now use this release. AAB SHA-256 is `29f0eac699988afbcbbe8acfb2c81d6e929e28861e751a84dfdf173b76a1e9f9`. Main-checkout artifacts are in ignored `release/artifacts/2026-11-16-build3/`.

The iOS distribution export and upload both succeeded after Xcode account setup. IPA identity, version, ten language declarations, shared bundle and strict signature checks passed. IPA SHA-256 is `9219606d95d20984f9a4c898a8ee6cf1bdadf7a2a2613bcd97037183986abae9`. App Store Connect processed build 3, which was attached to 1.0.1 and submitted on November 16 at 16:40 Asia/Shanghai. Submission `cdd1e695-6750-4741-848b-22920612003d` displays **Waiting for Review**. Automatic release and immediate availability to all eligible users are selected. This update has not yet been approved or publicly released.

Google Play accepted and validated versionCode 3. The Alpha 1.0.1 update and refreshed IARC questionnaire were submitted together; publishing overview displays **Changes in review**, with automated pre-review checks still running at the last observation. Managed publishing remains off, so approval triggers publication to Alpha. The questionnaire retains the existing violence/alcohol references and adds user interaction restricted to invited friends, reflecting player-chosen room nicknames. No chat, location sharing, purchases or advertising were added. The rating contact now uses the preferred operational email. The upload's sole nonblocking warning concerns the absent deobfuscation file; this release does not enable minification. The latest dashboard reports **1** opted-in tester, with the production-access requirement still unmet.

The temporary browser file-URL permission was used only for the AAB upload. Restoration was requested from the owner after the upload; confirmation remains pending. Exact upload, native XCTest and submission evidence is retained in the ignored release directory.

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
