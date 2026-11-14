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
- Google Search Console ownership and sitemap submission were completed on November 15 through the connected Chrome account. Native and extension control subsequently timed out repeatedly; URL inspection and account-based community posting still need a working Chrome connection.
- Gmail is connected. Three targeted directory applications were sent and then verified in Sent on November 15.

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

## November 15 receipts and search setup

- **Daily Games to Play:** the user approved the site's terms, which were accepted before submitting the prepared application. The page confirmed “Thanks, it arrived” and “RARE Air: received, waiting for review.” It says a confirmation email was sent and that a person will review the game. No extra email-verification step was shown. Screenshot: local ignored `release/private/promotion/dailygamestoplay-received.png`.
- **All the Dles:** sent one creator application to the address published on its submission page. Included official play URL, maker, mechanics, public GitHub launch announcement, fixed editorial scoring and AI disclosures. Its policy warns about unofficial unlimited copies, so the message explicitly identifies RARE Air as an independent game and explains that it is not an official Krillion site.
- **Seekdle:** sent one application under Trivia with the requested URL, one-line mechanics and creator relationship, plus the daily reset and AI disclosures.
- **Daily Game Index:** sent one application with the required subject “Game submission”, official URL, creator, core rules, source and preview image. Granted use of the supplied preview for an attributed directory listing or review. Mentioned the earlier awesome-daily-games suggestion so the editor can consolidate it if appropriate.

All three emails were sent through the connected Gmail account and verified afterward with the SENT label. Reply-To uses the project's public support address. Sending is confirmed; delivery, editorial acceptance and listing publication are not yet confirmed. Combined with November 14, there are nine successful form receipts and three sent email applications, plus the existing public GitHub directory suggestion.

Google Search Console displayed **ownership verified via HTML tag** for `https://krillionunlimited.top/`. It then displayed **sitemap successfully submitted** for `sitemap.xml`. The saved screenshot also shows the sitemap row with status **Success**, a November 15 last-read date and **9 discovered pages**. Screenshots are saved locally as `google-verified.png` and `google-sitemap-submitted.png`. Search reports were still processing. Homepage URL inspection and an explicit indexing request remain incomplete because browser control timed out after sitemap submission. Discovered URLs do not establish Google indexing or search traffic.

## Prepared channels awaiting account access

- vibedgame has a local draft with description, repository link, cover and three screenshots, under Puzzle, Free, Play in browser. The draft selects November 17, the earliest allowed day when it was prepared. It still needs account sign-in and final submission. GitHub sign-in was reached, and the draft was then restored and verified at step 4 with all six readiness checks complete. The draft page is preserved for handoff. [Submission](https://vibedgame.com/submit)
- Reddit WebGames has been opened for rule review. The in-app browser is signed out, and Chrome control is timing out. Public social posts, Product Hunt and itch.io still require usable account access. The user was asked to reconnect Chrome and open an already signed-in Reddit or X page. No Reddit or X post has been published.

### Ready community copy

For r/WebGames, first search the game name and URL to respect its three-month repost rule and review its current pinned AI-content discussion. Use the canonical URL without referral parameters. Proposed link-post title:

> RARE Air — five daily trivia prompts, with rare answers lifting a balloon higher

Creator comment, if current rules permit:

> I'm the creator of RARE Air. Each flight has five open-answer trivia prompts, with 30 seconds per prompt. Less obvious correct answers lift a balloon higher; the rarity tiers are editorial, not measured player-answer frequencies. Everyone gets the same daily flight at 00:00 UTC, and there's repeatable practice. It's free and needs no signup. Built with Codex, AI-generated sky art and AI-assisted question preparation with validation. I'd like feedback on question fairness and how the flight feels on mobile.

Proposed X post:

> Can your most obscure trivia answer reach 5,000m? 🎈
>
> RARE Air: 5 prompts, 30 seconds each. Rarer correct answers give more lift (editorial tiers). Free, no signup, daily + repeatable practice.
>
> My open-source browser game: https://krillionunlimited.top/

These are prepared drafts, not published posts. No fabricated player counts, popularity claims or testimonials are used.

## Search and sharing delivered

- Cloudflare version 15c455ba-590a-4287-8067-ac58037f86a2 adds the web system share sheet, with cancellation handling and clipboard/visible-text fallback. The privacy page describes this behavior.
- Eighteen tests and local Worker/D1 integration passed, including the frozen-session, timeout and legacy-session branches.
- The ownership response at /indexnow-key.txt was verified against the private configured value. The value is stored outside the repository and as a Cloudflare secret.
- IndexNow accepted all nine sitemap URLs with HTTP 202 at 02:21 UTC on November 14. This is receipt pending the service's key validation. Crawling and indexing remain unverified. [Protocol response meanings](https://www.indexnow.org/documentation)
- After the later homepage update, its incremental notification returned HTTP 200 at 02:44 UTC. Submission was accepted with the configured ownership key. Search-engine indexing remains unverified.

## Public launch post

The browser launch announcement is published as GitHub release web-v1.0.0, with the play link, a gameplay image, rules, source credits and support links. [Published announcement](https://github.com/glovenone/rare-air/releases/tag/web-v1.0.0)

## Performance verification

The PageSpeed web interface completed successfully after the unauthenticated API had returned a quota error. The first mobile lab run scored 89 for performance, 91 for accessibility, 100 for best practices and 100 for SEO.

The round-progress group now has a valid accessible role, the balloon has intrinsic dimensions and high-priority loading, and the steering hint has stronger contrast. Cloudflare version bb16bc11-dca2-4b6b-95a1-c2ddc3ed530e serves these changes.

The follow-up mobile lab run scored 88 for performance and 100 each for accessibility, best practices and SEO. FCP was 1.1 seconds, LCP 3.5 seconds, TBT 30 ms and CLS 0. Image delivery remains the principal performance opportunity. These are synthetic measurements, and the report has no real-user data. [Mobile report](https://pagespeed.web.dev/analysis/https-krillionunlimited-top/uyor5cm5pw?form_factor=mobile)

The same report's desktop run scored 100 in all four categories, with 0.7-second LCP and zero TBT/CLS. [Desktop report](https://pagespeed.web.dev/analysis/https-krillionunlimited-top/uyor5cm5pw?form_factor=desktop)

An aggregate anonymous-session baseline is saved locally in the ignored promotion directory. It includes validation activity and does not establish a count of individual human players.

The live browser practice flow was exercised through all five stages, including correct answers, a skip and timeouts, ending at 600 meters with two correct answers. System-share delivery to another app remains unverified while the host is locked. The isolated system-share, cancellation and clipboard fallback tests pass. The agent-created test tab was closed after saving the flight report.
