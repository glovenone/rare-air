import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { build } from "esbuild";
const source = await readFile(
  new URL("../public/app.js", import.meta.url),
  "utf8",
);
const substitutes = {
  "./i18n.js": `export const language=()=> 'en',initialLanguage=()=> 'en',selectLanguage=()=>{},applyLanguage=()=>{},createLanguageSelector=()=>{}; export function t(a,...v){return Array.isArray(a)?a.reduce((s,p,i)=>s+(i?v[i-1]:'')+p,''):String(a)}`,
  "./locales.js": `export const localizedPath=p=>p`,
  "./passport.js": `export const initPassport=()=>({account:()=>null})`,
  "./progression.js": `export const initProgression=()=>({openRoutes(){}})`,
  "./relay.js": `export const initRelay=()=>({})`,
  "./environments.js": `export const setEnvironment=()=>{}`,
  "./platform.js": `export const native=false,publicOrigin='http://localhost',request=(...a)=>__request(...a),haptic=async()=>{},shareFlight=async()=>{}`,
  "/sky.js": `export const setFlight=()=>{}`,
};
const bundled = await build({
  stdin: {
    contents: source,
    resolveDir: new URL("../public/", import.meta.url).pathname,
    sourcefile: "app.js",
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  plugins: [
    {
      name: "browser-boundaries",
      setup(b) {
        b.onResolve({ filter: /.*/ }, (a) =>
          a.path in substitutes
            ? { path: a.path, namespace: "fixture" }
            : undefined,
        );
        b.onLoad({ filter: /.*/, namespace: "fixture" }, (a) => ({
          contents: substitutes[a.path],
          loader: "js",
        }));
      },
    },
  ],
});
class Element extends EventTarget {
  constructor() {
    super();
    this.dataset = {};
    this.style = { setProperty() {} };
    this.classList = { add() {}, remove() {}, toggle() {} };
    this.textContent = "";
    this.value = "";
    this.children = [];
  }
  setAttribute() {}
  replaceChildren(...nodes) {
    this.children = nodes;
  }
  append(...nodes) {
    this.children.push(...nodes);
  }
  focus() {}
  close() {}
  showModal() {}
  getBoundingClientRect() {
    return { left: 0, right: 400, top: 0, bottom: 800 };
  }
}
const tick = () => new Promise((resolve) => setImmediate(resolve));
function deferred() {
  let resolve;
  const promise = new Promise((r) => (resolve = r));
  return { promise, resolve };
}
async function page(handler) {
  const nodes = new Map(),
    storage = new Map(),
    timeouts = [],
    calls = [];
  const el = (id) => {
    if (!nodes.has(id)) nodes.set(id, new Element());
    return nodes.get(id);
  };
  const body = new Element();
  body.dataset.view = "home";
  const document = {
    body,
    documentElement: new Element(),
    getElementById: el,
    createElement: () => new Element(),
    createTextNode: (text) => ({ textContent: text }),
    querySelector: () => null,
    querySelectorAll: () => [],
  };
  const window = new EventTarget();
  window.scrollTo = () => {};
  const context = {
    window,
    document,
    location: {
      href: "http://localhost/",
      pathname: "/",
      search: "",
      hash: "",
      origin: "http://localhost",
    },
    history: { replaceState() {} },
    localStorage: {
      getItem: (k) => storage.get(k) ?? null,
      setItem: (k, v) => storage.set(k, v),
      removeItem: (k) => storage.delete(k),
    },
    addEventListener: window.addEventListener.bind(window),
    Event,
    CustomEvent,
    URL,
    console,
    setInterval: () => 1,
    clearInterval() {},
    setTimeout: (fn) => timeouts.push(fn),
    clearTimeout() {},
    __request: async (path, body) => {
      path = path.split("?")[0];
      calls.push(path);
      if (path === "puzzle")
        return {
          day: "2026-11-17",
          number: 6,
          bankSize: 601,
          reset: Date.now() + 100000,
          topics: [],
        };
      return handler(path, body);
    },
  };
  vm.runInNewContext(bundled.outputFiles[0].text, context);
  await tick();
  return { el, body, window, storage, timeouts, calls };
}
const flight = (extra = {}) => ({
  id: "old-flight",
  day: "2026-11-17",
  mode: "daily",
  round: 0,
  answers: [],
  done: false,
  awaitingStart: false,
  serverNow: Date.now(),
  deadline: Date.now() + 30000,
  question: { prompt: "A visible live question", category: "SCIENCE" },
  ...extra,
});
test("the real game ignores a pending start response after a passport transition", async () => {
  const start = deferred();
  const p = await page(() => start.promise);
  const action = p.el("start").onclick();
  p.window.dispatchEvent(new Event("rare:identity"));
  start.resolve(flight());
  await action;
  assert.equal(p.body.dataset.view, "home");
  assert.equal(p.storage.has("rare:sessions"), false);
  assert.equal(p.el("error").textContent, "");
});
test("history refresh leaves an active flight and its question on screen", async () => {
  const p = await page(async () => flight());
  await p.el("start").onclick();
  assert.equal(p.body.dataset.view, "play");
  p.window.dispatchEvent(new Event("rare:history"));
  assert.equal(p.body.dataset.view, "play");
  assert.equal(p.el("question").textContent, "A visible live question");
});
test("an account change during preparation cancels the old countdown without starting its server clock", async () => {
  const p = await page(async () => flight({ awaitingStart: true }));
  const action = p.el("start").onclick();
  await tick();
  assert.equal(p.body.dataset.view, "launch");
  p.window.dispatchEvent(new Event("rare:identity"));
  p.timeouts.shift()();
  await action;
  assert.equal(p.body.dataset.view, "home");
  assert.equal(p.calls.includes("next"), false);
  assert.equal(p.el("error").textContent, "");
});
test("a pending answer cannot render old account results after logout", async () => {
  const answer = deferred();
  const p = await page(async (path) =>
    path === "answer" ? answer.promise : flight(),
  );
  await p.el("start").onclick();
  const action = p.el("skip").onclick();
  p.window.dispatchEvent(new Event("rare:identity"));
  answer.resolve(
    flight({
      round: 1,
      awaitingStart: true,
      answers: [{ points: 1000, tier: 4, correct: true }],
    }),
  );
  await action;
  assert.equal(p.body.dataset.view, "home");
  assert.equal(p.el("error").textContent, "");
});
