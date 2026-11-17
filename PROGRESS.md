# Progress record

Times use Asia/Shanghai. Deployment, native packaging and store publication are recorded separately.

## 2026-11-18 07:34

Implemented the owner's homepage readability refinement. Main action titles now use 21px desktop and 19px phone typography, with dark colors, opaque cards and larger descriptions. The rewards entry shows the selected pilot icon, and guest onboarding explains how to enable earned points. Phone reward summaries are compact and empty status messages occupy no space.

The existing 68-test suite and TypeScript check passed. A real local D1 integration passed for reward ownership, imported history, balances, repeated and concurrent redemptions, account recovery and deletion. Browser checks in happycoin Chrome confirmed free-icon persistence after reload and both homepage previews changing together. A local-only 180-point fixture redeemed the 120-point moon moth, leaving 60 points. The 600-point dragon then reported a 540-point shortfall. These fixtures remain local.

The shared mobile web bundle built successfully. This entry records implementation and local verification. A later entry records the website deployment and native release state.

## 2026-11-18 07:35

Pushed implementation commit `785532e` to GitHub main and deployed Cloudflare version `1c613514-932f-49ed-9d1b-a741d76f301c`. Fresh downloads of the homepage, Chinese and Arabic HTML, homepage stylesheet and rewards JavaScript exactly matched the committed assets. The website's GA4 configuration is present and advertising delivery remains disabled.

Live happycoin Chrome checks confirmed 21px dark action titles on desktop, 19px at 320px, a single-column narrow layout and no horizontal overflow. Selecting a free icon updated both homepage previews and survived reload. The original guest icon was restored after this check. Browser error logs were empty. Actual website screenshots and asset hashes are retained in the main checkout's ignored `release/private/home-visibility-20261118/`.

Native store updates incorporating this refinement remain pending. Mobile release work should integrate source `785532e` before rebuilding its candidate.
