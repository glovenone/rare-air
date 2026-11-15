# Android volunteer testing

## Current status

Updated November 15, 2026. The owner authorized recruiting real Android testers and publishing after successful testing. Recruitment is voluntary and unpaid.

Google approved and published the version 1.0 (1) Alpha closed-test release on November 15, 2026. Play Console marks the closed-test publication task complete. The enrollment page displays RARE Air, its correct publisher and testing group, and the Become a tester button. The dashboard still reports zero opted-in testers. Actual volunteer installation and use remain pending.

The closed-test track uses [RARE Air Android Testers](https://groups.google.com/g/rare-air-android-testers). Anyone may join with a Google Account. Only the owner can view the member list. The track now targets all countries and regions offered by Play Console to accommodate international volunteers. Its country targeting is independent of production.

## Joining and feedback

1. Join the group with the Google Account used on the Android device.
2. [Opt in through Google Play](https://play.google.com/apps/testing/com.letuzhixing.rareair), choose Become a tester, and install using the Google Play link provided after enrollment.
3. Remain opted in for at least 14 continuous days and try several sessions. Android 7.0 or later is required.
4. Report the device model, Android version, app version, reproduction steps, expected result and actual result through the group, private Play feedback or contact@shanxing.top.

[The group welcome post](https://groups.google.com/g/rare-air-android-testers/c/uj4S3q5jXXY) explains the process. Suggested checks cover daily completion, answer entry, incorrect answers, timing, practice, offline use, sound, sharing and background/resume.

An approval update was posted in that thread after the test release became available, with the enrollment steps and a real gameplay screenshot.

## Recruitment record

- Created the self-join Google Group and saved it as the Alpha tester audience.
- Published and pinned an open [volunteer recruitment issue](https://github.com/glovenone/rare-air/issues/2) with two real game screenshots, and added joining instructions to the repository README.
- Deployed a test-group link on the homepage and How to play page. Cloudflare version `63227a48-269c-41b8-9b41-8d63250dc077` includes it. The site build, type check and all 22 tests passed.
- [Reddit recruitment post](https://www.reddit.com/r/AndroidClosedTesting/comments/1xwh6jb/volunteer_android_testers_wanted_for_rare_air_a/) includes a real gameplay screenshot but is removed by Reddit filters. An administrator-review message is prepared, with sending disabled by the site. It has not been sent.
- The old X account failed to publish. The owner switched to `@Glove00000`, where a [Chinese developer update](https://x.com/Glove00000/status/2121759000761172093) was successfully published with two real gameplay screenshots and the official website link.
- Published a [Chinese Android-testing reply](https://x.com/Glove00000/status/2121762216475308120) beneath that update with the self-join group link, Android runtime screenshot and accurate review and 14-day enrollment details.
- Found the owner's existing CocoPlayer group with 30 members and actual historical Android feedback. Published one [voluntary invitation](https://groups.google.com/g/cocoplayer/c/gHfD8F2GMaQ) there with a real gameplay screenshot and the separate RARE Air group link. The post is verified present. Individual email delivery, new volunteers and new Play enrollment remain unverified.
- Created the `glovenone` Indie Hackers account with the owner's approval of its registration terms. The [RARE Air product page](https://www.indiehackers.com/product/rare-air) is published in English with a real gameplay screenshot, website link and free-use business model. The start date uses November 2026 and revenue is kept private. New-account community posts remain gated by the site.
- Updated the personal avatars on X, Reddit and Indie Hackers to the same generated Glove illustration. X and Indie Hackers have developer biographies, and the latter links to `@Glove00000`.
- VibedGame is waiting for the owner's approval of GitHub email-read authorization. Submission has not been completed.
- The owner confirmed disabling the temporary Chrome extension file-URL permission after the image uploads. The browser URL policy requires the owner to operate that setting manually.
- Confirmed enrolled Play testers at the start of this work were zero. The group initially contains only its owner.

## Release gates

The app's Play dashboard requires at least 12 testers continuously opted in for 14 days before applying for production access. Google then reviews the production-access application. Keep an accurate record of participation, actual feedback and fixes for that application. Confirm production access, release validation and the current review state before publishing.

The public APK remains available from [GitHub Releases](https://github.com/glovenone/rare-air/releases/tag/android-v1.0.0).

Official guidance is available in Google's [testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en) and [test setup instructions](https://support.google.com/googleplay/android-developer/answer/9845334?hl=en).

## Profile image provenance

The Glove avatar was generated with Codex's built-in image tool on November 15, 2026, following the owner's instruction to use the model directly. A reusable 512-pixel JPEG is saved at `docs/images/glove-avatar.jpg`. The full-resolution PNG remains in the maintainer's local ignored promotion assets.

The final generation prompt was as follows.

> Create one exquisite square profile avatar for an independent software maker whose online name is Glove. An original ivory-white glove character, a single hand facing the viewer with a relaxed two-finger peace gesture and a rounded thumb. Two small expressive dark teal oval eyes and a subtle warm smile sit on the palm. A deep teal knitted cuff with one tiny coral-orange fabric tab. Tactile matte clay and finely woven fabric, polished contemporary 3D illustration with editorial taste, soft studio sunlight from upper left, gentle dimensional shadows. Solid pale turquoise background with a very subtle cream halo, strong readable silhouette, close-up centered composition with generous circular crop safe margin. Restrained palette of ivory, dark teal and a tiny coral accent. Warm, curious, quietly confident independent maker personality. Beautiful and legible at a small profile photo size. No lettering, logos, watermark, props, photorealistic person, or extra hands. One finished avatar, square.
