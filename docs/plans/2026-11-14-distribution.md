# RARE Air distribution work

## Goal

Bring English-speaking players to the live browser game through relevant game directories, public launch posts, search discovery and player sharing.

## Implementation and verification

1. Submit accurate gameplay information to relevant free directories and save each receipt. Record pending review separately from a published listing.
2. Prepare account-based launch channels through their normal workflows. Use the connected accounts when available and request any mandatory agreement at the actual submission step.
3. Improve the existing web share action with the device's system share sheet and clipboard fallback. Verify success, cancellation and fallback cases with isolated tests.
4. Add an IndexNow ownership-verification response backed by a Cloudflare secret. Keep its value outside the public repository. Publish the response and submit the site's nine sitemap URLs using the documented API.
5. Run the complete test suite, local Worker/D1 integration and live checks before recording deployment and publication results.

## Existing channel constraints

- The Dles explicitly excludes games with generative-AI content. Its GitHub suggestion workflow follows the same listing policy. RARE Air uses generated artwork and AI-assisted content preparation. [Submission policy](https://tally.so/r/mOKOea)
- Hacker News prohibits generated text and automated posting. [Community guidelines](https://news.ycombinator.com/newsguidelines.html)
- Google Search Console needs the connected Chrome account. The Mac was locked and the Chrome extension session timed out at the start of this work. The in-app browser can handle public submission forms.
- Gmail was suggested for email-only directory submissions. Connection is pending.

## Confirmed receipts

On November 14, 2026, the following eight sites displayed successful submission receipts. Editorial review is pending for all eight. Each received one application using the live URL, the RARE Air name and the public support address where a contact was needed.

| Directory | Receipt |
| --- | --- |
| [Wordleverse](https://wordleverse.net/submit) | Submission received, review pending |
| [Everydle](https://everydle.net/submit/) | Submitted for private review |
| [Listdle](https://listdle.com/submit) | Submission received, review pending |
| [DleGamesHub](https://dlegameshub.com/submit/) | Received for play and verification |
| [Dailydles](https://dailydles.com/submit) | Received for human review |
| [Today's Dailies](https://todaysdailies.com/submit) | RARE Air in the review queue |
| [puzzled.online](https://puzzled.online/submit.html) | Submitted, awaiting verification |
| [Nextdle](https://nextdle.com/suggest) | RARE Air in the review queue |

Dailydles asks for two independent signals of real players. The notes explicitly disclose that these signals are still pending and ask the reviewer to hold the suggestion if more evidence is needed.

Screenshots of all eight receipts are kept in the local ignored release/private/promotion directory. puzzled.online requires a difficulty estimate, so the submission uses 3 out of 5 and the Web platform. Other categories use Trivia where available.

## Prepared channels awaiting a user step

- Daily Games to Play has a complete application awaiting the mandatory acceptance of its terms. The confirmation request is pending. [Terms](https://dailygamestoplay.com/terms)
- vibedgame has a local draft with description, repository link, cover and three screenshots, under Puzzle, Free, Play in browser. The draft selects November 17, the earliest allowed day when it was prepared. It still needs account sign-in and final submission. The current handoff page is GitHub sign-in. [Submission](https://vibedgame.com/submit)
- All the Dles, Seekdle and Daily Game Index accept email submissions. Gmail access is pending. [All the Dles](https://allthedles.com/submit/), [Seekdle](https://seekdle.com/submit/), [Daily Game Index](https://dailygameindex.com/about/)
- Reddit WebGames has been opened for rule review. The in-app browser is signed out, and the connected Chrome account is unavailable while the Mac is locked. Public social posts, Product Hunt and itch.io still require account access.

## Search and sharing delivered

- Cloudflare version 15c455ba-590a-4287-8067-ac58037f86a2 adds the web system share sheet, with cancellation handling and clipboard/visible-text fallback. The privacy page describes this behavior.
- Eighteen tests and local Worker/D1 integration passed, including the frozen-session, timeout and legacy-session branches.
- The ownership response at /indexnow-key.txt was verified against the private configured value. The value is stored outside the repository and as a Cloudflare secret.
- IndexNow accepted all nine sitemap URLs with HTTP 202 at 02:21 UTC on November 14. This is receipt pending the service's key validation. Crawling and indexing remain unverified. [Protocol response meanings](https://www.indexnow.org/documentation)
