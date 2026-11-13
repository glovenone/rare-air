import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { build } from "esbuild";
import { questions } from "../src/questions.js";
import { wrapText } from "../wechat/text.js";

test("WeChat prompt wrapping keeps long terms inside the question card", () => {
  for (const question of questions) {
    const lines = wrapText(question.prompt, 308, (part) => part.length * 15);
    assert.ok(lines.every((line) => line.length * 15 <= 308), question.id);
    assert.equal(lines.join("").replace(/\s/g, ""), question.prompt.replace(/\s/g, ""));
  }
  assert.deepEqual(wrapText("Rare answers. Higher flights.", 15, (part) => part.length),
    ["Rare answers.", "Higher flights."]);
});

// This exercises the packaged game with WeChat-shaped APIs and no browser DOM.
// It catches accidental web-only dependencies and mismatched keyboard/touch APIs.
test("WeChat Canvas flight accepts keyboard answers through all five rounds", async () => {
  const { outputFiles } = await build({
    entryPoints: ["wechat/game.js"], bundle: true, write: false,
    format: "iife", define: { "process.env.SITE_URL": JSON.stringify("") },
  });
  const events = {};
  const storage = new Map();
  let now = Date.now();
  let nextFrame;
  let drawn = [];
  let shared;
  let keyboardOpen = false;
  const context = new Proxy({}, {
    get: (_, name) => {
      if (name === "measureText") return (text) => ({ width: text.length * 11 });
      if (name === "fillText") return (value, x, y) => drawn.push({ value: String(value), x, y });
      return () => {};
    },
    set: () => true,
  });
  const wx = {
    createCanvas: () => ({ getContext: () => context }),
    createImage: () => ({ width: 200, height: 200 }),
    loadFont: () => "Test Font",
    getWindowInfo: () => ({ windowWidth: 390, windowHeight: 844, pixelRatio: 2,
      safeArea: { top: 47, bottom: 810 } }),
    getStorageSync: (key) => storage.get(key),
    setStorageSync: (key, value) => storage.set(key, value),
    showKeyboard: () => { keyboardOpen = true; },
    hideKeyboard: () => { keyboardOpen = false; },
    showToast: ({ title }) => assert.fail(title),
    vibrateShort() {}, showShareMenu() {}, showModal() {},
    shareAppMessage: (value) => { shared = value; },
  };
  for (const name of ["WindowResize", "KeyboardInput", "KeyboardConfirm",
    "KeyboardHeightChange", "KeyboardComplete", "TouchStart", "TouchMove",
    "TouchEnd", "TouchCancel", "ShareAppMessage", "Hide", "Show"])
    wx["on" + name] = (callback) => { events[name] = callback; };
  class Clock extends Date { static now() { return now; } }
  vm.runInNewContext(outputFiles[0].text, {
    wx, Date: Clock, console,
    requestAnimationFrame: (callback) => { nextFrame = callback; return 1; },
    cancelAnimationFrame() {},
  });
  function draw() { drawn = []; nextFrame(now); }
  async function tap(label) {
    const element = drawn.find((item) => item.value === label);
    assert.ok(element, "Visible control " + label);
    const touch = { clientX: element.x, clientY: element.y - 5 };
    events.TouchStart({ touches: [touch] });
    events.TouchEnd({ changedTouches: [touch] });
    await new Promise(setImmediate);
    draw();
  }
  draw();
  await tap("Offline practice");
  let expectedScore = 0;
  for (let round = 0; round < 5; round++) {
    now += 3100;
    draw();
    await new Promise(setImmediate);
    draw();
    const content = drawn.map((item) => item.value).join(" ");
    const question = questions.find((question) =>
      content.replace(/\s/g, "").includes(question.prompt.replace(/\s/g, "")));
    assert.ok(question, "A bank prompt is visible");
    await tap("Tap to type your answer");
    assert.equal(keyboardOpen, true);
    const answer = question.answers.at(-1);
    events.KeyboardInput({ value: answer.label });
    events.KeyboardConfirm({ value: answer.label });
    await new Promise(setImmediate);
    draw();
    assert.equal(keyboardOpen, false);
    expectedScore += [0, 100, 250, 500, 1000][answer.tier];
    assert.ok(drawn.some((item) => item.value === `+${[0, 100, 250, 500, 1000][answer.tier].toLocaleString()} m`));
    await tap(round === 4 ? "Your flight report  ↗" : "Climb higher  ↑");
  }
  assert.ok(drawn.some((item) => item.value === `${expectedScore.toLocaleString()} m`));
  assert.equal(storage.get("rare-air:history").length, 1);
  assert.equal(storage.get("rare-air:history")[0].score, expectedScore);
  await tap("Share your flight  ↗");
  assert.match(shared.title, new RegExp(expectedScore.toLocaleString()));
  await tap("Home");
  assert.ok(drawn.some((item) => item.value === "Daily flight  ↑"));
});
