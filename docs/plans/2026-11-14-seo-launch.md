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

## Delivered

- Cloudflare version `60d6d310-de25-424f-aa01-b89d7982262d` serves nine public pages. All sitemap URLs, robots.txt, the preview image and the puzzle API returned HTTP 200 after deployment. An unknown path returned 404. HTTP redirects to HTTPS.
- The social preview reuses the 59,826-byte gameplay screenshot. The new rare-answer explanation and strategy guide are linked from the existing guides. The static build refreshes the displayed question count from the bank.
- Twelve tests, TypeScript checks, local Worker/D1 integration including snapshot and timeout branches, and alternate-origin/idempotent site builds passed.
- GitHub's project homepage now points to the custom domain. Topics include daily-game, trivia, browser-game, cloudflare-workers and open-source-game.
- A public listing suggestion was posted to Awesome Daily Games and verified open. Editorial acceptance remains pending. [Submission](https://github.com/ryviuszero/awesome-daily-games/issues/48)
- Search Console's verification tag is deployed. Browser verification and sitemap submission are pending because the Mac locked during the browser workflow. Search indexing and real-user Core Web Vitals remain unverified.

## Further outreach prepared

Everydle offers a free submission form with accurate gameplay, daily reset, language and payment fields. All the Dles accepts email suggestions. Review the live form and destination rules before submitting. [Everydle](https://everydle.net/submit/), [All the Dles](https://allthedles.com/submit/)

Hacker News explicitly prohibits generated text and automated posting. A human-authored submission would need to follow its current rules. [Hacker News guidelines](https://news.ycombinator.com/newsguidelines.html)

### Short social post draft

> How high can your obscure knowledge take you?
>
> RARE Air is a free browser trivia game. Five questions, 30 seconds each, and rare correct answers lift your balloon up to 5,000 m.
>
> Play the shared daily flight or keep exploring in practice. No signup.
>
> https://krillionunlimited.top/

This draft has not been posted. The browser was locked before social-account access and community rules could be checked.
