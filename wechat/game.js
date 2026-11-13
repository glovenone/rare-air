import { request, readStorage, writeStorage } from "./platform.js";

const canvas = wx.createCanvas();
const paint = canvas.getContext("2d");
const displayFont = wx.loadFont("assets/bricolage-800.ttf") || "sans-serif";
const bodyFont = wx.loadFont("assets/dm-sans-400.ttf") || "sans-serif";
const boldFont = wx.loadFont("assets/dm-sans-600.ttf") || "sans-serif";
const ink = "#214d59";
const coral = "#d85d48";
const tiers = ["A passing breeze", "Familiar", "Uncommon", "Rare", "Exceptional"];
const colors = ["#7b9196", "#568480", "#2d9c90", "#5e78ad", "#c88b37"];
const images = {};
for (const name of ["dawn-sky", "cloud-bank", "balloon"]) {
  const image = wx.createImage();
  image.onload = () => { images[name] = image; };
  image.onerror = () => wx.showToast({ title: "An illustration could not load", icon: "none" });
  image.src = `assets/${name}.webp`;
}

let width = 390;
let height = 800;
let top = 55;
let bottom = 20;
let scale = 1;
let keyboardHeight = 0;
let view = "home";
let game = null;
let busy = false;
let offset = 0;
let answerText = "";
let retryAnswer = null;
let countdownUntil = 0;
let altitude = 0;
let targetAltitude = 0;
let pilotX = 0;
let pilotTarget = 0;
let drag = null;
let gust = 0;
let celebration = 0;
let buttons = [];
let balloonBounds = null;
let lastTime = 0;
let elapsed = 0;
let animation = null;
let savedReport = "";

function resize() {
  const info = wx.getWindowInfo();
  scale = info.windowWidth / width;
  height = info.windowHeight / scale;
  top = (info.safeArea?.top || 20) / scale + 20;
  bottom = (info.windowHeight - (info.safeArea?.bottom || info.windowHeight)) / scale + 18;
  const density = Math.min(info.pixelRatio || 1, 2);
  canvas.width = Math.round(info.windowWidth * density);
  canvas.height = Math.round(info.windowHeight * density);
  paint.setTransform(scale * density, 0, 0, scale * density, 0, 0);
}
resize();
wx.onWindowResize(resize);

function total() {
  return game?.answers.reduce((sum, answer) => sum + answer.points, 0) || 0;
}

function rounded(x, y, w, h, radius = 18) {
  paint.beginPath();
  paint.moveTo(x + radius, y);
  paint.arcTo(x + w, y, x + w, y + h, radius);
  paint.arcTo(x + w, y + h, x, y + h, radius);
  paint.arcTo(x, y + h, x, y, radius);
  paint.arcTo(x, y, x + w, y, radius);
  paint.closePath();
}

function text(value, x, y, size = 16, color = ink, font = bodyFont, align = "left") {
  paint.fillStyle = color;
  paint.font = `${size}px ${font}`;
  paint.textAlign = align;
  paint.textBaseline = "alphabetic";
  paint.fillText(String(value), x, y);
}

function wrapped(value, x, y, maxWidth, size = 24, lineHeight = 29, font = displayFont) {
  paint.font = `${size}px ${font}`;
  const words = String(value).split(/\s+/);
  let line = "";
  for (const word of words) {
    const next = line ? line + " " + word : word;
    if (line && paint.measureText(next).width > maxWidth) {
      text(line, x, y, size, ink, font);
      y += lineHeight;
      line = word;
    } else line = next;
  }
  text(line, x, y, size, ink, font);
  return y + lineHeight;
}

function button(label, x, y, w, h, action, secondary = false) {
  rounded(x, y, w, h, 16);
  paint.fillStyle = secondary ? "rgba(255,255,255,.65)" : coral;
  paint.fill();
  text(busy ? "One moment…" : label, x + w / 2, y + h / 2 + 5, 16,
    secondary ? ink : "#fffaf1", boldFont, "center");
  buttons.push({ x, y, w, h, action });
}

function card(y, h) {
  paint.save();
  paint.shadowColor = "rgba(27,69,79,.12)";
  paint.shadowBlur = 28;
  paint.shadowOffsetY = 8;
  rounded(18, y, 354, h, 26);
  paint.fillStyle = "rgba(255,252,242,.96)";
  paint.fill();
  paint.restore();
}

function drawSky(delta) {
  altitude += (targetAltitude - altitude) * (1 - Math.exp(-delta * 2.3));
  pilotX += (pilotTarget - pilotX) * (1 - Math.exp(-delta * 8));
  celebration = Math.max(0, celebration - delta * 0.33);
  gust = Math.max(0, gust - delta * 1.2);
  const sky = images["dawn-sky"];
  paint.fillStyle = "#b5dce5";
  paint.fillRect(0, 0, width, height);
  if (sky) {
    const ratio = Math.max(width / sky.width, height / sky.height);
    paint.drawImage(sky, (width - sky.width * ratio) / 2, (height - sky.height * ratio) / 2,
      sky.width * ratio, sky.height * ratio);
  }
  const tint = Math.min(0.28, altitude / 16000);
  paint.fillStyle = `rgba(38,99,148,${tint})`;
  paint.fillRect(0, 0, width, height);
  const cloud = images["cloud-bank"];
  if (cloud) {
    for (let index = 0; index < 15; index++) {
      const depth = 0.5 + (index % 3) * 0.15;
      const y = ((index * 170 + altitude * depth * 0.35 + elapsed * depth * 2) % (height + 300)) - 150;
      const w = 260 + (index % 4) * 55;
      const x = index % 2 ? 220 + Math.sin(elapsed * 0.06 + index) * 30 : -175;
      paint.globalAlpha = 0.45 + (index % 3) * 0.14;
      paint.drawImage(cloud, x, y, w, w * cloud.height / cloud.width);
    }
    paint.globalAlpha = 1;
  }
  // Small bird formations drift at different depths through the climb.
  paint.strokeStyle = "rgba(39,83,97,.45)";
  paint.lineWidth = 1.4;
  for (let index = 0; index < 5; index++) {
    const x = ((elapsed * (7 + index) + index * 77) % 500) - 50;
    const y = top + 90 + index * 23 + Math.sin(elapsed * 2 + index) * 3;
    paint.beginPath();
    paint.moveTo(x - 5, y + 2);
    paint.quadraticCurveTo(x - 2, y - 3, x, y);
    paint.quadraticCurveTo(x + 2, y - 3, x + 5, y + 2);
    paint.stroke();
  }
  const x = 200 + pilotX;
  const y = Math.min(height * 0.36, 330) + Math.sin(elapsed * 1.3) * 6 - Math.sin(gust * Math.PI) * 28;
  if (celebration > 0) {
    for (let index = 0; index < 3; index++) {
      const phase = (1 - celebration + index / 3) % 1;
      paint.beginPath();
      paint.ellipse(x, y + 83 + phase * 70, 45 + phase * 100, 10 + phase * 20, 0, 0, Math.PI * 2);
      paint.strokeStyle = `rgba(255,255,240,${(1 - phase) * celebration})`;
      paint.lineWidth = 2;
      paint.stroke();
    }
    for (let index = 0; index < 14; index++) {
      const phase = (1 - celebration + index / 14) % 1;
      const px = x + Math.sin(index * 4.7) * (40 + phase * 100);
      const py = y + 120 - phase * 250;
      paint.fillStyle = index % 2 ? "#fff9d8" : "#f0b66a";
      paint.globalAlpha = celebration * (1 - phase);
      paint.fillRect(px, py, 3, 7);
    }
    paint.globalAlpha = 1;
  }
  const balloon = images.balloon;
  if (balloon) {
    const w = 174;
    const h = w * balloon.height / balloon.width;
    paint.save();
    paint.translate(x, y);
    paint.rotate(Math.sin(elapsed * 0.8) * 0.025 + pilotX * 0.001);
    paint.drawImage(balloon, -w / 2, -h / 2, w, h);
    paint.restore();
    balloonBounds = { x: x - w / 2, y: y - h / 2, w, h };
  }
  // A paper-plane companion joins higher flights.
  if (altitude > 900 || celebration > 0.2) {
    const px = 200 + Math.sin(elapsed * 0.6) * 145;
    const py = top + 170 + Math.cos(elapsed * 0.6) * 34;
    paint.save();
    paint.translate(px, py);
    paint.rotate(Math.cos(elapsed * 0.6) * 0.3);
    paint.beginPath();
    paint.moveTo(-16, -8);
    paint.lineTo(18, 0);
    paint.lineTo(-12, 11);
    paint.lineTo(-5, 1);
    paint.closePath();
    paint.fillStyle = "#fff9e9";
    paint.fill();
    paint.beginPath();
    paint.moveTo(-5, 1);
    paint.lineTo(18, 0);
    paint.strokeStyle = "#a2bdc1";
    paint.stroke();
    paint.restore();
  }
}

function drawHeader() {
  text("RARE Air", 24, top + 10, 24, ink, displayFont);
  text(`${Math.round(altitude).toLocaleString()} m`, 24, top + 44, 19, ink, boldFont);
  if (game && view !== "home") {
    for (let index = 0; index < 5; index++) {
      rounded(24 + index * 26, top + 59, 20, 4, 2);
      paint.fillStyle = game.answers[index] ? colors[game.answers[index].tier] : "rgba(255,255,255,.75)";
      paint.fill();
    }
  }
}

function drawHome() {
  const y = height - bottom - 274;
  text("Rare answers.", 25, y - 53, 33, ink, displayFont);
  text("Higher flights.", 25, y - 15, 33, ink, displayFont);
  card(y, 274);
  wrapped("Five questions. Find a less obvious answer and catch a bigger updraft.", 38, y + 34, 310, 16, 23, bodyFont);
  button("Daily flight  ↑", 36, y + 101, 318, 51, () => start("daily"));
  button("Offline practice", 36, y + 161, 318, 47, () => start("offline"), true);
  text("Flight log", 103, y + 244, 14, ink, boldFont, "center");
  text("How to play", 280, y + 244, 14, ink, boldFont, "center");
  buttons.push({ x: 36, y: y + 219, w: 140, h: 42, action: showHistory });
  buttons.push({ x: 214, y: y + 219, w: 140, h: 42, action: showHelp });
}

function drawQuestion() {
  const prompt = game.question.prompt;
  // Measure wrapping before positioning the complete card above the keyboard.
  paint.font = `23px ${displayFont}`;
  let lines = 1;
  let line = "";
  for (const word of prompt.split(/\s+/)) {
    if (paint.measureText(line + " " + word).width > 308) { lines++; line = word; }
    else line += " " + word;
  }
  const cardHeight = 218 + lines * 28;
  const y = Math.max(top + 89, height - bottom - keyboardHeight - cardHeight - 8);
  card(y, cardHeight);
  text(`${game.question.category.toUpperCase()} · ${game.round + 1}/5`, 38, y + 30, 11, "#64808a", boldFont);
  const seconds = Math.max(0, Math.ceil((game.deadline - Date.now() - offset) / 1000));
  text(`${seconds}s`, 348, y + 30, 16, seconds <= 8 ? coral : ink, boldFont, "right");
  const fieldY = wrapped(prompt, 38, y + 65, 308, 23, 28) + 12;
  rounded(36, fieldY, 318, 49, 12);
  paint.fillStyle = "#edf1ec";
  paint.fill();
  paint.save();
  paint.beginPath();
  paint.rect(47, fieldY, 292, 49);
  paint.clip();
  text(answerText || "Tap to type your answer", 49, fieldY + 31, 16, answerText ? ink : "#829395");
  paint.restore();
  buttons.push({ x: 36, y: fieldY, w: 318, h: 49, action: openKeyboard });
  button(retryAnswer ? "Retry answer  ↑" : "Fly  ↑", 36, fieldY + 60, 240, 47, () => submit(retryAnswer?.answer ?? answerText));
  text("Skip", 315, fieldY + 89, 14, ink, boldFont, "center");
  buttons.push({ x: 282, y: fieldY + 60, w: 70, h: 47, action: () => submit("") });
  const remaining = Math.max(0, Math.min(1, (game.deadline - Date.now() - offset) / 30000));
  rounded(36, y + cardHeight - 16, 318 * remaining, 3, 1);
  paint.fillStyle = seconds <= 8 ? coral : "#5d9b90";
  paint.fill();
}

function drawReward() {
  const answer = game.answers[game.answers.length - 1];
  const y = height - bottom - 263;
  card(y, 263);
  text(answer.correct ? "YOU CAUGHT AN UPDRAFT" : "STILL A GOOD DAY TO FLY", 195, y + 32, 11, "#6e8b8a", boldFont, "center");
  text(tiers[answer.tier], 195, y + 76, 31, colors[answer.tier], displayFont, "center");
  text(answer.timed_out ? "Time drifted by." : answer.label || "A little pause in the breeze.", 195, y + 109, 16, ink, bodyFont, "center");
  text(`+${answer.points.toLocaleString()} m`, 195, y + 151, 30, ink, displayFont, "center");
  button(game.done ? "Your flight report  ↗" : "Climb higher  ↑", 36, y + 185, 318, 51,
    () => game.done ? finish() : prepareRound());
}

function drawReport() {
  const y = height - bottom - 348;
  card(y, 348);
  text(game.mode === "daily" ? "DAILY FLIGHT COMPLETE" : "PRACTICE FLIGHT COMPLETE", 38, y + 31, 11, "#6e8b8a", boldFont);
  text(`${total().toLocaleString()} m`, 38, y + 82, 43, ink, displayFont);
  text(`${game.answers.filter((answer) => answer.correct).length} of 5 correct · tap a stage to explore`, 38, y + 109, 13);
  for (let index = 0; index < 5; index++) {
    const answer = game.answers[index];
    const x = 38 + index * 64;
    rounded(x, y + 129, 58, 57, 12);
    paint.fillStyle = colors[answer.tier];
    paint.fill();
    text(index + 1, x + 29, y + 150, 11, "#fffaf1", boldFont, "center");
    text(answer.points, x + 29, y + 174, 18, "#fffaf1", displayFont, "center");
    buttons.push({ x, y: y + 129, w: 58, h: 57, action: () => showReview(index) });
  }
  button("Share your flight  ↗", 36, y + 205, 318, 48, share);
  button("Fly again", 36, y + 263, 240, 48, () => start("offline"), true);
  text("Home", 316, y + 293, 14, ink, boldFont, "center");
  buttons.push({ x: 283, y: y + 263, w: 70, h: 48, action: home });
}

function drawCountdown() {
  const seconds = Math.max(1, Math.ceil((countdownUntil - Date.now()) / 1000));
  text("Find your updraft.", 195, height - bottom - 166, 29, ink, displayFont, "center");
  text(seconds, 195, height - bottom - 85, 70, ink, displayFont, "center");
}

function frame(time) {
  const delta = Math.min(0.05, Math.max(0, (time - (lastTime || time)) / 1000));
  lastTime = time;
  elapsed += delta;
  buttons = [];
  drawSky(delta);
  drawHeader();
  if (view === "home") drawHome();
  if (view === "play") {
    drawQuestion();
    if (game.deadline <= Date.now() + offset && !busy && !retryAnswer) submit("");
  }
  if (view === "reward") drawReward();
  if (view === "report") drawReport();
  if (view === "countdown") {
    drawCountdown();
    if (Date.now() >= countdownUntil && !busy) beginRound();
  }
  animation = requestAnimationFrame(frame);
}

function accept(state) {
  game = state;
  offset = state.serverNow - Date.now();
  targetAltitude = total();
}

async function start(mode) {
  if (busy) return;
  busy = true;
  try {
    const day = new Date().toISOString().slice(0, 10);
    const id = mode === "daily" ? readStorage("daily:" + day, "") : "";
    let state;
    if (id) {
      try { state = await request("resume", { id }); }
      catch (error) {
        if (!/Game not found/.test(error.message)) throw error;
        state = await request("start", { mode, day });
      }
    } else state = await request("start", { mode, day });
    accept(state);
    if (mode === "daily") writeStorage("daily:" + day, game.id);
    answerText = "";
    retryAnswer = null;
    altitude = 0;
    if (game.done) finish();
    else if (game.awaitingStart) {
      if (game.answers.length) view = "reward";
      else prepareRound();
    } else view = "play";
  } catch (error) {
    wx.showToast({ title: error.message, icon: "none", duration: 3500 });
  } finally { busy = false; }
}

function prepareRound() {
  view = "countdown";
  countdownUntil = Date.now() + 3000;
}

async function beginRound() {
  busy = true;
  try {
    accept(await request("next", { id: game.id, round: game.round }));
    answerText = "";
    retryAnswer = null;
    view = game.done ? "report" : game.awaitingStart ? "reward" : "play";
  } catch (error) {
    wx.showToast({ title: error.message, icon: "none", duration: 3500 });
    // Keep the round paused until a deliberate retry starts its server timer.
    view = "home";
  } finally { busy = false; }
}

async function submit(value) {
  if (busy || view !== "play") return;
  const payload = retryAnswer || { id: game.id, round: game.round, answer: value.trim().slice(0, 100) };
  busy = true;
  wx.hideKeyboard();
  keyboardHeight = 0;
  try {
    accept(await request("answer", payload));
    retryAnswer = null;
    if (!game.awaitingStart && !game.done) { view = "play"; return; }
    celebration = game.answers[game.answers.length - 1].correct ? 1 : 0;
    if (celebration) wx.vibrateShort({ type: "light", fail() {} });
    view = "reward";
    if (game.done) saveReport();
  } catch (error) {
    retryAnswer = payload;
    wx.showToast({ title: error.message + " Tap Retry answer.", icon: "none", duration: 3500 });
  } finally { busy = false; }
}

function saveReport() {
  if (savedReport === game.id) return;
  const history = readStorage("history", []);
  writeStorage("history", [{ id: game.id, day: game.day, score: total(), mode: game.mode },
    ...history.filter((item) => item.id !== game.id)].slice(0, 30));
  savedReport = game.id;
}

function finish() { saveReport(); view = "report"; }
function home() {
  wx.hideKeyboard();
  keyboardHeight = 0;
  view = "home";
  targetAltitude = 0;
}
function showHelp() {
  wx.showModal({ title: "Find your updraft", showCancel: false,
    content: "Answer five English trivia prompts, 30 seconds each. Correct answers earn 100, 250, 500 or 1,000 meters from fixed editorial rarity tiers. Aim for 5,000 m. Drag the balloon to steer, or tap it for a gust. Daily flights use an online anonymous identity. Offline practice and your flight log stay on this device." });
}
function showHistory() {
  const history = readStorage("history", []);
  wx.showModal({ title: "Your flight log", showCancel: false,
    content: history.length ? history.slice(0, 12).map((item) =>
      `${item.day} · ${item.score.toLocaleString()} m · ${item.mode === "daily" ? "Daily" : "Practice"}`).join("\n") : "Your first flight is waiting. Completed flights are saved on this device." });
}
function showReview(index) {
  const question = game.review[index];
  wx.showModal({ title: `Stage ${index + 1} · Accepted answers`, showCancel: false,
    content: question.prompt + "\n\n" + question.answers.map((answer) =>
      `${answer.label} · ${[0, 100, 250, 500, 1000][answer.tier]} m`).join("\n") });
}
function share() {
  wx.shareAppMessage({ title: `I climbed ${total().toLocaleString()} m in RARE Air. Find a rarer answer and fly higher!` });
}
function openKeyboard() {
  if (retryAnswer) return;
  wx.showKeyboard({ defaultValue: answerText, maxLength: 100, multiple: false,
    confirmHold: false, confirmType: "go", keyboardType: "text",
    fail() { wx.showToast({ title: "Tap the answer field to try again", icon: "none" }); } });
}
wx.onKeyboardInput(({ value }) => { answerText = value.slice(0, 100); });
wx.onKeyboardConfirm(({ value }) => { if (value.trim()) submit(value); });
wx.onKeyboardHeightChange(({ height: value }) => { keyboardHeight = value / scale; });
wx.onKeyboardComplete(() => { keyboardHeight = 0; });

function point(touch) { return { x: touch.clientX / scale, y: touch.clientY / scale }; }
function inside(position, box) {
  return box && position.x >= box.x && position.x <= box.x + box.w &&
    position.y >= box.y && position.y <= box.y + box.h;
}
wx.onTouchStart(({ touches }) => {
  const position = point(touches[0]);
  const buttonHit = buttons.find((box) => inside(position, box));
  drag = { ...position, pilot: pilotTarget, button: buttonHit, balloon: !buttonHit && inside(position, balloonBounds) };
});
wx.onTouchMove(({ touches }) => {
  if (!drag?.balloon) return;
  pilotTarget = Math.max(-90, Math.min(90, drag.pilot + point(touches[0]).x - drag.x));
});
wx.onTouchEnd(({ changedTouches }) => {
  if (!drag) return;
  const position = point(changedTouches[0]);
  if (Math.hypot(position.x - drag.x, position.y - drag.y) < 12) {
    if (drag.button && inside(position, drag.button) && !busy) drag.button.action();
    else if (drag.balloon) gust = 1;
  }
  drag = null;
});
wx.onTouchCancel(() => { drag = null; });
wx.showShareMenu({ menus: ["shareAppMessage"] });
wx.onShareAppMessage(() => ({ title: "RARE Air · Rare answers. Higher flights." }));
wx.onHide(() => { cancelAnimationFrame(animation); animation = null; });
wx.onShow(() => {
  if (animation === null) { lastTime = 0; animation = requestAnimationFrame(frame); }
});
animation = requestAnimationFrame(frame);
