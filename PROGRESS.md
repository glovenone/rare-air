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


## 2026-11-19 07:07

Recovered the unfinished November 18 international candidate into a new daily worktree based on current main1278282. Preserved the larger homepage labels, equipped icon previews and guest points onboarding. Added Korean, ordered browser-language preference matching, English fallback and manual-language persistence. All602question aliases and eleven message catalogs validate,99localized pages build,TypeScript checks and69tests pass. Korean uses cached machine translation with selected terminology and UI corrections, and full native-speaker review is pending.

The single recovered CMA nominee question remains unpublished at this checkpoint. Its complete five-name2026category was reverified against CMA and ABC. The first release was moved to November19UTC, the next UTC date when recovery generated the candidate. All published packs retain their existing dates. Today's ten US Trends signals yielded zero additional qualifying questions.

Prepared native1.0.3build/code6 from the integrated candidate. Browser/computer control is unavailable in this run. Current signed-in analytics and store forms require that capability to resume. Official Apple public Lookup still verifies1.0.1. The connected happycoin Gmail search found no matching review email since November17, which does not establish a new store state.


## 2026-11-19 07:13

Published Korean and preference matching from afa5f04 as Cloudflare eb6e3bf1-29dc-411a-b251-88d1b99a9ee6. All99public pages passed the live technical SEO audit. The bank now contains602questions, including the recovered CMA addition with first release November19UTC. Five real local D1/DO integration groups passed. D1 has zero reports at this check. Backend completed-session counts include maintenance tests and do not establish user growth.

Built signed Android1.0.3(6), the iOS simulator app and the device archive. Native iPhone tests passed free-icon persistence, online practice, background recovery and a five-round offline report with native sharing. A separate accepted-input check exposed an unstable test snapshot and was corrected. A test initially used process termination where backgrounding was intended, and the corrected background scenario passed.

Actual native screenshots exposed fixed header and altitude labels overlapping the homepage when scrolled. The next focused fix makes those homepage elements scroll naturally and covers the iOS status-bar safe area. Rebuild native6from the repaired source before publication. The Android emulator's first boot stalled in package services, then a cold boot with software graphics completed in24seconds. iOS archive export repeated the known CLI No Accounts/distribution-key failure. Organizer cloud signing remains the validated recovery path, and computer control is unavailable in this run.
