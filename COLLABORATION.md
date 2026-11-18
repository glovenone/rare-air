# Collaboration and current status

RARE Air is an open-source daily rare-answer trivia game. Its website runs on Cloudflare Workers, D1 and SQLite Durable Objects. Repository source is at [glovenone/rare-air](https://github.com/glovenone/rare-air). Important dated outcomes are appended to [PROGRESS.md](PROGRESS.md).

## Homepage and rewards

The November 18 update strengthens the six main action cards, shows the equipped icon on the rewards entry and explains the free passport requirement for earning and redeeming points. Desktop titles are 21px, phone titles 19px and supporting labels 14px. Narrow layouts use full-width cards.

Source commit `785532e` is deployed to [the website](https://krillionunlimited.top/) as Cloudflare version `1c613514-932f-49ed-9d1b-a741d76f301c`. Live desktop and 320px browser checks passed, along with local 390px English and Arabic RTL checks. The November 19 candidate adds Korean for eleven in-app languages and 99 public pages. Its website and native publication are recorded in the progress log when completed. Korean includes machine translation plus selected UI and terminology review, with full native-speaker review pending.

Three pilot icons are free to select. Six additional icons cost 120–600 earned Sky points. Online daily completions on their UTC day and chapter completions earn points from verified results. The rewards balance, ownership, retry handling and selection are maintained by D1. The implementation and earning rules are described in [the homepage plan](docs/plans/2026-11-17-home-rewards.md).

## Verify and deploy

Use the [README commands](README.md) for builds, tests and local migrations. With a local Wrangler server, run `TEST_URL=http://127.0.0.1:8794 node test/rewards.integration.mjs` from the same checkout to exercise real local D1 rewards. This test inserts local fixtures. Keep its target local.

After source review and tests, push the commit to GitHub and run Wrangler deployment. Verify live computed font sizes, narrow layouts, icon persistence and the website's actual downloaded asset contents. Record the deployment ID in the progress record.

## Mobile handoff

The web game is shared with packaged Android and iOS builds. Website deployment and native store publication have separate records. Follow [the mobile release workflow](release/mobile-daily.md) to build, sign, test and submit a native update containing the new web assets. The homepage's existing APK and App Store links are maintained in `src/site-config.js`.

This homepage refinement has a validated shared mobile web bundle. Native installers and store submissions incorporating source `785532e` are pending the mobile release workflow.

## Operational boundaries

Website ads remain disabled and subscription work remains private design. Credentials, signing files, private contacts and service screenshots belong in the main checkout's ignored `release/private/` records. Browser workflows use the owner's happycoin Chrome profile. Read [AGENTS.md](AGENTS.md) before continuing work.
