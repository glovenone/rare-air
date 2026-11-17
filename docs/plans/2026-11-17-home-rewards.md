# Home readability and earned avatar rewards

## Goal

Make the daily challenge and all main game modes readable and immediately actionable. Add a visible customization center with selectable pilot icons, existing companion and trail rewards, and earned-point avatar redemption.

## Implementation

1. Replace tiny homepage text links with a responsive, high-contrast six-card launch menu. Keep the sky artwork and balloon interaction. Use at least 16px action labels and 44px targets, with a larger daily launch button. Let short screens scroll instead of shrinking labels.
2. Reuse the existing illustrated companion assets for pilot icons. Three icons are freely selectable. Additional icons cost earned Sky points, independently of existing free streak companions and trails.
3. Derive points from verified online results. Each UTC daily completion finished on its own day, and each chapter, earns 10 completion points plus one point per 100 best meters, up to 60 per unique challenge. Replays improve the best reward without multiplying completion credits. Archive and unstructured practice completions do not earn points. Existing qualifying history counts after explicit import.
4. Store avatar preference and redemptions in Cloudflare D1 under the flight passport. Use a conditional atomic insert and a unique account/item key for balance consistency and retry safety. Free guest icon preferences remain on the device. A passport is required for redemption and cross-device synchronization.
5. Show owned items, current balance, prices, earning rules, confirmation and success/error feedback. Keep rewards visible through a direct homepage action and the passport. Retain existing streak customization in the center.
6. Translate new interface strings into the nine existing target languages. Validate desktop, 320px mobile and Arabic RTL, including modal scrolling, focus visibility and contrast. Exercise guest selection, earned redemption, insufficient funds, repeated and concurrent requests, account changes, recovery and deletion.
7. Run type checking, the full existing suite, real D1 integrations and mobile bundle generation. Push reviewed source and deploy the website on Cloudflare, then verify the live layout and endpoints. Store builds follow the existing release pipeline and their own acceptance checks.

## Files

- Homepage and styles in `public/index.html` and `public/home.css`
- Rewards catalog and UI in `public/avatars.js` and `public/wardrobe.js`
- Points and D1 redemption in `src/rewards.ts` and `migrations/0006_avatar_rewards.sql`
- Passport integration in `src/auth.ts`, `src/passport-api.ts` and `public/passport.js`
- New message extraction and all nine message catalogs
- Focused points tests and a local-only D1 integration
