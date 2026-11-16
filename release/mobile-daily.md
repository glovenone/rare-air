# Daily iOS and Android releases

Updated November 16, 2026, Asia/Shanghai.

## November 16 candidate

Prepared iOS **1.0.1 build 2** and Android **1.0.1 versionCode 2** from the topic-practice source and the first trend-led question addition. Both package 601 offline questions. Online practice adds nine free subject choices and retains the selected subject on another flight. The candidate store text and release notes in `store-metadata.en-US.json` describe this build.

TypeScript, all 26 unit tests, the local Worker/D1 integration suite, site generation, mobile bundling and Capacitor synchronization passed. The iPhone 17 Pro simulator build and device archive succeeded. Android debug APK, signed release APK and signed AAB builds succeeded. The APK verifies with v2 signing and the same certificate as the public 1.0 APK. Its package is `com.letuzhixing.rareair`, minimum SDK 24 and target SDK 36. The AAB passes JAR signature verification. The shared mobile JavaScript was checked for all 601 question IDs and the production origin, and its HTML excludes website analytics and AdSense tags.

The new debug builds were installed and launched on the iPhone 17 Pro iOS 26.5 simulator and the Rare_Air_Validation Android emulator. Full native UI verification remains pending because the computer-control tool continues reporting a locked Mac. iOS distribution export failed with `No Accounts` and no available distribution certificate. The owner has been asked to unlock the desktop and check Xcode's developer account. Store upload and submission remain pending. The public app versions and existing direct-download URL still refer to the preceding release.

Candidate APK, AAB and hashes are saved in the main checkout's ignored `release/artifacts/2026-11-16/`. The iOS archive remains in the daily worktree's ignored release artifacts. The private daily execution record holds exact paths and recovery steps. Before uploading, verify current store build records to confirm these candidate build numbers are still available, then continue the existing automatic-release workflow.

## Owner authorization and current state

The owner authorized daily feature development, testing, store-information maintenance, submission and publication of ready updates for both apps. Future iOS versions use automatic release after approval. Google Play uses standard publishing with managed publishing off.

Apple approved iOS 1.0 build 1. On November 15 the approved version was released into its existing 174 selected regions, and App Store Connect changed to **Ready for Distribution**. Its initial version had used manual release. The public page initially showed page-not-found, then became available during the same session. The US listing now displays the correct app, developer, free price, English language, screenshots and iPhone/iPad support. The website's availability flag has been updated following that public verification. [Public App Store listing](https://apps.apple.com/us/app/rare-air-daily-trivia/id6834294339)

Created the next iOS version draft, **1.0.1**, and saved **Automatically release this version** with immediate availability to all eligible users after approval. The draft inherits the existing listing, screenshot sets and review details. It awaits a matching candidate build and factual release notes. The revised promotional text has been saved in this draft.

Google Play confirms managed publishing is off. Version 1.0 (1) is approved and open on the Alpha closed-test track. The latest dashboard check reports zero opted-in testers. The production-access application requires the account's displayed testing conditions and subsequent Google approval. See [Android testing](android-testing.md) for enrollment, outreach and feedback records.

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
