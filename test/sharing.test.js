import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { transform } from "esbuild";

const { code } = await transform(await readFile("public/platform.js", "utf8"), {
  format: "cjs",
  loader: "js",
});

function webPlatform(navigator) {
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    location: { origin: "https://krillionunlimited.top" },
    navigator,
  });
  return module.exports;
}

test("web sharing uses the system share sheet and preserves the scorecard", async () => {
  const text = "RARE FLIGHT ↗\n2,000 m\nhttps://krillionunlimited.top";
  let payload;
  const platform = webPlatform({
    share: async (value) => { payload = value; },
    clipboard: { writeText: () => assert.fail("Unexpected clipboard write") },
  });
  assert.equal(await platform.shareFlight(text), "shared");
  assert.equal(payload.title, "RARE Air flight");
  assert.equal(payload.text, text);
});

test("cancelling the share sheet leaves the clipboard alone", async () => {
  const platform = webPlatform({
    share: async () => { throw Object.assign(new Error("Cancelled"), { name: "AbortError" }); },
    clipboard: { writeText: () => assert.fail("Unexpected clipboard write") },
  });
  assert.equal(await platform.shareFlight("scorecard"), "cancelled");
});

test("unsupported or unavailable system sharing falls back to copying", async () => {
  for (const share of [undefined, async () => { throw new Error("Unavailable"); }]) {
    let copied;
    const platform = webPlatform({
      share,
      clipboard: { writeText: async (text) => { copied = text; } },
    });
    assert.equal(await platform.shareFlight("scorecard"), "copied");
    assert.equal(copied, "scorecard");
  }
});

test("clipboard failure reaches the existing visible-text fallback", async () => {
  const denied = new Error("Clipboard denied");
  const platform = webPlatform({ clipboard: { writeText: async () => { throw denied; } } });
  await assert.rejects(platform.shareFlight("scorecard"), denied);
});
