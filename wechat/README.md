# RARE Air for WeChat Games

The WeChat edition renders directly to Canvas using WeChat game APIs. It includes the illustrated sky, draggable balloon, gusts, updraft rings, bird formations, a paper-plane companion, native keyboard input, five-round trivia, answer review, local flight history and spoiler-free sharing.

The interface and question bank are English. Offline practice bundles the 400 released prompts available at build time. Online daily flights use the existing Cloudflare Worker and its server-side scoring. Daily API requests retain a separate anonymous player cookie in WeChat local storage. This edition does not request a WeChat profile, phone number or OpenID.

## Build and import

```sh
npm ci
npm run wechat:build
```

Import `dist/wechat` in WeChat DevTools as a **小游戏** project. The default configuration opens with a visitor placeholder. Select the tool's **测试号** option for local development, or build with the AppID from the intended game account.

```sh
WECHAT_APP_ID=wx_your_game_appid npm run wechat:build
```

To connect a custom Cloudflare origin, set `SITE_URL` to its HTTPS origin in the same build command. The development-tools project uses URL validation. Configure that exact host as a legal `request` domain in the production game account before testing online daily flights on a phone. Offline practice works independently of the domain configuration.

Rebuilding refreshes the generated game and assets while preserving the existing project AppID and tool settings. `WECHAT_APP_ID` overrides that AppID when supplied. Use the source files in `wechat/` for changes. AppSecret and publishing keys are unnecessary for building or importing this project.

## Validation

`npm test` exercises a complete five-question flight against WeChat-shaped Canvas, keyboard, touch and storage APIs without browser globals. The November 13, 2026 build also started in WeChat DevTools 2.02.2608031 with base library 3.17.6 and displayed the illustrated home screen without game errors. Phone interaction, network identity, sharing behavior and small-screen keyboard layout still require device validation.

The packaged payload is approximately 1.3 MB. The game uses the project's existing generated illustrations and fonts. Their license files and the project MIT license are included in the package.

## Publishing status

The supplied `wx282c5fe8f705f030` matches the tool's test AppID. The current project has been opened with that test account. A formal game account, its AppID and upload rights are required for store submission. Confirm the game category, publisher qualifications, filing requirements, privacy declaration and review materials shown in that account before submission.

The website, Apple/Google app records and WeChat game are separate publication targets. The WeChat build remains local until uploaded and reviewed through its own account.

## API references

- [Official WeChat game examples](https://github.com/wechat-miniprogram/minigame-demo)
- [Official API type definitions](https://github.com/wechat-miniprogram/minigame-api-typings)
- [WeChat game development guide](https://developers.weixin.qq.com/minigame/dev/guide/)
