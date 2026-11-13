const $ = (id) => document.getElementById(id);
const rarityNames = ["Unformed", "Common", "Uncommon", "Rare", "Exceptional"];
const specimenNames = ["Unformed", "Quartz", "Jade", "Amethyst", "Amber"];
let game = null;
let puzzle = null;
let busy = false;
let serverOffset = 0;
let timer = null;
let scene = null;
let sceneState = { mode: "home", tier: 4 };
let soundEnabled = false;
let audioContext = null;
let displayView = "home";

const storage = {
  get(key, fallback = null) {
    try {
      return JSON.parse(localStorage.getItem("rare:" + key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem("rare:" + key, JSON.stringify(value));
    } catch {
      /* The game can still be played when local storage is unavailable. */
    }
  },
};

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function setError(message = "") {
  $("error").textContent = message;
  $("error").hidden = !message;
}

async function api(path, body) {
  const response = await fetch("/api/" + path, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The connection was interrupted. Please try again.");
  }
  if (!response.ok) throw new Error(data.error || "Please try again.");
  return data;
}

function setBusy(value) {
  busy = value;
  for (const id of [
    "start",
    "practice",
    "submit",
    "skip",
    "play-again",
    "next",
  ]) {
    $(id).disabled = value;
    $(id).setAttribute("aria-busy", String(value));
  }
}

function score() {
  return game?.answers.reduce((sum, answer) => sum + answer.points, 0) || 0;
}

function updateScene(tier = 4, celebrate = false) {
  sceneState = { mode: displayView, tier, celebrate };
  document.body.dataset.tier = tier;
  $("specimen-stage").setAttribute(
    "aria-label",
    `${specimenNames[tier]} crystal, ${rarityNames[tier].toLowerCase()} rarity. Drag to rotate.`,
  );
  scene?.setSpecimen(sceneState);
  requestAnimationFrame(positionScene);
}

function positionScene() {
  const stage = $("specimen-stage");
  stage.style.removeProperty("top");
  stage.style.removeProperty("height");
  if (innerWidth > 750 || displayView === "result") return;
  let before;
  let after;
  if (displayView === "home") {
    before = document.querySelector(".intro");
    after = document.querySelector(".home-actions");
  } else if (displayView === "play") {
    before = document.querySelector(".question-hint");
    after = $("answer-form");
  } else if (displayView === "reveal") {
    before = $("reveal-note");
    after = document.querySelector(".reward");
  }
  if (!before || !after) return;
  const top = before.getBoundingClientRect().bottom + scrollY;
  const height = Math.max(
    100,
    after.getBoundingClientRect().top + scrollY - top,
  );
  stage.style.top = `${top}px`;
  stage.style.height = `${height}px`;
}
addEventListener("resize", positionScene);
document.fonts.ready.then(positionScene);

function show(view) {
  displayView = view;
  for (const id of ["home", "play", "reveal", "result"])
    $(id).hidden = id !== view;
  document.body.dataset.view = view;
  $("specimen-stage").setAttribute("aria-hidden", String(view === "result"));
  if (view !== "play") clearInterval(timer);
  setError();
}

function miniCrystal(tier) {
  const crystal = element("i", undefined, "mini-crystal");
  crystal.dataset.tier = tier;
  crystal.setAttribute("aria-hidden", "true");
  return crystal;
}

function renderTray(id) {
  const slots = Array.from({ length: 5 }, (_, index) => {
    const answer = game.answers[index];
    const slot = element("div", undefined, "collection-slot");
    if (answer) {
      slot.append(
        miniCrystal(answer.tier),
        element("small", "+" + answer.points),
      );
      slot.setAttribute(
        "aria-label",
        `${rarityNames[answer.tier]}, ${answer.points} points`,
      );
    } else {
      slot.classList.add("empty");
      if (index === game.round) slot.classList.add("pending");
      slot.setAttribute("aria-label", "Not yet discovered");
    }
    return slot;
  });
  $(id).replaceChildren(...slots);
}

function openDialog(title, paragraphs) {
  const content = element("div");
  content.append(element("h2", title));
  paragraphs.forEach((text) => content.append(element("p", text)));
  $("modal-content").replaceChildren(content);
  $("modal").showModal();
  return content;
}

$("close-modal").onclick = () => $("modal").close();
$("modal").addEventListener("click", (event) => {
  if (event.target !== $("modal")) return;
  const bounds = $("modal").getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
    $("modal").close();
});

$("help").onclick = () => {
  const content = openDialog("A little less obvious.", [
    "Each discovery has five questions. You have 30 seconds per question to type one correct answer. The less obvious your answer, the more points you earn.",
    "Your answer becomes a crystal. Common answers create quartz, uncommon answers jade, rare answers amethyst, and exceptional answers amber. An incorrect answer, skip or timeout leaves an unformed specimen worth zero points.",
    "Inspect each discovery at your own pace. The next question stays hidden and its clock starts when you press Continue. Once a question is active, closing the page or opening a dialog does not pause it.",
    "Daily games reset at midnight UTC, with one attempt per browser. Unlimited practice creates fresh sets. Capitalization, spaces, punctuation and accepted aliases are handled automatically. Rarity tiers are fixed editorial ratings.",
  ]);
  const tiers = element("div", undefined, "tier-list");
  ["Quartz · 100", "Jade · 250", "Amethyst · 500", "Amber · 1,000"].forEach(
    (text) => tiers.append(element("span", text)),
  );
  content.append(tiers);
};

$("about").onclick = () =>
  openDialog("Made for curious minds.", [
    "RARE is an independent daily trivia game. The crystal laboratory turns the less obvious things you know into a collection. It is inspired by rare-answer games, including Krillion.",
    `The current bank has ${puzzle?.bankSize || 400} curated English prompts. Every answer is checked on the server. Rarity is an editorial difficulty rating. Crystal names and grades are game rewards.`,
    "An anonymous browser cookie keeps your daily attempt. Game results and chosen answers are stored for scoring and the leaderboard. Local storage holds your device collection history. Clearing browser data removes your local identity.",
    "Sound starts off. Reduced-motion preferences are respected. A simplified crystal illustration appears when 3D graphics are unavailable. Drag the 3D specimen to rotate it.",
  ]);

$("stats").onclick = () => {
  const history = Object.values(storage.get("history", {}));
  const content = openDialog("Your discoveries.", [
    "Completed daily collections saved on this browser.",
  ]);
  const grid = element("div", undefined, "stats-grid");
  const best = Math.max(0, ...history.map((item) => item.score));
  const average = history.length
    ? Math.round(
        history.reduce((sum, item) => sum + item.score, 0) / history.length,
      )
    : 0;
  for (const [label, value] of [
    ["COLLECTIONS", history.length],
    ["AVERAGE", average],
    ["BEST SCORE", best],
  ]) {
    const cell = element("div");
    cell.append(element("strong", String(value)), element("small", label));
    grid.append(cell);
  }
  content.append(grid);
  const recent = history
    .slice()
    .sort((a, b) => b.day.localeCompare(a.day))
    .slice(0, 7);
  for (const collection of recent) {
    const row = element("div", undefined, "history-collection");
    const label = element("div", collection.day);
    label.append(
      element("small", collection.score.toLocaleString() + " points"),
    );
    row.append(label);
    if (collection.tiers) {
      const specimens = element("div", undefined, "history-specimens");
      collection.tiers.forEach((tier) => specimens.append(miniCrystal(tier)));
      row.append(specimens);
    }
    content.append(row);
  }
};

$("archive").onclick = () => {
  const content = openDialog("Something you missed.", [
    "Choose a daily discovery from November 12, 2026 onwards. Each date has one attempt per browser.",
  ]);
  const form = element("form", undefined, "archive-form");
  const input = element("input");
  input.type = "date";
  input.min = "2026-11-12";
  input.max = puzzle?.day || new Date().toISOString().slice(0, 10);
  input.value = input.max;
  input.required = true;
  input.setAttribute("aria-label", "Puzzle date");
  const button = element("button", "Explore this day ↗", "primary");
  button.type = "submit";
  form.append(input, button);
  form.onsubmit = (event) => {
    event.preventDefault();
    $("modal").close();
    start("daily", input.value);
  };
  content.append(form);
};

function playSound(tier) {
  if (!soundEnabled || !audioContext) return;
  const notes =
    tier === 0
      ? [220, 196]
      : tier === 4
        ? [523.25, 659.25, 783.99, 1046.5]
        : [329.63, 440, 659.25];
  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const time = audioContext.currentTime + index * 0.105;
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.05, time + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.75);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(time);
    oscillator.stop(time + 0.8);
  });
}

$("sound").onclick = async () => {
  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
    await audioContext.resume();
    soundEnabled = !soundEnabled;
    $("sound").setAttribute("aria-pressed", String(soundEnabled));
    $("sound").setAttribute(
      "aria-label",
      soundEnabled ? "Disable sound" : "Enable sound",
    );
    $("sound-state").textContent = soundEnabled ? "on" : "off";
    if (soundEnabled) playSound(1);
  } catch {
    setError("Sound is unavailable in this browser.");
  }
};

function rememberGame() {
  if (game.mode === "daily") {
    const sessions = storage.get("sessions", {});
    sessions[game.day] = game.id;
    storage.set("sessions", sessions);
  } else storage.set("practice", game.id);
}

function updateDailyButton() {
  const session = storage.get("sessions", {})[puzzle?.day];
  const complete = storage.get("history", {})[puzzle?.day];
  const label = session
    ? complete
      ? "View your collection"
      : "Continue discovering"
    : "Make a discovery";
  $("start").replaceChildren(element("span", label), element("span", "↗"));
}

function acceptState(data) {
  game = data;
  serverOffset = game.serverNow - Date.now();
  rememberGame();
}

async function start(mode = "daily", day = puzzle?.day) {
  if (busy) return;
  setBusy(true);
  setError();
  try {
    const savedId = mode === "daily" ? storage.get("sessions", {})[day] : null;
    let data;
    if (savedId) {
      try {
        data = await api("resume", { id: savedId });
      } catch (error) {
        if (!error.message.includes("Game not found")) throw error;
        data = await api("start", { mode, day });
      }
    } else data = await api("start", { mode, day });
    acceptState(data);
    if (game.awaitingStart && game.answers.length === 0)
      acceptState(await api("next", { id: game.id, round: game.round }));
    render();
    window.scrollTo({ top: 0, behavior: "instant" });
  } catch (error) {
    setError(error.message);
  } finally {
    setBusy(false);
  }
}
$("start").onclick = () => start();
$("practice").onclick = $("play-again").onclick = () => start("practice");

function home() {
  show("home");
  updateScene(4);
  updateDailyButton();
  window.scrollTo({ top: 0, behavior: "instant" });
}
$("back-home").onclick = $("result-home").onclick = home;

function render() {
  clearInterval(timer);
  if (game.done) return renderResults();
  if (game.awaitingStart) return renderReveal();
  show("play");
  const lastTier = game.answers.at(-1)?.tier || 1;
  updateScene(lastTier);
  $("mode-label").textContent =
    game.mode === "daily" ? "DAILY DISCOVERY" : "UNLIMITED EXPLORATION";
  $("category").textContent = game.question.category;
  $("question-number").textContent = `${game.round + 1} OF 5`;
  $("question").textContent = game.question.prompt;
  $("live-score").textContent = score().toLocaleString();
  $("answer").value = "";
  $("submit").textContent = "↵";
  $("progress").replaceChildren(
    ...Array.from({ length: 5 }, (_, index) =>
      element(
        "span",
        undefined,
        index < game.round ? "complete" : index === game.round ? "active" : "",
      ),
    ),
  );
  renderTray("play-collection");
  tick();
  timer = setInterval(tick, 150);
  if (!matchMedia("(pointer: coarse)").matches)
    $("answer").focus({ preventScroll: true });
}

function tick() {
  if (!game || game.done || game.awaitingStart || displayView !== "play")
    return;
  const remaining = game.deadline - (Date.now() + serverOffset);
  const seconds = Math.max(0, Math.ceil(remaining / 1000));
  $("timer").textContent = seconds;
  $("timer").parentElement.classList.toggle("urgent", seconds <= 8);
  $("time-fill").style.transform =
    `scaleX(${Math.max(0, Math.min(1, remaining / 30000))})`;
  if (remaining <= 0 && !busy) submit("");
}

async function submit(answer) {
  if (busy || !game || game.done || game.awaitingStart) return;
  setBusy(true);
  setError();
  try {
    acceptState(
      await api("answer", { id: game.id, round: game.round, answer }),
    );
    if (game.awaitingStart || game.done) renderReveal();
    else render();
  } catch (error) {
    clearInterval(timer);
    setError(error.message + " Submit again to sync your discovery.");
    $("submit").textContent = "↻";
  } finally {
    setBusy(false);
  }
}
$("answer-form").onsubmit = (event) => {
  event.preventDefault();
  if (!$("answer").value.trim() && game.deadline > Date.now() + serverOffset)
    return $("answer").focus();
  submit($("answer").value.trim());
};
$("skip").onclick = () => submit("");

function renderReveal() {
  show("reveal");
  const answer = game.answers.at(-1);
  const tier = answer?.tier || 0;
  $("reveal").dataset.tier = tier;
  updateScene(tier, true);
  playSound(tier);
  $("reveal-kicker").textContent = answer?.correct
    ? `${specimenNames[tier].toUpperCase()} ADDED TO YOUR COLLECTION`
    : "EVERY DISCOVERY STARTS WITH CURIOSITY";
  $("reveal-tier").textContent = tier
    ? rarityNames[tier] + "."
    : answer?.timed_out
      ? "Time slipped by."
      : "Not this time.";
  $("reveal-answer").textContent = answer?.label
    ? `“${answer.label}”`
    : answer?.timed_out
      ? "There’s always another question."
      : "An answer is waiting to be found.";
  const notes = [
    "Keep that curiosity. Your next discovery is waiting.",
    "A familiar thought, beautifully formed.",
    "You found something a little less expected.",
    "An unexpected answer. A remarkable find.",
    "A thought few would reach for. Worth collecting.",
  ];
  $("reveal-note").textContent = notes[tier];
  $("reveal-points").textContent = "+" + (answer?.points || 0).toLocaleString();
  $("reveal-progress").textContent = `${game.round} OF 5 DISCOVERIES`;
  $("next").replaceChildren(
    element("span", game.done ? "See your collection" : "Keep discovering"),
    element("span", "→"),
  );
  renderTray("reveal-collection");
  window.scrollTo({ top: 0, behavior: "instant" });
}

$("next").onclick = async () => {
  if (busy || !game) return;
  if (game.done) {
    renderResults();
    window.scrollTo({ top: 0, behavior: "instant" });
    return;
  }
  setBusy(true);
  try {
    acceptState(await api("next", { id: game.id, round: game.round }));
    render();
    window.scrollTo({ top: 0, behavior: "instant" });
  } catch (error) {
    setError(error.message);
  } finally {
    setBusy(false);
  }
};

function renderResults() {
  show("result");
  updateScene(4);
  const total = score();
  $("result-heading").replaceChildren(
    document.createTextNode("A mind of "),
    element("em", "your own."),
  );
  $("result-subtitle").textContent =
    `${game.mode === "daily" ? "Daily discovery · " + game.day : "Unlimited exploration"} · ${game.answers.filter((answer) => answer.correct).length} of 5 correct`;
  $("final-score").textContent = total.toLocaleString();
  const highestTier = Math.max(...game.answers.map((answer) => answer.tier));
  $("rarest-find").textContent = rarityNames[highestTier];
  $("final-collection").replaceChildren(
    ...game.answers.map((answer) => {
      const card = element("div", undefined, "final-specimen");
      card.dataset.tier = answer.tier;
      card.append(
        miniCrystal(answer.tier),
        element("span", specimenNames[answer.tier]),
        element("strong", "+" + answer.points),
      );
      card.setAttribute(
        "aria-label",
        `${answer.label || "No answer"}, ${rarityNames[answer.tier]}, ${answer.points} points`,
      );
      return card;
    }),
  );
  $("result-rows").replaceChildren(
    ...game.answers.map((answer, index) => {
      const row = element("div", undefined, "result-row");
      const text = element(
        "div",
        answer.correct
          ? answer.label
          : answer.timed_out
            ? "Time’s up"
            : answer.label || "Skipped",
      );
      text.append(
        element(
          "small",
          `${game.review[index].category} · ${rarityNames[answer.tier].toUpperCase()}`,
        ),
      );
      row.append(
        element("span", String(index + 1).padStart(2, "0"), "round-n"),
        text,
        element("span", "+" + answer.points, "points"),
      );
      return row;
    }),
  );
  $("review-content").replaceChildren(
    ...game.review.map((question) => {
      const section = element("div");
      const answers = question.answers
        .map(
          (answer) =>
            `${answer.label} (${[0, 100, 250, 500, 1000][answer.tier]})`,
        )
        .join(" · ");
      section.append(element("h3", question.prompt), element("p", answers));
      return section;
    }),
  );
  $("share-note").textContent = "";
  if (game.mode === "daily") {
    const history = storage.get("history", {});
    history[game.day] = {
      score: total,
      day: game.day,
      tiers: game.answers.map((answer) => answer.tier),
    };
    storage.set("history", history);
  }
  loadLeaderboard(game.day);
}

async function loadLeaderboard(day) {
  $("board").textContent = "Finding curious company…";
  try {
    const data = await api("leaderboard?day=" + encodeURIComponent(day));
    $("board").replaceChildren(
      ...data.entries.map((entry, index) => {
        const row = element("div", undefined, "board-row");
        row.append(
          element("span", String(index + 1).padStart(2, "0")),
          element("span", entry.name),
          element("strong", entry.score.toLocaleString() + " pts"),
        );
        return row;
      }),
    );
    if (!data.entries.length)
      $("board").textContent =
        "The first daily collection is still waiting to be discovered.";
  } catch {
    $("board").textContent =
      "The leaderboard is unavailable. Your collection is saved.";
  }
}

$("share").onclick = async () => {
  if (!game) return;
  const symbols = ["⬛", "⬜", "🟩", "🟪", "🟨"];
  const text = `RARE · ${game.mode === "daily" ? game.day : "Unlimited"}\n${game.answers.map((answer) => symbols[answer.tier]).join("")}\n${score().toLocaleString()} / 5,000 points\nMy rarest find: ${rarityNames[Math.max(...game.answers.map((answer) => answer.tier))]}\nWhat will you discover?\n${location.origin}`;
  try {
    await navigator.clipboard.writeText(text);
    $("share-note").textContent = "Copied. Share a little curiosity.";
  } catch {
    $("share-note").textContent = text;
  }
};

async function initialize() {
  try {
    puzzle = await api("puzzle");
    const date = new Date(puzzle.day + "T12:00:00Z").toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric", timeZone: "UTC" },
    );
    $("puzzle-label").textContent =
      `DAILY DISCOVERY ${String(puzzle.number).padStart(3, "0")} / ${date.toUpperCase()}`;
    $("bank-label").textContent =
      `${puzzle.bankSize} prompts to spark your curiosity.`;
    const remaining = Math.max(0, puzzle.reset - Date.now());
    $("reset-label").textContent =
      `Your next discovery in ${Math.floor(remaining / 3600000)}h ${Math.floor((remaining % 3600000) / 60000)}m`;
    updateDailyButton();
  } catch (error) {
    setError(error.message);
  }
}

// The visual layer loads separately so gameplay remains usable on low-end devices.
import("/crystal.js")
  .then((module) => {
    scene = module;
    scene.setSpecimen(sceneState);
  })
  .catch((error) => {
    console.info("Using the simplified specimen view.", error.message);
    document.querySelector(".stage-caption").textContent =
      "THE EXCEPTIONAL COLLECTION";
  });
initialize();
