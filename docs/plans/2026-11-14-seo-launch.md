# RARE Air search and launch work

## Objective

Help English-speaking daily-game players discover and try the live Cloudflare game.

## Audit on November 14, 2026

- Seven public pages, robots.txt and sitemap.xml return HTTP 200. An unknown path returns 404.
- Canonicals use the owned HTTPS domain. The public API reports 500 questions.
- The social image is a 1.5 MB square app icon. The existing 1280 × 720 gameplay screenshot is about 60 KB.
- The comparison page lacks social metadata and links to the other guides.
- Guide fonts lack font-display. Search Console has no existing property in the connected Google account.
- PageSpeed's unauthenticated API returned quota-exceeded. Core Web Vitals remain unmeasured.

## Implementation

1. Reuse the existing gameplay screenshot for large social previews. Add the Search Console verification tag obtained from the connected account.
2. Extend the current static generator with a rare-answer explanation and a strategy guide. Add contextual links, breadcrumbs and consistent sharing metadata. Keep gameplay answers server-side.
3. Make all guide pages discoverable from the existing public guides, refresh the sitemap and add font-display to guide fonts.
4. Validate generated HTML, links, JSON-LD, local Worker behavior, existing tests and the deployment. Verify Search Console and submit the sitemap.
5. Publish factual launch posts through available accounts and submit the game to relevant free directories. Record URLs and distinguish pending submissions from published listings.

## Verification

Run the bank build, site build, TypeScript check, test suite and local API integration. Check every sitemap URL and internal link, canonical, description, social image and structured-data payload. Exercise the original gameplay entry points. Inspect the live site and search ownership result after deployment.

## Content decisions

Target daily trivia, rare-answer trivia and repeatable practice. Use the game's own name and describe fixed editorial rarity tiers accurately. Use publicly documented mechanics and existing project assets in outreach. Follow each destination's submission rules.
