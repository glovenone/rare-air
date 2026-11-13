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

English store text is in [store-metadata.en-US.json](store-metadata.en-US.json). The prepared privacy and support URLs use the purchased domain `krillionunlimited.top`. Domain activation and website deployment are pending. Both pages must be reachable before store review. Set `SITE_URL` to override the build origin.

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
- The iOS app icon is 1024 × 1024

Capture the required medium-display iPhone set, the final iPad 13-inch set and at least two Android phone screens after device validation. The current App Store form treats the 6.1/6.3-inch set as required and the captured 6.9-inch set as optional. Use the installed app to capture platform-specific screenshots. The feature graphic reuses the project's generated sky, balloon, cloud art and locally licensed fonts.

## Privacy preparation

Online gameplay sends a randomly assigned player identifier, chosen answers, scores and timing information to the Cloudflare service. Local offline practice and its history stay on the device. Cloudflare service observability processes technical request information. Native sharing sends a score only through a destination chosen by the player.

The Apple privacy draft declares User ID, Gameplay Content, Product Interaction and Other Diagnostic Data for App Functionality. It conservatively marks these categories linked to the player identity because online sessions use the persistent anonymous identifier and request diagnostics may be correlatable. Tracking is false for each category. The app's privacy manifest matches this draft. The publisher should verify the final labels against deployed infrastructure before publishing them. [Apple privacy definitions](https://developer.apple.com/app-store/app-privacy-details/)

The Google Data safety form has been saved for review, with its source record in [google-data-safety-draft.json](google-data-safety-draft.json). Cloudflare is the hosting processor. The connected launch screen requests the daily summary automatically, so anonymous identifiers, app interactions and diagnostics are marked required. Typed answers are optional because players can choose offline practice. The form declares HTTPS transport, the hosting service-provider sharing exception and the current absence of a verified deletion-request workflow. Diagnostics include the Analytics purpose for service monitoring and error diagnosis. [Google Data safety definitions](https://support.google.com/googleplay/android-developer/answer/10787469)

The Apple age questionnaire calculated 13+ for most regions. It records frequent contests because daily leaderboard rankings are part of play, infrequent fantasy violence and weapon references from a small number of curated book and board-game prompts, infrequent alcohol references from cocktail and whisky knowledge questions, and the absence of the other listed mature themes. Regional ratings are calculated by Apple. Alcohol references make the app unavailable in Afghanistan and Morocco. New daily question packs need to preserve this content scope. Review the calculation when adding new content categories.

## Verification on November 13, 2026

- Ten unit tests passed, including five-round offline scoring, hidden prompt state, idempotency and stale-session handling, plus a complete WeChat-shaped keyboard and touch flight
- Local Worker/D1 integration tests passed, including concurrent answers, ownership, timeout and historical-session compatibility
- Seven crawlable routes passed metadata, heading and internal-link checks, with an unknown URL returning HTTP 404
- A browser practice flight completed through the normal entry point with four correct answers and an expired final round, producing a 3,500-meter report and accepted-answer review
- iPhone simulator online practice accepted two consecutive answers, confirming native transport and cookie ownership across requests
- iOS simulator build and unsigned device archive succeeded
- Android debug APK and signed release AAB builds succeeded, and the app launched in an API 36 emulator
- The refreshed Android bundle packages the custom-domain origin and passes JAR signature verification
- iPhone offline practice completed five rounds through its UI, producing a 4,000-meter report, saving history and opening the native share sheet
- Medium iPhone home capture is available at `screenshots/ios-6.3/01-home.png`
- Android touch interaction, iPad rotation, WeChat phone controls and the remaining platform screenshots still need device validation

## Publication handoff

The Apple app record has been created and its English description, keywords, manual release mode, category, subtitle, free price schedule, overseas availability and privacy draft saved. The supplied review contacts and updated 400-prompt review notes have been saved. An earlier signed App Store IPA uses the Workers origin and includes native sharing and the 400-prompt offline bank. The refreshed custom-domain device archive builds successfully. Its distribution export currently fails because Xcode cannot load its account credentials or distribution certificate while the Mac is locked. Retry signing after manual unlock and verify the resulting IPA before upload. Existing team distribution certificates were visible in the Apple portal.

The Google app record has been created under happycoin after the publisher approved its developer-policy and U.S. export declarations. The dashboard requires at least 12 opted-in closed-test participants for 14 continuous days before a production-access application. IARC terms and the inherited trader status were approved by the publisher. The trader setting, IARC questionnaire and Data safety form have been saved. IARC assigned ESRB Everyone, PEGI 3, USK 6, Korea 15+ and Taiwan parental guidance 15, with textual violence and alcohol references declared. The English store name and descriptions are saved as a listing draft. Store listing images, binary uploads and test-track configuration remain in progress. The publisher approved Apple's content-rights declaration and supplied the review contact details. The content-rights declaration has been saved.

The prepared website pages and new app versions await publication. The publisher purchased `krillionunlimited.top` at Spaceship. A Free Cloudflare zone is prepared. Nameserver migration and deployment await the requested DNSSEC-migration and publication approval. Domain research, account screenshots and binary artifacts are stored in ignored local release folders.

## WeChat game

The native Canvas project is in `wechat/`, with `npm run wechat:build` producing `dist/wechat`. The 1.3 MB build packages the released offline bank, shared scoring, native keyboard input, touch controls, updraft effects, local flight history and WeChat sharing. It has displayed its home screen in WeChat DevTools. Device interaction and online request-domain validation remain pending. The supplied AppID is the official test account, and a formal game AppID and upload rights are required before submission. See [WeChat setup](../wechat/README.md).
