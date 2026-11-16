import ts from "typescript";
import { readFile, writeFile } from "node:fs/promises";

// Extract only the English sources. Localized pages are generated afterwards.
const collected = new Set();
const decode = (text) => text.replaceAll("&amp;", "&").replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
function add(text) {
  const key = decode(text.trim().replace(/\s+/g, " "));
  if (key && !["RARE Air", "Rare air", "Rare air.", "rare", "rare ↗", "home", "daily", "offline", "cancelled", "shared", "POST", "GET", "HEAD", "DENY", "UTC"].includes(key) &&
      /[A-Za-z]{2}/.test(key) && !key.startsWith("http") &&
      !/<\/?(?:div|span|p|button)\b/.test(key) &&
      !/SELECT |INSERT |UPDATE |CREATE |DELETE FROM |default-src|Max-Age|SameSite/.test(key)) collected.add(key);
}
for (const path of ["public/app.js", "public/sky.js", "public/analytics.js", "public/relay.js", "src/worker.ts", "src/relay-api.ts", "src/relay.js", "native/platform.js", "native/offline.js"]) {
  const source = await readFile(path, "utf8");
  const tree = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true);
  function visit(node) {
    if (ts.isStringLiteral(node)) {
      let argument = node;
      while (argument.parent && !ts.isCallExpression(argument.parent) && !ts.isStatement(argument.parent)) argument = argument.parent;
      const call = argument.parent;
      if (call && ts.isCallExpression(call) && ts.isPropertyAccessExpression(call.expression) &&
          ['querySelector', 'querySelectorAll'].includes(call.expression.name.text)) return;
      const translatedArgument = call && ts.isCallExpression(call) &&
        (call.expression.getText(tree) === "t" ||
         call.expression.getText(tree) === "element" && call.arguments[1] === argument);
      if (translatedArgument || /\s/.test(node.text) || /^[A-Z][A-Z ]+$/.test(node.text)) add(node.text);
    }
    if (ts.isTaggedTemplateExpression(node) && node.tag.getText(tree) === "t") {
      const template = node.template;
      add(ts.isTemplateExpression(template) ? template.head.text + template.templateSpans.map((span, index) => `{${index}}` + span.literal.text).join("") : template.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
}
const paths = ["/", "/games-like-krillion/", "/daily-trivia/", "/how-to-play/", "/krillion-unlimited/", "/privacy/", "/rare-answer-trivia/", "/support/", "/trivia-strategy/"];
for (const path of paths) {
  const source = (await readFile(`public${path}index.html`, "utf8"))
    .replace(/<!--i18n:[\s\S]*?-->/g, "").replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "");
  for (const text of source.split(/<[^>]+>/g)) add(text);
  for (const [, value] of source.matchAll(/(?:title|aria-label|placeholder)="([^"]+)"/g)) add(value);
  for (const tag of source.match(/<meta\b[^>]+>/g) || []) {
    if (/(?:name|property)="(?:description|og:title|og:description|og:image:alt|twitter:title|twitter:description|twitter:image:alt)"/.test(tag)) {
      const content = tag.match(/content="([^"]+)"/);
      if (content) add(content[1]);
    }
  }
}
for (const message of ["Language", "No lift", "Common", "Uncommon", "Rare", "Exceptional", "Skipped", "Fly", "seconds", "METERS", "FLIGHTS", "on", "off", "Support", "Decline", "Privacy policy", "Allow analytics", "Analytics settings", "Analytics preferences", "Allow Google Analytics to help us understand visits and app downloads?"]) add(message);
for (const category of ["GEOGRAPHY", "HISTORY", "SCIENCE", "SPACE", "TECH", "TECHNOLOGY", "MATH", "NATURE", "MOVIES", "BOOKS", "LITERATURE", "LANGUAGE", "MUSIC", "GAMES", "SPORT", "SPORTS", "ART", "ARTS", "CULTURE", "FOOD", "EVERYDAY"]) add(category);
const questionSource = await readFile("src/questions.js", "utf8");
for (const [, value] of questionSource.matchAll(/(?:label|description): '([^']+)'/g)) add(value);
await writeFile("content/translations/messages.en.json", JSON.stringify(Object.fromEntries([...collected].map((key) => [key, key])), null, 2) + "\n");
console.log(`Extracted ${collected.size} English interface and guide messages.`);
