import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

const source = await readFile(new URL("../public/analytics.js", import.meta.url), "utf8");

function visit({ consent = null, hostname = "krillionunlimited.top", id = "G-TEST123" } = {}) {
  const scripts = [];
  const elements = [];
  const listeners = {};
  const cookieWrites = [];
  const window = {};
  const document = {
    title: "RARE Air",
    referrer: "https://example.com/guide?email=private#section",
    get cookie() { return "_ga=existing; rare_player=private-player"; },
    set cookie(value) { cookieWrites.push(value); },
    querySelector: () => ({ content: id }),
    createElement: (tag) => ({
      tag,
      setAttribute() {},
      addEventListener(type, handler) { this[type] = handler; },
      querySelector: () => ({ focus() {} }),
    }),
    head: { append: (tag) => scripts.push(tag) },
    body: { append: (element) => elements.push(element) },
    addEventListener: (type, handler) => { listeners[type] = handler; },
  };
  runInNewContext(source, {
    document, window, URL,
    location: { protocol: "https:", hostname, href: `https://${hostname}/?answer=private#session` },
    localStorage: { getItem: () => consent, setItem() {} },
  });
  const choose = (choice) => elements[0].click({
    target: { closest: () => ({ dataset: { choice } }) },
  });
  const events = () => (window.dataLayer || []).map((args) => [...args]);
  return { scripts, elements, listeners, window, cookieWrites, choose, events };
}

test("website analytics waits for consent and stays absent from native hosts or missing configuration", () => {
  const page = visit();
  assert.equal(page.scripts.length, 0);
  assert.equal(page.window.gtag, undefined);
  page.choose("denied");
  assert.equal(page.scripts.length, 0);
  assert.equal(visit({ hostname: "localhost", consent: "granted" }).scripts.length, 0);
  assert.equal(visit({ id: "", consent: "granted" }).scripts.length, 0);
});

test("consented page views remove private URL parameters and download events include only the platform", () => {
  const page = visit({ consent: "granted" });
  assert.equal(page.scripts.length, 1);
  const pageView = page.events().find(([kind, name]) => kind === "event" && name === "page_view");
  assert.equal(pageView[2].page_location, "https://krillionunlimited.top/");
  assert.equal(pageView[2].page_referrer, "https://example.com/guide");
  page.listeners.click({ target: { closest: () => ({ dataset: { downloadPlatform: "android" } }) } });
  const download = page.events().find(([, name]) => name === "app_download_click");
  assert.deepEqual(JSON.parse(JSON.stringify(download[2])), { app_platform: "android" });
  assert.equal(JSON.stringify(page.events()).includes("private"), false);
});

test("manual page views disable automatic collection before Google tag initialization", () => {
  const page = visit({ consent: "granted" });
  const events = page.events();
  const automaticViews = events.findIndex(([kind, key]) => kind === "set" && key === "send_page_view");
  const initialization = events.findIndex(([kind]) => kind === "js");
  assert(automaticViews >= 0 && automaticViews < initialization);
  assert.equal(events[automaticViews][2], false);
  assert.equal(events.find(([kind]) => kind === "config")[2].send_page_view, false);
  page.choose("granted");
  assert.equal(page.events().filter(([kind, name]) => kind === "event" && name === "page_view").length, 1);
  assert.equal(page.scripts.length, 1);
});

test("revoking consent stops events, preserves gameplay cookies and supports re-enabling", () => {
  const page = visit({ consent: "granted" });
  page.choose("denied");
  assert.equal(page.window["ga-disable-G-TEST123"], true);
  assert.equal(page.cookieWrites.some((cookie) => cookie.includes("rare_player")), false);
  assert.equal(page.cookieWrites.length, 2);
  assert.match(page.cookieWrites[0], /^_ga=; Max-Age=0/);
  const count = page.events().length;
  page.listeners.click({ target: { closest: () => ({ dataset: { downloadPlatform: "ios" } }) } });
  assert.equal(page.events().length, count);
  page.choose("granted");
  assert.equal(page.window["ga-disable-G-TEST123"], false);
  assert.equal(page.events().at(-1)[2].analytics_storage, "granted");
  assert.equal(page.scripts.length, 1);
});
