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

test("first visits traverse browser preferences, retain manual choices and respect explicit language paths", () => {
  function initial(preferences, saved = null, path = "/") {
    const context = vm.createContext({
      module: { exports: {} },
      window: {},
      document: { documentElement: { lang: path.startsWith("/ko/") ? "ko" : "en" } },
      location: { pathname: path },
      navigator: { languages: preferences, language: preferences[0] },
      localStorage: { getItem: () => saved },
    });
    vm.runInContext(outputFiles[0].text, context);
    return context.module.exports.initialLanguage();
  }
  assert.equal(initial(["nl-NL", "fr-CA", "en-US"]), "fr");
  assert.equal(initial(["vi-VN", "ko-KR", "en-US"]), "ko");
  assert.equal(initial(["en-GB", "ko-KR"]), "en");
  assert.equal(initial(["vi-VN", "th-TH"]), "en");
  assert.equal(initial(["zh-Hant-TW", "es-MX"]), "es");
  assert.equal(initial(["zh-Hans-CN", "en-US"]), "zh");
  assert.equal(initial(["ko-KR"], "de"), "de");
  assert.equal(initial(["ko-KR"], "invalid"), "ko");
  assert.equal(initial(["en-US"], "de", "/ko/how-to-play/"), "ko");
});
