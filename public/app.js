import {
  request as api,
  native,
  publicOrigin,
  haptic,
  shareFlight,
} from "./platform.js";
const $ = (id) => document.getElementById(id);
const rarityNames = ["No lift", "Common", "Uncommon", "Rare", "Exceptional"];
let game = null;
let puzzle = null;
let busy = false;
let serverOffset = 0;
let timer = null;
let scene = null;
let sceneState = { mode: "home", altitude: 0, gain: 0 };
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

function setBusy(value) {
  busy = value;
  for (const id of [
    "start",
    "practice",
    "offline-practice",
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

function flightHistory() {
  return [
    ...Object.values(storage.get("history", {})),
    ...(native ? storage.get("offline-history", []) : []),
  ];
}

function updateFlight(celebrate = false) {
  sceneState = {
    mode: displayView,
    altitude: displayView === "home" ? 0 : score(),
    gain: celebrate ? game?.answers.at(-1)?.points || 0 : 0,
  };
  document.body.dataset.tier = game?.answers.at(-1)?.tier || 0;
  $("best-altitude").textContent = Math.max(
    0,
    ...flightHistory().map((item) => item.score),
  ).toLocaleString();
  $("progress").replaceChildren(
    ...Array.from({ length: 5 }, (_, index) => {
      const answer = displayView === "home" ? null : game?.answers[index];
      const segment = element("span");
      if (answer) {
        segment.className = "complete";
        segment.dataset.tier = answer.tier;
      } else if (
        ["play", "launch"].includes(displayView) &&
        index === game?.round
      )
        segment.className = "active";
      return segment;
    }),
  );
  $("question-number").textContent =
    displayView === "home"
      ? "5 DAILY PROMPTS"
      : `STAGE ${Math.min(5, game.round + (displayView === "play" || displayView === "launch" ? 1 : 0))} OF 5`;
  if (scene) scene.setFlight(sceneState);
  else $("altitude").textContent = sceneState.altitude.toLocaleString();
}

function show(view) {
  displayView = view;
  for (const id of ["home", "launch", "play", "reveal", "result"])
    $(id).hidden = id !== view;
  document.body.dataset.view = view;
  if (view !== "play") clearInterval(timer);
  setError();
}

function flightMarker(tier) {
  const marker = element("i", tier ? "↑" : "–", "flight-marker");
  marker.dataset.tier = tier;
  marker.setAttribute("aria-hidden", "true");
  return marker;
}

function renderTray(id) {
  const slots = Array.from({ length: 5 }, (_, index) => {
    const answer = game.answers[index];
    const slot = element("div", undefined, "flight-stop");
    if (answer) {
      slot.append(
        flightMarker(answer.tier),
        element("small", "+" + answer.points + " m"),
      );
      slot.setAttribute(
        "aria-label",
        `${rarityNames[answer.tier]}, ${answer.points} meters`,
      );
    } else {
      slot.classList.add("empty");
      if (index === game.round) slot.classList.add("pending");
      slot.setAttribute("aria-label", "Upcoming flight stage");
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
  const content = openDialog("A little knowledge. A lot of lift.", [
    "Take a five-question flight. You have 30 seconds to type one correct answer per question. Less obvious answers carry your balloon higher.",
    "Drag your balloon to surf the breeze. With the balloon focused, use arrow keys to steer and Space to catch a gust. Rare answers summon paper-plane companions and stronger updrafts.",
    "Common answers lift you 100 meters, uncommon answers 250, rare answers 500 and exceptional answers 1,000. A skipped, incorrect or expired answer adds zero. Your final altitude is the sum of all five stages, up to 5,000 meters.",
    "Enjoy the view after each answer. The next question stays hidden and its clock starts when you press Climb higher. Once a question is active, leaving the page or opening a dialog does not pause the clock.",
    "Daily flights reset at midnight UTC with one attempt per browser. Practice creates fresh sets. Capitalization, spacing, punctuation and accepted aliases are handled automatically. Answer rarity uses fixed editorial tiers.",
  ]);
  const tiers = element("div", undefined, "tier-list");
  [
    "Common · +100 m",
    "Uncommon · +250 m",
    "Rare · +500 m",
    "Exceptional · +1,000 m",
  ].forEach((text) => tiers.append(element("span", text)));
  content.append(tiers);
};

$("about").onclick = () => {
  const content = openDialog("Take your curiosity somewhere new.", [
    "RARE is an independent daily trivia game. Unexpected answers power a hot-air-balloon journey through an illustrated sky. It is inspired by rare-answer games, including Krillion.",
    `The current bank has ${puzzle?.bankSize || 400} curated English prompts. Online answers and scores are checked on the server. Offline practice is scored on your device. One point represents one game meter. Altitude is a visual game reward and answer rarity is an editorial rating.`,
    "An anonymous cookie keeps your daily flight. Game results and answers are stored for scoring and the leaderboard. Browser local storage keeps your flight history. Clearing browser data removes your local identity.",
    "The sky and balloon were created with AI image generation. Sound starts off. Reduced-motion preferences disable balloon and cloud animation. Mobile apps include native sharing, haptics and offline practice.",
  ]);
  const links = element("p");
  for (const [label, path] of [
    ["Privacy policy", "/privacy/"],
    ["Support", "/support/"],
    ...(native ? [["Third-party notices", "/licenses/"]] : []),
  ]) {
    const link = element("a", label);
    link.href = path;
    links.append(link, document.createTextNode(" · "));
  }
  content.append(links);
};

$("stats").onclick = () => {
  const history = flightHistory();
  const content = openDialog("Your flight log.", [
    native
      ? "Your daily flights and offline practice, saved on this device."
      : "Your completed daily flights, saved on this browser.",
  ]);
  const grid = element("div", undefined, "stats-grid");
  const best = Math.max(0, ...history.map((item) => item.score));
  const average = history.length
    ? Math.round(
        history.reduce((sum, item) => sum + item.score, 0) / history.length,
      )
    : 0;
  for (const [label, value] of [
    ["FLIGHTS", history.length],
    ["AVERAGE m", average],
    ["BEST m", best],
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
  for (const flight of recent) {
    const row = element("div", undefined, "history-flight");
    const label = element("div", flight.day);
    label.append(element("small", flight.score.toLocaleString() + " m"));
    row.append(label);
    if (flight.tiers) {
      const stages = element("div", undefined, "history-stages");
      flight.tiers.forEach((tier) => stages.append(flightMarker(tier)));
      row.append(stages);
    }
    content.append(row);
  }
};

$("archive").onclick = () => {
  const content = openDialog("A flight worth taking.", [
    "Choose a daily flight from November 12, 2026 onwards. Each date has one attempt per browser.",
  ]);
  const form = element("form", undefined, "archive-form");
  const input = element("input");
  input.type = "date";
  input.min = "2026-11-12";
  input.max = puzzle?.day || new Date().toISOString().slice(0, 10);
  input.value = input.max;
  input.required = true;
  input.setAttribute("aria-label", "Puzzle date");
  const button = element("button", "Take this flight ↗", "primary");
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
      ? "View your flight"
      : "Resume your flight"
    : "Take flight";
  $("start").replaceChildren(
    element("span", label),
    element("span", "↑", "button-arrow"),
  );
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
    if (game.awaitingStart && game.answers.length === 0) await launchRound();
    render();
    window.scrollTo({ top: 0, behavior: "instant" });
  } catch (error) {
    if (displayView === "launch") home();
    setError(error.message);
  } finally {
    setBusy(false);
  }
}
$("start").onclick = () => start();
$("practice").onclick = () => start("practice");
$("offline-practice").hidden = !native;
$("offline-practice").onclick = () => start("offline");
$("play-again").onclick = () =>
  start(game?.mode === "offline" ? "offline" : "practice");

function home() {
  show("home");
  updateFlight();
  updateDailyButton();
  window.scrollTo({ top: 0, behavior: "instant" });
}
$("back-home").onclick = $("result-home").onclick = home;

function render() {
  clearInterval(timer);
  if (game.done) return renderResults();
  if (game.awaitingStart) return renderReveal();
  show("play");
  updateFlight();
  $("mode-label").textContent =
    game.mode === "daily"
      ? "DAILY FLIGHT"
      : game.mode === "offline"
        ? "OFFLINE PRACTICE"
        : "PRACTICE FLIGHT";
  $("category").textContent = game.question.category;
  $("question").textContent = game.question.prompt;
  $("live-score").textContent = score().toLocaleString();
  $("answer").value = "";
  $("submit").replaceChildren(element("span", "Fly"), element("span", "↑"));
  renderTray("play-route");
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
    setError(error.message + " Submit again to sync your flight.");
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
  $("rarity-medal").textContent = ["–", "↑", "↑", "✧", "✦"][tier];
  updateFlight(true);
  playSound(tier);
  haptic(tier);
  $("reveal-kicker").textContent = answer?.correct
    ? "YOU CAUGHT AN UPDRAFT"
    : "STILL A GOOD DAY TO FLY";
  $("reveal-tier").textContent = tier
    ? rarityNames[tier]
    : answer?.timed_out
      ? "A passing breeze."
      : "Steady as you go.";
  $("reveal-answer").textContent = answer?.label
    ? `“${answer.label}”`
    : answer?.timed_out
      ? "The clock caught up with you."
      : "Another horizon is waiting.";
  const notes = [
    "No height gained this time. Your journey carries on.",
    "A familiar answer. A little closer to the clouds.",
    "A fresh thought. A lovely bit of lift.",
    "Now that’s thinking above the clouds.",
    "An extraordinary answer. Enjoy the view up here.",
  ];
  $("reveal-note").textContent = notes[tier];
  $("reveal-points").textContent = "+" + (answer?.points || 0).toLocaleString();
  $("reveal-progress").textContent = `STAGE ${game.round} OF 5`;
  $("reveal-next-note").textContent = game.done
    ? "Your flight is complete."
    : "The next question waits for you.";
  $("next").replaceChildren(
    element("span", game.done ? "View flight report" : "Climb higher"),
    element("span", "↑", "button-arrow"),
  );
  renderTray("reveal-route");
  window.scrollTo({ top: 0, behavior: "instant" });
}

async function launchRound() {
  show("launch");
  updateFlight();
  for (const count of [3, 2, 1]) {
    $("launch-count").textContent = count;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  $("launch-count").textContent = "↑";
  acceptState(await api("next", { id: game.id, round: game.round }));
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
    await launchRound();
    render();
    window.scrollTo({ top: 0, behavior: "instant" });
  } catch (error) {
    renderReveal();
    setError(error.message);
  } finally {
    setBusy(false);
  }
};

function renderResults() {
  show("result");
  updateFlight();
  const total = score();
  $("result-heading").replaceChildren(
    document.createTextNode(total >= 2500 ? "A head for " : "Curiosity takes "),
    element("span", total >= 2500 ? "heights." : "you places."),
  );
  $("result-subtitle").textContent =
    `${game.mode === "daily" ? "Daily flight · " + game.day : game.mode === "offline" ? "Offline practice" : "Practice flight"} · ${game.answers.filter((answer) => answer.correct).length} of 5 correct`;
  $("final-score").textContent = total.toLocaleString();
  const highestTier = Math.max(...game.answers.map((answer) => answer.tier));
  $("rarest-find").textContent = rarityNames[highestTier];
  $("final-route").replaceChildren(
    ...game.answers.map((answer) => {
      const card = element("div", undefined, "final-stop");
      card.dataset.tier = answer.tier;
      card.append(
        flightMarker(answer.tier),
        element("span", rarityNames[answer.tier]),
        element("strong", "+" + answer.points + " m"),
      );
      card.setAttribute(
        "aria-label",
        `${answer.label || "No answer"}, ${rarityNames[answer.tier]}, ${answer.points} meters`,
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
        element("span", "+" + answer.points + " m", "points"),
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
            `${answer.label} (+${[0, 100, 250, 500, 1000][answer.tier]} m)`,
        )
        .join(" · ");
      section.append(element("h3", question.prompt), element("p", answers));
      return section;
    }),
  );
  $("share-note").textContent = "";
  if (game.mode === "offline") {
    const offlineHistory = storage.get("offline-history", []);
    offlineHistory.unshift({
      score: total,
      day: game.day,
      tiers: game.answers.map((answer) => answer.tier),
      id: game.id,
    });
    storage.set(
      "offline-history",
      offlineHistory
        .filter(
          (entry, index, all) =>
            all.findIndex((item) => item.id === entry.id) === index,
        )
        .slice(0, 30),
    );
  }
  if (game.mode === "daily") {
    const history = storage.get("history", {});
    history[game.day] = {
      score: total,
      day: game.day,
      tiers: game.answers.map((answer) => answer.tier),
    };
    storage.set("history", history);
  }
  if (game.mode === "offline") {
    $("board").textContent =
      "Offline practice is saved on this device and has its own flight history.";
  } else loadLeaderboard(game.day);
}

async function loadLeaderboard(day) {
  $("board").textContent = "Finding fellow flyers…";
  try {
    const data = await api("leaderboard?day=" + encodeURIComponent(day));
    $("board").replaceChildren(
      ...data.entries.map((entry, index) => {
        const row = element("div", undefined, "board-row");
        row.append(
          element("span", String(index + 1).padStart(2, "0")),
          element("span", entry.name),
          element("strong", entry.score.toLocaleString() + " m"),
        );
        return row;
      }),
    );
    if (!data.entries.length)
      $("board").textContent =
        "The sky is open. Be the first to complete today’s daily flight.";
  } catch {
    $("board").textContent =
      "The leaderboard is unavailable. Your completed daily flight is saved in this browser.";
  }
}

$("share").onclick = async () => {
  if (!game) return;
  const symbols = ["⬛", "⬜", "🟩", "🟪", "🟨"];
  const text = `RARE FLIGHT ↗ · ${game.mode === "daily" ? game.day : game.mode === "offline" ? "Offline practice" : "Practice"}\n${game.answers.map((answer) => symbols[answer.tier]).join("")}\n${score().toLocaleString()} m above the everyday\nMy best updraft: ${rarityNames[Math.max(...game.answers.map((answer) => answer.tier))]}\nHow high can you go?\n${native ? publicOrigin : location.origin}`;
  try {
    const outcome = await shareFlight(text);
    $("share-note").textContent = outcome === "cancelled"
      ? ""
      : outcome === "shared"
        ? "Flight shared. A little sky for a friend."
        : "Flight copied. Send a little sky to a friend.";
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
      `DAILY FLIGHT ${String(puzzle.number).padStart(3, "0")} · ${date.toUpperCase()}`;
    $("bank-label").textContent =
      `${puzzle.bankSize} questions. A new horizon every day.`;
    const remaining = Math.max(0, puzzle.reset - Date.now());
    $("reset-label").textContent =
      `Next takeoff in ${Math.floor(remaining / 3600000)}h ${Math.floor((remaining % 3600000) / 60000)}m`;
    updateDailyButton();
    updateFlight();
  } catch (error) {
    if (native) {
      $("puzzle-label").textContent = "OFFLINE PRACTICE IS READY";
      $("reset-label").textContent = "Reconnect to take today’s daily flight.";
    } else setError(error.message);
  }
}

addEventListener("rare:resume", () => {
  if (displayView === "play") tick();
});
addEventListener("rare:network", (event) => {
  if (event.detail.connected && displayView === "home") initialize();
});

// Flight visuals load independently of the timed game and scoring requests.
import("/sky.js")
  .then((module) => {
    scene = module;
    scene.setFlight(sceneState);
  })
  .catch((error) => {
    console.info("Using the still-sky view.", error.message);
  });
initialize();
