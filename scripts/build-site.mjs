import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { bankInfo } from "../src/questions.js";
import { appDownloads, androidTestGroup, googleAnalyticsId, googleAdsenseClient } from "../src/site-config.js";

const site =
  process.env.SITE_URL || "https://krillionunlimited.top";
const origin = new URL(site).origin;
const pages = [
  {
    path: "krillion-unlimited",
    title: "Krillion Unlimited Alternative | RARE Air Trivia Practice",
    description:
      "Looking for Krillion Unlimited? Play repeatable rare-answer trivia in RARE Air. Five timed questions per flight, illustrated updrafts and accepted-answer review.",
    heading: "Krillion Unlimited alternative with repeatable trivia practice.",
    intro:
      "Searching for Krillion Unlimited? RARE Air is an independently developed rare-answer trivia game with repeatable practice flights. Open the game and choose Practice flight for five fresh prompts. Reach for an unexpected correct answer and watch your balloon climb.",
    sections: [
      [
        "Another five-question flight whenever you are ready.",
        "Practice selects five distinct prompts from a bank of hundreds of curated questions. Explore geography, science, film, books, music and other subjects. Complete a flight, then choose Take another flight for a new set. Some prompts can return across separate flights.",
        "Each active question has a 30-second clock. Between questions, the reward screen gives you time to enjoy the sky before continuing. A three-second preparation countdown introduces the next stage.",
      ],
      [
        "Choose a subject for your next flight.",
        "Pick a topic opens nine free practice areas. Choose geography and history, science and space, nature, movies, books and words, music, games and sport, art and culture, or food and everyday knowledge. The cards show each subject's current question count.",
        "Each topic flight contains five distinct questions. After the report, Take another flight keeps the same subject. Choose Practice flight on the homepage for a mixed set, or Pick a topic to change subjects. Topic practice uses the same timing, editorial rarity and accepted-answer review as mixed practice.",
      ],
      [
        "Find an answer with a little more lift.",
        "Correct answers earn 100, 250, 500 or 1,000 meters according to fixed editorial rarity tiers. Across five questions, the maximum altitude is 5,000 meters. Capitalization, punctuation and accepted aliases are handled automatically.",
        "Rarity is a curated rating of answer obscurity. After the final stage, your flight report lists accepted answers so you can explore choices you missed.",
      ],
      [
        "A daily challenge alongside practice.",
        "The daily flight gives everyone the same five prompts for a date and has an anonymous leaderboard. It resets at midnight UTC. Practice flights let you keep exploring between daily challenges.",
      ],
      [
        "Take the controls.",
        "Drag the balloon to steer or tap it to catch a gust. Rare answers bring stronger updraft effects, passing clouds and paper-plane companions. The game works in a modern mobile or desktop browser. Sound starts off, and reduced-motion preferences simplify the flight.",
      ],
    ],
  },
  {
    path: "daily-trivia",
    title: "Daily Trivia Game — Five Questions, One Flight | RARE Air",
    description:
      "Play RARE Air, a free daily trivia game with five open-answer questions. Find less obvious correct answers and climb up to 5,000 meters through the clouds.",
    heading: "A daily trivia game that takes you higher.",
    intro:
      "RARE Air is a free daily trivia game in ten languages with five open-answer questions. You get 30 seconds per question. Correct answers give your hot-air balloon lift, and less obvious answers take you further. A new daily flight opens at midnight UTC.",
    sections: [
      [
        "Five prompts, one shared daily challenge.",
        "Each date has the same five prompts for everyone. Questions cover subjects such as geography, history, science, books, films and everyday knowledge. Enter one answer that fits the question. The game handles capitalization, spacing, punctuation and accepted aliases.",
        "Your browser gets one daily attempt per date. You can return to a flight after refreshing. The server keeps the time for an active question.",
      ],
      [
        "Why rare answers climb higher.",
        "Every accepted answer has a fixed editorial rarity tier. Common answers add 100 meters, uncommon answers 250, rare answers 500 and exceptional answers 1,000. A wrong answer, skip or timeout adds zero. Across five stages, a perfect flight reaches 5,000 meters.",
        "For a prompt such as naming a planet, several answers can be correct. Your challenge is to reach for something a little less expected. The rarity ratings are editorial difficulty choices.",
      ],
      [
        "Practice between daily flights.",
        "Practice creates a fresh five-question set from the current question bank. It follows the same 30-second clock and scoring rules, while daily leaderboards keep the shared daily challenge separate. The archive lets you play earlier dates beginning November 12, 2026.",
        "After an answer, you can enjoy the view before continuing. A three-second preparation countdown comes before each new prompt, then the 30-second timer starts.",
      ],
      [
        "A sky you can explore.",
        "Drag your balloon to steer, or focus it and use the arrow keys. Tap the balloon or press Space to catch a gust. Rarer correct answers bring stronger wind rings, cloud breakthroughs and paper-plane companions. Reduced-motion settings turn off the animated flight effects.",
        "Finish all five questions to see your flight report, accepted answers and final altitude. Share a spoiler-free flight card to challenge a friend.",
      ],
    ],
  },
  {
    path: "how-to-play",
    title: "How to Play RARE Air — Daily Trivia Rules & Scoring",
    description:
      "Learn the RARE Air trivia rules, 30-second timer, answer rarity tiers, daily resets, practice flights, archive and score sharing.",
    heading: "How to play RARE Air.",
    intro:
      "Choose Take flight for today’s daily game, or Practice flight for a fresh set. Each flight has five questions. Type one correct answer to each prompt, then press Fly. You have 30 seconds from the start of an active question.",
    sections: [
      [
        "Pick a correct answer that fits the whole prompt.",
        "Read the scope carefully. Some prompts specify a particular book, game edition, region, alphabet letter or scientific model. Common names and accepted aliases work automatically. A misspelled answer is accepted only when it is included in the curated aliases.",
        "On this website, choose your language from the header. Questions and answer review are available in English, Chinese, Spanish, French, Portuguese, German, Japanese, Russian, Arabic and Indonesian. You can answer in your selected language or English. Changing language keeps the same flight and its running clock. Literal code keywords remain unchanged.",
      ],
      [
        "Turn answer rarity into altitude.",
        "Common answers add 100 meters. Uncommon answers add 250 meters. Rare answers add 500 meters. Exceptional answers add 1,000 meters. The server checks each answer and adds the five stage results. Wrong answers, skips and timeouts add zero.",
        "The tiers are fixed editorial ratings. They express the intended difficulty and obscurity of each answer in the curated bank.",
      ],
      [
        "Understand the clock.",
        "Pressing Climb higher begins a three-second preparation countdown. The next prompt then appears and its 30-second clock starts on the server. Opening a dialog, changing tabs or leaving the page keeps that active clock running.",
        "The reward screen gives you time to inspect your result. The following prompt remains hidden until you continue. Refreshing and resuming a daily flight preserves its server state and elapsed time.",
      ],
      [
        "Play daily, practice or the archive.",
        "Daily games reset at midnight UTC. Each browser identity receives one attempt per date. Practice creates another five-question set, and the archive offers past daily flights from November 12, 2026. Clearing browser cookies creates a new local identity.",
        "On the website, choose Pick a topic for a subject-focused practice flight. Nine free topics cover geography and history, science and space, nature, movies, books and words, music, games and sport, art and culture, and food and everyday knowledge. Take another flight continues with your selected topic.",
        "The mobile app also offers bundled offline practice. Offline practice is scored on your device and has its own local history.",
      ],
      [
        "Steer and share.",
        "Drag the balloon with your mouse or finger. You can focus it with the keyboard, steer with the arrow keys and press Space for a gust. These controls add flight effects. Your answer determines the altitude gain.",
        "After the fifth question, view your flight report and share its spoiler-free altitude card. The report also lists accepted answers for the prompts you completed.",
      ],
      [
        "Help test the Android app.",
        "The RARE Air Android closed test is open on Google Play. Join the testing group using the same Google Account you use on your Android device. Follow the group’s Google Play enrollment link, choose Become a tester, then install from Google Play. Android 7.0 or later is required.",
        "Please stay opted in for at least 14 continuous days and try several sessions. Send bugs and usability feedback through the group, private Play feedback or contact@shanxing.top. Complete the Google Play enrollment step to join the test.",
      ],
      [
        "Play on your phone.",
        "Download the signed Android APK for Android 7.0 or later, or open the Apple App Store page for iPhone and iPad. Mobile apps include offline practice and device-local flight history. Download links are below.",
      ],
    ],
  },
  {
    path: "privacy",
    title: "Privacy Policy | RARE Air Daily Trivia",
    description:
      "Read how RARE Air uses anonymous gameplay records, a browser cookie, local flight history and Cloudflare hosting to operate the game.",
    heading: "Privacy policy.",
    intro:
      "Effective November 13, 2026. RARE Air is operated by the project maintainer, glovenone, and its source code is available on GitHub. This policy covers the web game, packaged RARE Air mobile apps and WeChat game edition.",
    sections: [
      [
        "Data used for online play.",
        "The game uses a randomly generated player identifier to keep a daily attempt and its game session. Online sessions store the date, mode, generated display name, question snapshot, chosen answers, scores and timing information. Daily leaderboards show generated names and totals.",
        "A browser cookie named rare_player stores your anonymous player identifier for up to one year. In the mobile app, the native networking cookie store maintains the corresponding session. The WeChat game retains this anonymous cookie in device-local storage. Guest play needs no account. The separate WeChat game does not request a WeChat profile or OpenID.",
      ],
      [
        "Data stored on your device.",
        "Local storage keeps saved session IDs, completed daily flight history and offline practice history. Offline practice questions and scoring work on your device. Supported web browsers and mobile apps open your operating system’s share sheet. Web sharing also offers a clipboard fallback. WeChat sharing uses WeChat’s share controls. You choose whether and where to share a score.",
        "Sound is optional. Haptics use the phone’s vibration hardware where supported. These features do not require microphone, camera, contacts or location access.",
      ],
      [
        "Private relay rooms.",
        "Relay rooms store pilot names, answers, scores, companion choices and private seat tokens. Rooms expire after 24 hours. Expired records are removed when a new room is created. This tab keeps your seat token in session storage. Room participants can see your pilot name, score, companion and accepted answers. Public waiting rooms expose their host nickname, capacity and room code. Choose a nickname without personal details.",
      ],
      [
        "Hosting and service logs.",
        "Cloudflare Workers and D1 host the online game and gameplay database. Cloudflare processes network requests and may process IP addresses, request details and service logs to operate and protect the service. The game enables Worker observability for diagnosing service failures.",
        "The project currently includes no advertising SDK, analytics tracker or cross-app advertising identifier. Gameplay answers and anonymous records are used to operate scoring, session recovery and leaderboards.",
      ],
      [
        "Retention and your choices.",
        "Local browser data remains until you clear it. You can remove local history by clearing site data or removing the mobile app. Online gameplay records remain in the service database while the service operates, unless removed by the operator.",
        "For a data request, contact the maintainer through the support page. Include the saved game ID if you can provide it privately. Publish only non-sensitive details in public GitHub issues.",
      ],
      [
        "Updates and contact.",
        "This policy may change as game features change. The effective date identifies the current revision. Use the support page for privacy questions or data requests.",
      ],
    ],
  },
  {
    path: "support",
    title: "Support & Contact | RARE Air Trivia Game",
    description:
      "Get help with RARE Air daily trivia, saved flights, accepted answers, timeouts and privacy requests. Contact the open-source project maintainer.",
    heading: "A little help getting airborne.",
    intro:
      "RARE Air support is handled by the open-source project maintainer. Email contact@shanxing.top for support or privacy requests. For a gameplay bug, an answer correction or a deployment question, you can also open an issue in the project’s GitHub repository.",
    sections: [
      [
        "Report a problem.",
        "Include the puzzle date, prompt, your device and browser or app version, and what happened. A screenshot can help show a layout issue. Avoid sharing private details in public issues.",
        "Use https://github.com/glovenone/rare-air/issues to reach the maintainer. If a report needs private information, request a private contact channel before including that information.",
      ],
      [
        "My answer was rejected.",
        "Each prompt has a curated answer list and accepted aliases. Review the prompt’s exact scope, then compare your spelling with the accepted answers shown in the completed flight report. Report a missing valid answer with a source that supports it.",
      ],
      [
        "The timer kept running.",
        "An active online question uses server time. Changing tabs, opening help or closing the app keeps that clock running. Between questions, you can remain on the reward screen until you choose Climb higher.",
      ],
      [
        "My daily flight or history is missing.",
        "Online attempts use an anonymous cookie and local session IDs. Clearing cookies, changing browsers or removing app data can create a different local identity. Device-local history stays on the device where you played.",
        "Offline practice flights are kept locally in the mobile app. They are separate from the online daily leaderboard.",
      ],
      [
        "Privacy requests.",
        "See the privacy policy for the data the game uses. Contact the maintainer before sharing identifiers or personal information in a public report.",
      ],
    ],
  },
];
pages.push(
  {
    path: "rare-answer-trivia",
    title: "Rare-Answer Trivia Game — Play Free Online | RARE Air",
    description:
      "Play free rare-answer trivia in RARE Air. Type one correct answer to each prompt, aim for an unexpected choice and fly higher. Daily and repeatable practice.",
    heading: "Rare-answer trivia rewards the unexpected.",
    intro:
      "In rare-answer trivia, a question can have several correct answers. Your challenge is to find a less obvious one. RARE Air turns that choice into a flight through the clouds, with five open-answer questions, a 30-second timer and up to 5,000 meters to climb.",
    sections: [
      [
        "How an open-answer question works.",
        "A prompt might ask you to name a planet in the Solar System. You type one answer that fits. There are no multiple-choice options to reveal the possibilities, so recalling a specific example is part of the challenge. Other prompts cover geography, science, books, film and everyday knowledge.",
        "Scope matters. A question about planets visible to the naked eye has a narrower set of correct answers than a question about all eight planets. Read every qualifier before choosing your answer.",
      ],
      [
        "How RARE Air scores rarity.",
        "Each accepted answer has a fixed editorial tier. Common answers earn 100 meters, uncommon answers 250, rare answers 500 and exceptional answers 1,000. A wrong answer, skip or timeout earns zero. The ratings stay fixed for your flight and express the intended obscurity of each answer.",
        "These tiers come from the curated question bank. They do not measure what percentage of today's players typed an answer. You can inspect the accepted answers and their tiers after finishing all five stages.",
      ],
      [
        "Daily questions and repeatable practice.",
        `The current bank contains ${bankInfo.bankSize} prompts in ten languages. Today's daily flight gives everyone the same five questions and resets at midnight UTC. Practice creates another five-question set whenever you want to keep playing. Questions can return across separate practice flights.`,
        "The game is free to play in a mobile or desktop browser. You can start immediately without creating a player account. An anonymous cookie keeps your daily attempt, and local browser storage keeps your flight history.",
      ],
      [
        "Make your next answer more deliberate.",
        "Think of a reliable correct answer first, then use the remaining time to look for a more specific example. If you are unsure whether a surprising choice fits the scope, a familiar correct answer can still earn altitude. After the flight, use the report to learn alternatives for future practice.",
      ],
    ],
    related: [
      ["/trivia-strategy/", "Try these rare-answer trivia strategies"],
      ["/how-to-play/", "Read the timer and scoring rules"],
    ],
  },
  {
    path: "trivia-strategy",
    title: "Rare-Answer Trivia Tips & Practice Guide | RARE Air",
    description:
      "Improve your rare-answer trivia choices with practical tips for prompt scope, recall, timing and flight-report review. Practice free in RARE Air online.",
    heading: "Make the most of your 30 seconds.",
    intro:
      "Start by finding one answer you trust. Then look for a less obvious answer that still fits every part of the prompt. These rare-answer trivia tips help you decide when to take that chance during RARE Air's five-question flights.",
    sections: [
      [
        "Read the boundary before searching your memory.",
        "Watch for a named edition, a date range, a starting letter or a particular region. A correct answer to the general topic can fall outside a narrower prompt. For example, membership of a specific fictional group is different from appearing anywhere in the same story.",
        "Use the opening seconds to identify the exact set of things the question accepts. That makes the rest of your recall more focused.",
      ],
      [
        "Keep a dependable answer in reserve.",
        "Recall a familiar example first. If another answer comes to mind, check that it belongs to the same set before submitting. Correctness earns altitude at every tier, so an unfamiliar guess needs to justify the risk of scoring zero.",
        "Avoid spending the whole clock searching for a perfect answer. RARE Air gives you 30 seconds for an active prompt. The server keeps that clock running while you switch tabs or open a dialog.",
      ],
      [
        "Search a category in smaller groups.",
        "If a broad category feels blank, try mentally grouping it by place, period or subject. For a geography prompt, move through regions. For a literature prompt, recall authors or series you know. This is a recall technique, so every candidate still needs to satisfy the actual question.",
        "Use the ordinary name when you know it. RARE Air normalizes capitalization, punctuation and accepted aliases. A spelling variation works when it is present in the curated answer list.",
      ],
      [
        "Use the pauses and the flight report.",
        "The reward screen waits for you to press Climb higher. Take a breath there. The next question stays hidden during the pause, then a three-second preparation countdown introduces the next stage.",
        "At the end, review the accepted answers and their editorial tiers. Choose one or two unfamiliar answers to remember, and look up the topic if you want more context. Practice flights provide another five prompts without changing the shared daily leaderboard.",
      ],
      [
        "Treat tiers as the game's scoring rules.",
        "RARE Air uses fixed editorial rarity tiers, so choosing an answer that feels obscure does not guarantee the maximum score. Your completed report shows how that answer was rated. A missing valid answer can be reported to the maintainer with a reliable source and the prompt's exact wording.",
      ],
    ],
    related: [
      ["/rare-answer-trivia/", "Understand rare-answer trivia"],
      ["/krillion-unlimited/", "Explore repeatable trivia practice"],
      ["/support/", "Report a missing valid answer"],
    ],
  },
);
const navLinks = [
  ["/daily-trivia/", "Daily trivia"],
  ["/krillion-unlimited/", "Unlimited practice"],
  ["/rare-answer-trivia/", "Rare-answer trivia"],
  ["/trivia-strategy/", "Trivia tips"],
  ["/how-to-play/", "How to play"],
  ["/games-like-krillion/", "Games like Krillion"],
  ["/privacy/", "Privacy"],
  ["/support/", "Support"],
];
const escape = (text) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
const renderLinks = (links) => links
  .map(([href, label]) => `<a href="${escape(href)}">${escape(label)}</a>`)
  .join("");
const navigation = `<nav aria-label="Game guides and information">${renderLinks(navLinks)}</nav>`;
const appleLabel = appDownloads.appleAvailable ? "Apple App Store" : "App Store · coming soon";
const downloads = `<nav class="app-downloads" aria-label="Get the mobile app"><a href="${escape(appDownloads.android)}" data-download-platform="android">Download Android APK <span aria-hidden="true">↓</span></a><a href="${escape(appDownloads.apple)}" data-download-platform="ios">${appleLabel} <span aria-hidden="true">↗</span></a><a href="${escape(androidTestGroup)}">Join Android test group <span aria-hidden="true">↗</span></a></nav>`;
if (!appDownloads.appleAvailable) {
  pages.find((page) => page.path === "how-to-play").sections.at(-1).push(
    "The Apple App Store page is awaiting public availability.",
  );
}
const analyticsMetadata = /^G-[A-Z0-9]+$/.test(googleAnalyticsId)
  ? `<meta name="google-analytics-id" content="${googleAnalyticsId}"><link rel="stylesheet" href="/analytics.css"><script src="/analytics.js" defer></script>`
  : "";
if (!/^ca-pub-\d{16}$/.test(googleAdsenseClient)) {
  throw new Error("The AdSense verification account must be a valid ca-pub identifier.");
}
const adsenseMetadata = `<meta name="google-adsense-account" content="${googleAdsenseClient}">`;
await writeFile(
  "public/ads.txt",
  `google.com, ${googleAdsenseClient.slice(3)}, DIRECT, f08c47fec0942fa0\n`,
);
if (analyticsMetadata) {
  const privacy = pages.find((page) => page.path === "privacy");
  privacy.intro = privacy.intro.replace("November 13, 2026", "November 16, 2026");
  privacy.sections.find(([heading]) => heading === "Hosting and service logs.")[2] =
    "Gameplay answers and anonymous records are used to operate scoring, session recovery and leaderboards.";
  privacy.sections.splice(3, 0, [
    "Optional website analytics.",
    "When you allow analytics, the website loads Google Analytics 4 to measure visits, sessions, page views, traffic sources, device and country information, and Android or Apple download-link clicks. Google processes technical request information to deliver this service. The _ga and _ga_ cookies help distinguish visits and may persist for up to two years.",
    "The analytics tag loads after you allow it. Use Analytics settings to decline or change your choice, which is stored as rare_analytics_consent on this browser. Declining stops analytics collection and removes this website’s Google Analytics cookies. Browser privacy tools or blocked scripts can also limit collection.",
    "Typed trivia answers, game session identifiers and player identifiers are excluded from analytics events. Page addresses and referrers are sent with query strings and fragments removed. Advertising storage, advertising personalization and Google signals are disabled. This website analytics integration is excluded from the packaged mobile and WeChat games.",
    "Google’s privacy information is available at https://policies.google.com/privacy and https://policies.google.com/technologies/partner-sites. Contact contact@shanxing.top for privacy questions.",
  ]);
}
pages.find((page) => page.path === "privacy").sections.splice(4, 0, [
  "Website advertising preparation.",
  "The website publishes a Google AdSense ownership-verification meta tag and an ads.txt authorization file for site review. Ad delivery is currently disabled. These static verification records identify the publisher account. Any future advertising activation will be reflected in this policy and the website’s privacy controls.",
]);
const socialImage = `${origin}/art/flight-preview.jpg`;
pages.find(page => page.path === 'how-to-play').sections.push([
  'Sky Relay',
  'Invite 2–10 pilots, browse public rooms or find a quick or rated table.',
  'Each pilot has three hearts. An unused correct answer earns altitude and passes the turn. Wrong or repeated answers keep the clock running.',
  'The room shares 30 seconds, with at least 8 seconds after a pass. A timeout costs one heart and starts the next stage. Clearing every answer also advances the stage.',
  'Private flights have five stages; ten-seat, quick and rated flights have up to 30. One remaining pilot ends the flight early. More hearts wins; altitude breaks ties. Rare answers charge extra hearts.',
]);
pages.find(page => page.path === 'how-to-play').sections.push([
  'Your flight routes.',
  'Complete chapters, collect stars and explore a new part of the sky.',
  'Finish all five questions to open the next chapter. Earn stars at 1,000, 2,500 and 4,000 meters.',
  'Complete today’s daily flight to keep your streak. Days reset at midnight UTC. Archive replays and offline practice do not extend it.',
]);
pages.find(page => page.path === 'privacy').sections.push([
  'Optional flight passports.',
  'A free passport stores a public pilot name, a private game identity, a hashed recovery code, hashed login sessions, passkey public keys, preferences, friends and rating records in Cloudflare D1. We do not collect an email address, password or biometric data. Your device handles passkey verification. Keep your recovery code private; anyone with it can open your passport.',
  'Login cookies expire after 30 days. Passkey challenges expire after five minutes and are single use. Friend invitations expire after seven days. Earlier guest flights are linked only after you choose Import this device history. Offline practice remains on its device.',
  'Friends can compare completed daily answers only after completing that daily flight themselves. Rated tables store finishing positions and rating changes. Blocks prevent new friend relationships and matching with blocked accounts. Reports store the reporter, pilot, room, explanation and time for moderation; contact support for urgent concerns.',
  'Use Recovery and deletion in your passport to replace a recovery code or permanently delete your passport and its linked online flight history. Deletion requires the current recovery code. Public room snapshots expire separately after 24 hours. Security rate limits store short-lived hashed request keys rather than raw IP addresses.'
]);
pages.find(page => page.path === 'how-to-play').sections.push([
  'Passports, friends and the flight deck.',
  'Create a free flight passport, save its recovery code and optionally add a passkey on the website. Restore that passport on another device to continue online history and chapters. Invite friends with a seven-day link and accept invitations explicitly. Offline practice stays local.',
  'Choose a two-, three-, six- or ten-seat table. Private rooms use invitation codes; public rooms appear in the flight deck. Quick and rated tables start when full. There are no simulated opponents. If the queue is quiet, choose a smaller table or invite a friend. Rated play requires a passport; leaving an active rated flight counts in its result.',
  'A rare or exceptional answer adds its meters to heart charge. Every 1,500 charged meters restores one heart, up to five. Five-stage private flights and 30-stage quick, rated or ten-seat flights end sooner if only one pilot remains. Hearts rank first, altitude second. Rated results update pairwise Elo once; private rooms do not change ratings.',
  'Four major routes now have 30 chapters each, alongside five six-chapter routes. Chapters reuse reviewed questions in different fixed combinations; they are not all new questions. Existing chapter sets and earned progress are preserved. Companions unlock at best daily streaks of 5, 14, 30, 45, 60, 75, 100 and 150 days.'
]);
const socialMetadata = (title, description, url) => `
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="RARE Air"/>
<meta property="og:title" content="${escape(title)}"/>
<meta property="og:description" content="${escape(description)}"/>
<meta property="og:url" content="${escape(url)}"/>
<meta property="og:image" content="${socialImage}"/>
<meta property="og:image:type" content="image/jpeg"/>
<meta property="og:image:width" content="1280"/>
<meta property="og:image:height" content="720"/>
<meta property="og:image:alt" content="RARE Air gameplay with a hot-air balloon climbing through clouds after a rare answer"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${escape(title)}"/>
<meta name="twitter:description" content="${escape(description)}"/>
<meta name="twitter:image" content="${socialImage}"/>
<meta name="twitter:image:alt" content="RARE Air rare-answer trivia flight"/>`;
await copyFile("docs/images/flight.jpg", "public/art/flight-preview.jpg");
for (const page of pages) {
  const url = `${origin}/${page.path}/`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", name: page.title, description: page.description,
        url, inLanguage: "en", isPartOf: { "@type": "WebSite", name: "RARE Air", url: `${origin}/` } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "RARE Air", item: `${origin}/` },
        { "@type": "ListItem", position: 2, name: page.heading, item: url },
      ] },
    ],
  };
  const related = page.related ? `<nav aria-label="Related guides">${renderLinks(page.related)}</nav>` : "";
  const html = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escape(page.title)}</title>
<meta name="description" content="${escape(page.description)}"/>
<link rel="canonical" href="${url}"/>
${socialMetadata(page.title, page.description, url)}
<script type="application/ld+json">${JSON.stringify(structuredData).replaceAll("<", "\\u003c")}</script>
<link rel="icon" href="/favicon.svg"/><link rel="stylesheet" href="/guide.css"/>
</head><body><header><a href="/">rare ↗</a><a href="/">Take flight ↗</a></header>
<main><h1>${escape(page.heading)}</h1><p class="lead">${escape(page.intro)}</p>
<a class="guide-cta" href="/">Play RARE Air ↗</a>
${page.sections.map(([heading, ...paragraphs]) => `<section><h2>${escape(heading)}</h2>${paragraphs.map((text) => `<p>${escape(text)}</p>`).join("")}</section>`).join("\n")}
${page.path === "how-to-play" ? downloads : ""}
${page.path === "support" ? '<p><a class="guide-cta" href="https://github.com/glovenone/rare-air/issues">Open a support issue ↗</a></p>' : ""}
${related}${navigation}</main><footer><a href="/">← Back to the sky</a><span>RARE AIR</span></footer></body></html>`;
  await mkdir(`public/${page.path}`, { recursive: true });
  await writeFile(`public/${page.path}/index.html`, html);
}
const paths = [
  "/",
  ...pages.map((page) => `/${page.path}/`),
  "/games-like-krillion/",
];
await writeFile(
  "public/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${origin}${path}</loc></url>`).join("")}</urlset>\n`,
);
await writeFile(
  "public/robots.txt",
  `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`,
);
// Keep every checked-in canonical and social URL aligned with the final deployment origin.
for (const path of [
  "public/index.html",
  "public/games-like-krillion/index.html",
  ...pages.map((page) => `public/${page.path}/index.html`),
]) {
  const content = await readFile(path, "utf8");
  const canonical = content.match(/rel="canonical"[^>]*href="([^"]+)"/);
  const previousOrigin = canonical ? new URL(canonical[1]).origin : origin;
  let updated = content.replaceAll(previousOrigin, origin);
  updated = updated.replace(/\s*<!-- site-analytics:start -->[\s\S]*?<!-- site-analytics:end -->/, "");
  updated = updated.replace("</head>", `<!-- site-analytics:start -->${analyticsMetadata}<!-- site-analytics:end -->\n</head>`);
  updated = updated.replace(/\s*<!-- site-adsense:start -->[\s\S]*?<!-- site-adsense:end -->/, "");
  updated = updated.replace("</head>", `<!-- site-adsense:start -->${adsenseMetadata}<!-- site-adsense:end -->\n</head>`);
  if (path === "public/index.html") {
    updated = updated.replace(/(<span id="bank-label" class="sr-only">)[\s\S]*?<\/span>/, `$1${bankInfo.bankSize} questions.</span>`);
    updated = updated.replace(/<!-- app-downloads:start -->[\s\S]*?<!-- app-downloads:end -->/, `<!-- app-downloads:start -->${downloads}<!-- app-downloads:end -->`);
  }
  if (path === "public/games-like-krillion/index.html") {
    updated = updated.replace(/\s*<!-- site-sharing:start -->[\s\S]*?<!-- site-sharing:end -->/, "");
    updated = updated.replace("</head>", `<!-- site-sharing:start -->${socialMetadata("Games Like Krillion — RARE Air Trivia & Practice", "Explore RARE Air, an independent rare-answer trivia game with five timed prompts, daily flights and repeatable practice.", `${origin}/games-like-krillion/`)}<!-- site-sharing:end -->\n  </head>`);
    updated = updated.replace(/\s*<!-- guide-navigation:start -->[\s\S]*?<!-- guide-navigation:end -->/, "");
    updated = updated.replace("</main>", `<!-- guide-navigation:start -->${navigation}<!-- guide-navigation:end -->\n    </main>`);
  }
  await writeFile(path, updated);
}
console.log(`Prepared ${paths.length} crawlable pages for ${origin}.`);
