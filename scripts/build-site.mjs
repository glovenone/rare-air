import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { bankInfo } from "../src/questions.js";

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
      "RARE Air is a free English daily trivia game with five open-answer questions. You get 30 seconds per question. Correct answers give your hot-air balloon lift, and less obvious answers take you further. A new daily flight opens at midnight UTC.",
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
        "The mobile app also offers bundled offline practice. Offline practice is scored on your device and has its own local history.",
      ],
      [
        "Steer and share.",
        "Drag the balloon with your mouse or finger. You can focus it with the keyboard, steer with the arrow keys and press Space for a gust. These controls add flight effects. Your answer determines the altitude gain.",
        "After the fifth question, view your flight report and share its spoiler-free altitude card. The report also lists accepted answers for the prompts you completed.",
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
        "A browser cookie named rare_player stores your anonymous player identifier for up to one year. In the mobile app, the native networking cookie store maintains the corresponding session. The WeChat game retains this anonymous cookie in device-local storage. The game does not ask you to create a player account or provide a WeChat profile or OpenID.",
      ],
      [
        "Data stored on your device.",
        "Local storage keeps saved session IDs, completed daily flight history and offline practice history. Offline practice questions and scoring work on your device. Mobile sharing opens your operating system’s share sheet. WeChat sharing uses WeChat’s share controls. You choose whether and where to share a score.",
        "Sound is optional. Haptics use the phone’s vibration hardware where supported. These features do not require microphone, camera, contacts or location access.",
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
        `The current bank contains ${bankInfo.bankSize} English prompts. Today's daily flight gives everyone the same five questions and resets at midnight UTC. Practice creates another five-question set whenever you want to keep playing. Questions can return across separate practice flights.`,
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
const socialImage = `${origin}/art/flight-preview.jpg`;
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
  if (path === "public/index.html") {
    updated = updated.replace(/(<span id="bank-label" class="sr-only">)[^<]*/, `$1${bankInfo.bankSize} questions.`);
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
