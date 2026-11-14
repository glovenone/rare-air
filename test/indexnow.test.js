import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";

const { outputFiles } = await build({
  entryPoints: ["src/worker.ts"],
  bundle: true,
  write: false,
  format: "esm",
  platform: "neutral",
});
const { default: worker } = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString("base64")}`
);

test("IndexNow ownership response uses the configured value and stays out of search", async () => {
  const env = {
    INDEXNOW_KEY: "a".repeat(64),
    ASSETS: { fetch: () => assert.fail("Verification must reach the Worker") },
  };
  const url = "https://krillionunlimited.top/indexnow-key.txt";
  const response = await worker.fetch(new Request(url), env);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), env.INDEXNOW_KEY);
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex");
  assert.match(response.headers.get("Content-Type"), /^text\/plain/);

  const head = await worker.fetch(new Request(url, { method: "HEAD" }), env);
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
  const missing = await worker.fetch(new Request(url), { ASSETS: env.ASSETS });
  assert.equal(missing.status, 404);
  assert.equal(await missing.text(), "");
});

test("ordinary static requests keep using the asset service", async () => {
  let requested;
  const request = new Request("https://krillionunlimited.top/how-to-play/");
  const response = await worker.fetch(request, {
    ASSETS: { fetch: async (value) => { requested = value; return new Response("guide"); } },
  });
  assert.equal(requested, request);
  assert.equal(await response.text(), "guide");
});
