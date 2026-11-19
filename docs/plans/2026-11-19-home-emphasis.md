# Homepage emphasis and discoverable rewards

**Goal:** Make the main actions readable and expose icon selection and earned-point redemption without requiring discovery through the passport.

**Architecture:** Retain the existing sky, game handlers and Cloudflare D1 reward ledger. Change presentation and catalog grouping only; preserve the existing earning rules, costs, ownership checks and retry behavior. Shared web assets also feed native packages.

**Implementation and verification:**

1. In `public/index.html` and `public/home.css`, separate the daily primary action, four game-mode cards, a prominent gold icon/reward entry and the passport utility entry. Use explicit dark titles, larger supporting text and keyboard focus. Keep readable scrolling layouts at 320px, landscape and desktop widths.
2. In `public/wardrobe.js`, preserve the authoritative balance while distinguishing three free icons from the six earned icons. Display earning guidance openly. Keep both homepage avatar previews synchronized, with existing redemption confirmation and insufficient-balance feedback.
3. Add matching messages to all ten non-English catalogs; regenerate the English extraction, interface bundle and localized pages. Retain RTL behavior and the current eleven languages.
4. Run existing unit/type/build checks and real local D1 rewards integration. Inspect actual browser rendering, free-icon persistence, confirmation and insufficient-point states on local fixtures; never fabricate production rewards or players.
5. Record actual verification and platform scope in `PROGRESS.md` and `COLLABORATION.md`. Push source and deploy to Cloudflare under existing authorization, then compare public assets and download links. Native store releases remain separately recorded.

**Acceptance:** Main action titles are at least 20px on phones and 22px on desktop, with an opaque contrasting surface. Rewards are visible from home, guest users can equip free icons, signed-in users can redeem earned icons, and all eleven languages retain working labels and narrow layouts.
