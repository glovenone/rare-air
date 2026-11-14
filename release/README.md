# Mobile release preparation

## Product configuration

- Name `RARE Air: Daily Trivia`
- Language English (U.S.)
- Identifier `com.letuzhixing.rareair`
- Version 1.0, build 1
- Minimum iOS 15.4, matching the game’s dialog, array and structured-clone APIs. [WebKit release notes](https://webkit.org/blog/12445/new-webkit-features-in-safari-15-4/)
- Games, Trivia and Word on Apple
- Free to play
- Apple release mode is manual
- iPhone and iPad distribution, with 174 overseas regions selected for the release draft

English store text is in [store-metadata.en-US.json](store-metadata.en-US.json). The privacy and support URLs use the purchased domain `krillionunlimited.top`. The website and all seven public pages are live over verified HTTPS. Set `SITE_URL` to override the build origin.

## Build

```sh
npm ci
npm run check
npm test
npm run mobile:sync
```

For a custom origin, run the site and mobile build commands with `SITE_URL` set to that HTTPS origin. The mobile build bundles all 400 released practice prompts. Third-party license texts are bundled under `/licenses/` and linked from About & privacy.

### Android

Use JDK 21 and Android SDK 36. Set `JAVA_HOME` and `ANDROID_HOME` to those installations.

```sh
./android/gradlew -p android assembleDebug
RARE_ANDROID_SIGNING_PROPERTIES=/absolute/private/android.properties \
  ./android/gradlew -p android bundleRelease
```

The external signing properties file contains `storeFile`, `storePassword`, `keyAlias` and `keyPassword`. Restrict it and its keystore to the owner. Keep a secure backup of the upload key for future app updates.

The bundle is produced at `android/app/build/outputs/bundle/release/app-release.aab`. Verify its signature with JDK `jarsigner -verify`. The debug APK is at `android/app/build/outputs/apk/debug/app-debug.apk`.

### iOS

Open `ios/App/App.xcodeproj` in Xcode. Use the configured Apple team, register the bundle identifier, and select a distribution provisioning profile. Build and archive the App scheme for a generic iOS device. `export-options.plist` configures an App Store Connect export with manual version numbering.

The simulator can build with `CODE_SIGNING_ALLOWED=NO`. A device archive built that way requires distribution signing before upload. Sign in through Xcode Settings → Accounts to make the developer team available to Xcode.

## Store assets

- `google-play-icon.png` is 512 × 512
- `google-play-feature.png` is 1024 × 500
- `feature-graphic.html` is the source composition for that graphic
- `screenshots/ios-6.9/01-updraft.png` is a captured iPhone 17 Pro Max screen at 1320 × 2868
- `screenshots/ios-6.3/` contains three captured iPhone 17 Pro screens at 1206 × 2622
- `screenshots/ipad-13/` contains captured iPad Pro screens in portrait at 2064 × 2752 and landscape at 2752 × 2064
- `screenshots/android-phone/` contains four API 36 emulator captures at 1080 × 2400
- The iOS app icon is 1024 × 1024

The medium-display iPhone and iPad 13-inch sets have been uploaded to App Store Connect, with three screenshots assigned to each device family. Google Play has the icon, feature graphic and four Android screenshots assigned and saved in the complete English listing. JPEG upload copies are converted from the captured PNGs without changing their dimensions. The current App Store form treats the 6.1/6.3-inch set as required and the captured 6.9-inch set as optional. The feature graphic reuses the project's generated sky, balloon, cloud art and locally licensed fonts.

## Privacy preparation

Online gameplay sends a randomly assigned player identifier, chosen answers, scores and timing information to the Cloudflare service. Local offline practice and its history stay on the device. Cloudflare service observability processes technical request information. Native sharing sends a score only through a destination chosen by the player.

The Apple privacy draft declares User ID, Gameplay Content, Product Interaction and Other Diagnostic Data for App Functionality. It conservatively marks these categories linked to the player identity because online sessions use the persistent anonymous identifier and request diagnostics may be correlatable. Tracking is false for each category. The app's privacy manifest matches this draft. The publisher should verify the final labels against deployed infrastructure before publishing them. [Apple privacy definitions](https://developer.apple.com/app-store/app-privacy-details/)

The Google Data safety form has been saved for review, with its source record in [google-data-safety-draft.json](google-data-safety-draft.json). Cloudflare is the hosting processor. The connected launch screen requests the daily summary automatically, so anonymous identifiers, app interactions and diagnostics are marked required. Typed answers are optional because players can choose offline practice. The form declares HTTPS transport, the hosting service-provider sharing exception and the current absence of a verified deletion-request workflow. Diagnostics include the Analytics purpose for service monitoring and error diagnosis. [Google Data safety definitions](https://support.google.com/googleplay/android-developer/answer/10787469)

The Apple age questionnaire calculated 13+ for most regions. It records frequent contests because daily leaderboard rankings are part of play, infrequent fantasy violence and weapon references from a small number of curated book and board-game prompts, infrequent alcohol references from cocktail and whisky knowledge questions, and the absence of the other listed mature themes. Regional ratings are calculated by Apple. Alcohol references make the app unavailable in Afghanistan and Morocco. New daily question packs need to preserve this content scope. Review the calculation when adding new content categories.

## Verification on November 13, 2026

- Eleven unit tests passed, including five-round offline scoring, hidden prompt state, idempotency and stale-session handling, a complete WeChat-shaped keyboard and touch flight, and long-term wrapping across all 400 prompts
- Local Worker/D1 integration tests passed, including concurrent answers, ownership, timeout and historical-session compatibility
- Seven crawlable routes passed metadata, heading and internal-link checks, with an unknown URL returning HTTP 404
- A browser practice flight completed through the normal entry point with four correct answers and an expired final round, producing a 3,500-meter report and accepted-answer review
- iPhone simulator online practice accepted two consecutive answers, confirming native transport and cookie ownership across requests
- iOS simulator build and unsigned device archive succeeded
- Android debug APK and signed release AAB builds succeeded, and the app launched in an API 36 emulator
- The refreshed Android bundle packages the custom-domain origin and passes JAR signature verification
- iPhone offline practice completed five rounds through its UI, producing a 4,000-meter report, saving history and opening the native share sheet
- Medium iPhone offline input accepted Dark blue for 1,000 meters and advanced to the next prompt
- iPad rotation passed in both orientations, and offline input accepted New Jersey for 100 meters
- The custom-domain website completed a five-stage daily flight through its UI, with three correct answers, two expired rounds and a 3,000-meter report
- All seven HTTPS pages, robots.txt and sitemap.xml returned HTTP 200, an unknown URL returned 404, and HTTP redirects to HTTPS with 301
- Google and Cloudflare public resolvers returned the new Cloudflare nameservers and DS record, with authenticated A responses confirming the DNSSEC chain
- Android emulator touch input accepted Wisdom and Gold for 500 meters each, completed a five-round 1,000-meter flight, saved the result in history and opened the native share sheet with the custom-domain link
- WeChat DevTools completed a five-round offline flight with three correct answers, two skips and a 1,600-meter report, verified native keyboard confirmation, balloon dragging and saved history
- WeChat Canvas wrapping now measures and renders long hyphenated terms consistently within the question card
- Physical-phone validation remains pending for Android and WeChat

## Publication handoff

The Apple app record has been created and its English description, keywords, manual release mode, category, subtitle, free price schedule and overseas availability saved. The supplied review contacts and updated 400-prompt review notes have been saved. Xcode's native Archive and Distribute workflow successfully cloud-signed and uploaded version 1.0 build 1. App Store Connect processed the build and it is attached to the version draft. The exported `artifacts/RARE-Air-1.0-domain/App.ipa` passes strict code-signature verification and packages the custom-domain API origin. Apple support, marketing and privacy-policy URLs have been updated to the new domain. The publisher approved the privacy-label accuracy declaration on November 13, 2026, and App Store Connect confirmed those labels as published. Add for Review passed validation and created a draft submission containing iOS version 1.0 build 1. On November 14, 2026 at 09:13 Asia/Shanghai, App Store Connect confirmed that version 1.0 build 1 had been submitted and was Waiting for Review. The submission ID is `46be5a4a-1adc-4acf-9bb6-fd36554af79b`. App review and the subsequent manual App Store release remain pending.

The Google app record has been created under happycoin after the publisher approved its developer-policy and U.S. export declarations. The dashboard requires at least 12 opted-in closed-test participants for 14 continuous days before a production-access application. IARC terms and the inherited trader status were approved by the publisher. The trader setting, IARC questionnaire and Data safety form have been saved. IARC assigned ESRB Everyone, PEGI 3, USK 6, Korea 15+ and Taiwan parental guidance 15, with textual violence and alcohol references declared. The complete English listing is ready for review, with its icon, feature graphic and four screenshots saved. The support website and privacy policy use the custom domain. The Advertising ID declaration records no usage, matching the merged manifest and dependencies.

Google accepted the signed version 1 (1.0) AAB with target SDK 36 and minimum SDK 24. The Alpha closed-test release and notes passed release validation with no errors. Two warnings cover missing testers and an optional obfuscation mapping file, with minification disabled in this build. Publishing overview completed its automatic checks and shows 13 unpublished changes ready for review. Submission and rollout remain pending. Based on the English overseas audience, the initial closed-test countries were set to the United States, United Kingdom, Canada, Australia and New Zealand. The optional Google Play Games on PC enrollment was removed while preparing the phone release. The publisher deferred tester recruitment on November 13, 2026. The closed-test draft is saved, and the account's production-access testing requirement remains outstanding. The publisher approved Apple's content-rights declaration and supplied the review contact details. The content-rights declaration has been saved.

The publisher approved and completed the website publication at `https://krillionunlimited.top` on Cloudflare Free. Spaceship now delegates to `raquel.ns.cloudflare.com` and `will.ns.cloudflare.com`. The previous DNSSEC DS record was removed before migration, and the new Cloudflare DS record was added after delegation changed. Both public resolvers authenticate the resulting A records. Universal SSL is active and HTTP redirects to HTTPS. The original Workers endpoint remains enabled for existing clients. The daily 100-question automation now validates the custom-domain endpoint and starts from merged `origin/main`. Domain research, account screenshots and binary artifacts are stored in ignored local release folders.

## WeChat game

The native Canvas project is in `wechat/`, with `npm run wechat:build` producing `dist/wechat`. The 1.3 MB build packages the released offline bank, shared scoring, native keyboard input, touch controls, updraft effects, local flight history and WeChat sharing. Its offline controls and complete flight flow have been exercised in WeChat DevTools. Daily mode correctly reports a connection failure because `krillionunlimited.top` is absent from the test account's legal request domains. The publisher selected the supplied official test AppID for local development on November 13, 2026. The local handoff archive is `artifacts/RARE-Air-WeChat-Test.zip`. Online phone testing and formal submission remain deferred until a formal game AppID, upload rights and the custom-domain request whitelist are available. See [WeChat setup](../wechat/README.md).
