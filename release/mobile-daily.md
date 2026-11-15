# Daily iOS and Android releases

Updated November 15, 2026, Asia/Shanghai.

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

The single English listing change was submitted for Google review in this session. Its automated common-issue checks completed, and publishing overview confirms that the change is now under review. Standard publishing remains enabled, so an approved change is published automatically.

Cloudflare version `a436bfa7-ee01-44ce-b4ef-1c9d2e6d4649` publishes the website's available App Store download label on the homepage and How to play page. The site build, type check and all 22 tests passed. Live browser checks confirmed the Apple and Android links, GA4 and AdSense verification metadata, and zero ad-delivery scripts or units.

The subscription proposal remains an internal design deliverable. The current app versions retain their free functionality. Website advertising remains in verification-only mode.

## Official workflow references

- [Apple version release options](https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/select-an-app-store-version-release-option/)
- [Google review and publishing controls](https://support.google.com/googleplay/android-developer/answer/9859654?hl=en)
- [Google store-asset AI declarations](https://support.google.com/googleplay/android-developer/answer/17262077?hl=en)
