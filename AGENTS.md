# RARE Air project rules

- Keep the official website at https://krillionunlimited.top/.
- Open all task-related webpages in the Chrome profile named `happycoin`, as requested by the owner on November 15, 2026. Use that profile for Google Analytics, App Store Connect and other account workflows.
- Keep Android APK and Apple App Store links visible on the homepage and the How to play page. Maintain their URLs in `src/site-config.js` so site builds preserve both entries.
- Publish signed release APKs as GitHub Release assets and link to the APK file directly. Verify the release signature, package, version and SHA-256 before replacing the public download. Keep the signing key and passwords outside the repository.
- Verify the Apple public store URL and availability when updating iOS download information. Record approval, manual release and public availability according to the actual state shown by Apple.
- Use the owner's Google Analytics 4 website stream for daily users, sessions, page views, traffic sources and app-download clicks. Keep the public measurement ID in `src/site-config.js` and include the website tag on every public HTML page through `scripts/build-site.mjs`.
- Load website analytics after the visitor allows analytics. Support changing that choice. Send page paths and download platform events, and keep typed answers, player identifiers and URL query strings out of analytics.
- Keep website analytics out of packaged iOS, Android and WeChat gameplay. Update the privacy policy with any deployed analytics changes.
- After website updates, verify the public download links and analytics configuration, run the existing build checks, push the source to GitHub and deploy the website to Cloudflare. Record any pending account setup or unverified availability accurately.
