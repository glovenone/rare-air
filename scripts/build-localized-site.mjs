import { readFile, writeFile, mkdir } from "node:fs/promises";
import { locales, localizedPath } from "../public/locales.js";
import { messages } from "../public/translations.js";

const origin = new URL(process.env.SITE_URL || "https://krillionunlimited.top").origin;
const sitemap = await readFile("public/sitemap.xml", "utf8");
const paths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
const escape = (text) => String(text).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const decode = (text) => text.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
const allPaths = [];

for (const path of paths) {
  const source = (await readFile(`public${path}index.html`, "utf8"))
    .replace(/<!--i18n:[\s\S]*?-->/g, "")
    .replace(/\sdata-i18n-[\w-]+="[^"]*"/g, "")
    .replace(/<!-- site-languages:start -->[\s\S]*?<!-- site-languages:end -->/g, "");
  const sourceTitle = decode(source.match(/<title>(.*?)<\/title>/s)?.[1] || "RARE Air");
  for (const locale of locales) {
    const translate = (text) => messages[locale.code]?.[text] || text;
    const localPath = localizedPath(path, locale.code);
    const url = origin + localPath;
    let html = source.replace(/<html\b[^>]*>/, `<html lang="${locale.tag}" dir="${locale.direction}">`);
    html = html.replace(/(<link\s+rel="canonical"\s+href=")[^"]+/, `$1${url}`);
    html = html.replace(/(<meta\s+property="og:url"\s+content=")[^"]+/, `$1${url}`);
    const parts = html.split(/(<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<[^>]+>)/gi);
    let inHead = true;
    html = parts.map((part) => {
      if (/^<\/head/i.test(part)) inHead = false;
      if (part.startsWith("<!--") || /^<style\b/i.test(part)) return part;
      if (/^<script\b/i.test(part)) {
        if (!part.includes('type="application/ld+json"')) return part;
        return part.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/, (_, opening, json, closing) => {
          const transform = (value) => {
            if (typeof value === "string") {
              if (value.startsWith(origin + "/") && new URL(value).pathname.endsWith("/")) {
                return origin + localizedPath(new URL(value).pathname, locale.code);
              }
              return translate(value);
            }
            if (Array.isArray(value)) return value.map(transform);
            if (value && typeof value === "object") {
              return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, key === "inLanguage" ? locale.tag : transform(item)]));
            }
            return value;
          };
          return opening + JSON.stringify(transform(JSON.parse(json))).replaceAll("<", "\\u003c") + closing;
        });
      }
      if (part.startsWith("<")) {
        const textMetadata = /(?:name|property)="(?:description|og:title|og:description|og:image:alt|twitter:title|twitter:description|twitter:image:alt)"/.test(part);
        let tag = part.replace(/(aria-label|placeholder|title|content)="([^"]*)"/g, (match, name, encoded) => {
          if (name === "content" && !textMetadata) return match;
          const text = decode(encoded);
          const marker = ` data-i18n-${name}="${escape(text)}"`;
          return `${name}="${escape(translate(text))}"${marker}`;
        });
        tag = tag.replace(/href="(\/[^"]*\/|\/)"/g, (_, href) => `href="${localizedPath(href, locale.code)}"`);
        return tag;
      }
      const key = decode(part.trim().replace(/\s+/g, " "));
      if (!key || !/[A-Za-z]/.test(key)) return part;
      const translated = part.replace(part.trim(), escape(translate(key)));
      return inHead ? translated : `<!--i18n:${encodeURIComponent(decode(part))}-->${translated}`;
    }).join("");
    const alternates = locales.map((item) => `<link rel="alternate" hreflang="${item.tag}" href="${origin}${localizedPath(path, item.code)}">`).join("");
    const scripts = path === "/" ? "" : '<script src="/language.js" type="module"></script>';
    html = html.replace("</head>", `<!-- site-languages:start --><meta name="rare-source-title" content="${escape(sourceTitle)}">${alternates}<link rel="alternate" hreflang="x-default" href="${origin}${path}"><link rel="stylesheet" href="/language.css">${scripts}<!-- site-languages:end --></head>`);
    await mkdir(`public${localPath}`, { recursive: true });
    await writeFile(`public${localPath}index.html`, html.replace(/[\t ]+$/gm, ""));
    allPaths.push(localPath);
  }
}
await writeFile("public/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${allPaths.map((path) => `<url><loc>${origin}${path}</loc></url>`).join("")}</urlset>\n`);
console.log(`Prepared ${allPaths.length} pages across ${locales.length} languages.`);
