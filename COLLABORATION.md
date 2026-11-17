# Collaboration and current status

RARE Air is an open-source daily rare-answer trivia game. Its website runs on Cloudflare Workers, D1 and SQLite Durable Objects. Repository source is at [glovenone/rare-air](https://github.com/glovenone/rare-air). Important dated outcomes are appended to [PROGRESS.md](PROGRESS.md).

## Homepage and rewards

The November 18 update strengthens the six main action cards, shows the equipped icon on the rewards entry and explains the free passport requirement for earning and redeeming points. Desktop titles are 21px, phone titles 19px and supporting labels 14px. Narrow layouts use full-width cards.

Three pilot icons are free to select. Six additional icons cost 120–600 earned Sky points. Online daily completions on their UTC day and chapter completions earn points from verified results. The rewards balance, ownership, retry handling and selection are maintained by D1. The implementation and earning rules are described in [the homepage plan](docs/plans/2026-11-17-home-rewards.md).

## Verify and deploy

Use the [README commands](README.md) for builds, tests and local migrations. With a local Wrangler server, run `TEST_URL=http://127.0.0.1:8794 node test/rewards.integration.mjs` from the same checkout to exercise real local D1 rewards. This test inserts local fixtures. Keep its target local.

After source review and tests, push the commit to GitHub and run Wrangler deployment. Verify live computed font sizes, narrow layouts, icon persistence and the website's actual downloaded asset contents. Record the deployment ID in the progress record.

## Mobile handoff

The web game is shared with packaged Android and iOS builds. Website deployment and native store publication have separate records. Follow [the mobile release workflow](release/mobile-daily.md) to build, sign, test and submit a native update containing the new web assets. The homepage's existing APK and App Store links are maintained in `src/site-config.js`.

## Operational boundaries

Website ads remain disabled and subscription work remains private design. Credentials, signing files, private contacts and service screenshots belong in the main checkout's ignored `release/private/` records. Browser workflows use the owner's happycoin Chrome profile. Read [AGENTS.md](AGENTS.md) before continuing work.
