import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

test("published search pages have consistent metadata and working local links", async () => {
  const sitemap = await readFile("public/sitemap.xml", "utf8");
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]));
  assert.equal(urls.length, 9);
  assert.equal(new Set(urls.map(String)).size, urls.length);
  const titles = new Set();
  const descriptions = new Set();

  for (const url of urls) {
    const html = await readFile(resolve("public", `.${url.pathname}`, "index.html"), "utf8");
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    const description = html.match(/name="description"\s+content="([^"]+)"/)?.[1];
    assert.ok(title && !titles.has(title), `Unique title for ${url}`);
    assert.ok(description && !descriptions.has(description), `Unique description for ${url}`);
    titles.add(title);
    descriptions.add(description);
    assert.ok(html.includes(`rel="canonical" href="${url}"`) ||
      html.includes(`rel="canonical"\n      href="${url}"`), `Canonical for ${url}`);
    assert.match(html, /name="twitter:card" content="summary_large_image"/);
    assert.ok(html.includes(`${url.origin}/art/flight-preview.jpg`));

    for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const data = JSON.parse(match[1]);
      assert.equal(data["@context"], "https://schema.org");
    }
    if (url.pathname !== "/") {
      assert.equal([...html.matchAll(/<h1[ >]/g)].length, 1, `Guide heading for ${url}`);
    }
    for (const [, href] of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) {
      const path = new URL(href, url).pathname;
      const target = path.endsWith("/") ? `${path}index.html` : path;
      assert.ok((await stat(resolve("public", `.${target}`))).isFile(), `Local resource ${href} on ${url}`);
    }
  }
  assert.ok((await stat("public/art/flight-preview.jpg")).size < 100_000);
});
