import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { build } from "esbuild";

const { outputFiles } = await build({
  entryPoints: ["public/i18n.js"], bundle: true, format: "cjs", write: false,
});

test("bundled native UI and separately loaded Canvas share language selection", () => {
  const storage = new Map();
  const window = { dispatchEvent() {} };
  const document = {
    documentElement: { lang: "en", dir: "ltr" }, body: {},
    createTreeWalker: () => ({ nextNode: () => false }),
    querySelectorAll: () => [], querySelector: () => null,
    getElementById: () => null,
  };
  const context = vm.createContext({
    window, document, NodeFilter: { SHOW_TEXT: 4 },
    CustomEvent: class {}, URL,
    localStorage: { setItem: (key, value) => storage.set(key, value), getItem: (key) => storage.get(key) },
    location: { pathname: "/" }, navigator: { language: "en" },
  });
  function loadCopy() {
    context.module = { exports: {} };
    vm.runInContext(`(function(){${outputFiles[0].text}\n})()`, context);
    return context.module.exports;
  }
  const ui = loadCopy();
  const canvas = loadCopy();
  ui.selectLanguage("zh");
  assert.equal(canvas.language(), "zh");
  assert.equal(canvas.t("Fly"), "起飞");
  assert.equal(canvas.t`${"Fly"}`, "Fly", "domain values must not be translated as interface keys");
  canvas.selectLanguage("ar");
  assert.equal(ui.language(), "ar");
  assert.equal(document.documentElement.dir, "rtl");
  assert.equal(storage.get("rare:language"), "ar");
  assert.equal(ui.initialLanguage(), "ar");
  ui.selectLanguage("en");
  assert.equal(canvas.t("Fly"), "Fly");
  assert.equal(document.documentElement.dir, "ltr");
});
