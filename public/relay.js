import { t, language } from "./i18n.js";
import { companions, selectedCompanion } from "./companions.js";
import { localizedPath } from "./locales.js";

export function initRelay({
  request,
  shareFlight,
  publicOrigin,
  onFlight,
  passport,
}) {
  const entry = document.getElementById("relay-entry");
  const dialog = document.createElement("dialog");
  dialog.id = "relay-dialog";
  dialog.setAttribute("aria-labelledby", "relay-title");
  document.body.append(dialog);
  let room = null;
  let token = "";
  let busy = false;
  let poll;
  let clock;
  let serverOffset = 0;
  let rendered = "";
  let paintedTurn = null;
  let paintedCode = null;
  let visualScore = null;
  let feedback = "";
  let connectionFailed = false;
  let setupCode = new URL(location.href).searchParams.get("room") || "";
  let tableSize = 2;
  let isPublic = false;
  let listing = false;
  let savedName = "";
  let saved = null;
  try {
    savedName = sessionStorage.getItem("rare:relay:name") || "";
    saved = JSON.parse(sessionStorage.getItem("rare:relay:last") || "null");
  } catch {}

  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  function button(label, handler, className = "secondary") {
    const element = node("button", t(label), className);
    element.type = "button";
    element.onclick = handler;
    return element;
  }
  function saveSeat() {
    saved = { code: room.code, token };
    try {
      sessionStorage.setItem("rare:relay:last", JSON.stringify(saved));
      sessionStorage.setItem("rare:relay:name", savedName);
    } catch {}
  }
  function clearSeat() {
    saved = null;
    room = null;
    token = "";
    try {
      sessionStorage.removeItem("rare:relay:last");
    } catch {}
  }
  function message(text) {
    feedback = text;
    const output = dialog.querySelector(".relay-feedback");
    if (output) output.textContent = t(feedback);
  }
  function showFailure(error) {
    if (
      [
        "This room has expired or could not be found.",
        "Rejoin this room to take a seat.",
        "Open the room again to restore your seat.",
      ].includes(error.message)
    ) {
      clearSeat();
      rendered = "";
      render();
    }
    message(error.message);
  }
  function stopPolling() {
    clearTimeout(poll);
    clearInterval(clock);
  }
  function schedulePoll(delay = 2000) {
    clearTimeout(poll);
    if (dialog.open && room && room.status !== "finished" && !document.hidden) {
      poll = setTimeout(refresh, delay);
    }
  }
  function accept(next) {
    if (room?.code === next.code && next.turn < room.turn) return;
    if (connectionFailed) {
      feedback = "";
      connectionFailed = false;
    }
    if (room?.turn !== next.turn) feedback = "";
    if (next.seatToken) {
      token = next.seatToken;
      delete next.seatToken;
    }
    room = next;
    serverOffset = next.serverNow - Date.now();
    saveSeat();
    if (next.feedback) feedback = next.feedback;
    render();
    schedulePoll();
  }
  async function refresh() {
    if (busy || !dialog.open || !room) return schedulePoll();
    try {
      accept(await request("relay/state", { code: room.code, token }));
    } catch (error) {
      connectionFailed = true;
      showFailure(error);
      schedulePoll(5000);
    }
  }
  async function act(action, data = {}) {
    if (busy) return;
    busy = true;
    message("");
    updateControls();
    try {
      const result = await request("relay/" + action, {
        code: room?.code,
        token,
        turn: room?.turn,
        buddy: selectedCompanion().id,
        ...data,
      });
      if (action === "leave") {
        clearSeat();
        rendered = "";
        render();
      } else accept(result);
    } catch (error) {
      showFailure(error);
    } finally {
      busy = false;
      updateControls();
      schedulePoll();
    }
  }
  function updateControls() {
    const selfTurn = room?.status === "playing" && room.self === room.current;
    for (const control of dialog.querySelectorAll(
      "button[data-action], input",
    )) {
      control.disabled =
        busy || (control.dataset.answer === "true" && !selfTurn);
    }
    const start = dialog.querySelector("[data-start]");
    if (start)
      start.disabled =
        busy || room.players.filter((player) => !player.left).length < 2;
  }
  function tick() {
    const value = dialog.querySelector("[data-relay-clock]");
    if (!value || !room?.deadline) return;
    const seconds = Math.max(
      0,
      Math.ceil((room.deadline - Date.now() - serverOffset) / 1000),
    );
    value.textContent = String(seconds);
    value.parentElement.classList.toggle("urgent", seconds <= 8);
  }
  function shell() {
    const header = node("header", undefined, "relay-header");
    const title = node("div");
    title.append(
      node("span", t("PLAY WITH FRIENDS"), "eyebrow"),
      node("h2", t("Sky Relay")),
    );
    title.querySelector("h2").id = "relay-title";
    const close = button("Close dialog", () => dialog.close(), "relay-close");
    close.textContent = "×";
    close.setAttribute("aria-label", t("Close dialog"));
    header.append(title, close);
    return header;
  }
  function setup() {
    const intro = node(
      "p",
      t(
        "Meet in the flight deck. Find a table, invite your crew or fly for a rating.",
      ),
      "relay-intro",
    );
    const form = node("form", undefined, "relay-setup");
    const nameLabel = node("label", t("Pilot name"));
    const name = node("input");
    name.id = "relay-name";
    name.maxLength = 24;
    name.required = true;
    name.autocomplete = "nickname";
    name.value = savedName || passport.account()?.name || "";
    name.dir = "auto";
    nameLabel.append(name);
    const codeLabel = node("label", t("Room code"));
    const code = node("input");
    code.id = "relay-code";
    code.maxLength = 6;
    code.autocomplete = "off";
    code.autocapitalize = "characters";
    code.dir = "ltr";
    code.placeholder = "ABC234";
    code.value = setupCode;
    codeLabel.append(code);
    const actions = node("div", undefined, "relay-actions");
    const create = button(
      "Create a room",
      () => {
        if (!name.reportValidity()) return;
        savedName = name.value.trim();
        token = crypto.randomUUID();
        act("create", {
          name: savedName,
          capacity: tableSize,
          visibility: isPublic ? "public" : "private",
        });
      },
      "primary",
    );
    create.dataset.action = "create";
    const join = button("Join room", () => form.requestSubmit());
    join.dataset.action = "join";
    actions.append(create, join);
    form.onsubmit = (event) => {
      event.preventDefault();
      if (!name.reportValidity()) return;
      setupCode = code.value.trim().toUpperCase();
      savedName = name.value.trim();
      token = saved?.code === setupCode ? saved.token : crypto.randomUUID();
      act("join", { code: setupCode, name: savedName });
    };
    form.append(nameLabel, codeLabel, actions);
    const sizes = node("div", undefined, "relay-table-sizes");
    sizes.setAttribute("role", "group");
    sizes.setAttribute("aria-label", t("Table size"));
    for (const size of [2, 3, 6, 10]) {
      const choice = button(String(size), () => {
        tableSize = size;
        for (const other of sizes.children)
          other.setAttribute("aria-pressed", String(other === choice));
      });
      choice.setAttribute("aria-pressed", String(size === tableSize));
      sizes.append(choice);
    }
    const visibility = button(isPublic ? "Public room" : "Private room", () => {
      isPublic = !isPublic;
      visibility.textContent = t(isPublic ? "Public room" : "Private room");
    });
    form.prepend(sizes, visibility);
    const matchmaking = node("div", undefined, "relay-match-actions");
    const match = (rated) => {
      if (!name.reportValidity()) return;
      if (rated && !passport.account()) {
        dialog.close();
        passport.open();
        return;
      }
      savedName = name.value.trim();
      token = crypto.randomUUID();
      act("match", { name: savedName, capacity: tableSize, rated });
    };
    matchmaking.append(
      button("Quick play", () => match(false), "primary"),
      button("Rated flight", () => match(true)),
      button("Browse public rooms", () => loadRooms(name.value)),
    );
    dialog.append(intro, matchmaking, form, rules());
    const publicList = node("section", undefined, "relay-public-list");
    publicList.append(
      node(
        "p",
        t(
          "Public rooms appear here. Your table may be quiet while the community grows.",
        ),
      ),
    );
    dialog.append(publicList);
    if (passport.account())
      dialog.append(button("Resume rated flight", () => act("recover")));
    if (saved) {
      const resume = button("Resume your room", async () => {
        token = saved.token;
        try {
          accept(await request("relay/state", { code: saved.code, token }));
        } catch (error) {
          showFailure(error);
        }
      });
      dialog.append(resume);
    }
  }
  async function loadRooms(name) {
    if (listing) return;
    listing = true;
    const output = dialog.querySelector(".relay-public-list");
    try {
      const result = await request("relay/list", {});
      output.replaceChildren();
      if (!result.rooms.length)
        output.append(
          node(
            "p",
            t("No open rooms yet. Create a public room or invite a friend."),
          ),
        );
      for (const item of result.rooms) {
        const join = button("Join room", () => {
          const field = dialog.querySelector("#relay-name");
          if (!field.reportValidity()) return;
          savedName = field.value.trim();
          token = crypto.randomUUID();
          act("join", { code: item.code, name: savedName });
        });
        const row = node("article", undefined, "relay-room-row");
        row.append(
          node("strong", item.name),
          node("span", item.players + "/" + item.capacity),
          join,
        );
        output.append(row);
      }
    } catch (error) {
      message(error.message);
    } finally {
      listing = false;
    }
  }
  function rules() {
    const details = node("details", undefined, "relay-rules");
    details.append(
      node("summary", t("How to play")),
      node(
        "p",
        t(
          "Each pilot has three hearts. An unused correct answer earns altitude and passes the turn. Wrong or repeated answers keep the clock running.",
        ),
      ),
      node(
        "p",
        t(
          "The room shares 30 seconds, with at least 8 seconds after a pass. A timeout costs one heart and starts the next stage. Clearing every answer also advances the stage.",
        ),
      ),
      node(
        "p",
        t(
          "Private flights have five stages; ten-seat, quick and rated flights have up to 30. One remaining pilot ends the flight early.",
        ),
      ),
      node(
        "p",
        t(
          "Rare and exceptional answers charge an extra heart: 1,500 rare meters restores one, up to five hearts. More hearts wins; altitude breaks ties.",
        ),
      ),
      node(
        "p",
        t(
          "Quick and rated tables start when full. Rated flights need a passport. Leaving an active rated flight counts in the result.",
        ),
      ),
      node(
        "p",
        t("Rooms expire after 24 hours. Keep this tab to resume your seat."),
      ),
    );
    return details;
  }
  function fleet() {
    const field = node("div", undefined, "relay-fleet");
    if (room.status === "playing" && room.players.length > 4)
      field.classList.add("compact");
    field.style.setProperty(
      "--pilots",
      String(Math.min(3, room.players.length)),
    );
    field.setAttribute("aria-label", t("Pilots in this room"));
    for (const player of room.players) {
      const card = node("article", undefined, "relay-pilot");
      if (player.id === room.current) card.classList.add("active");
      if (player.left || player.hearts === 0) card.classList.add("grounded");
      const sky = node("div", undefined, "relay-pilot-sky");
      const balloon = node("img");
      balloon.src = "/art/balloon.webp";
      balloon.alt = "";
      balloon.style.bottom = Math.min(48, player.score / 100) + "px";
      sky.append(balloon);
      const companion =
        companions.find((item) => item.id === player.buddy) || companions[0];
      const buddy = node("img", undefined, "relay-buddy-image");
      buddy.src = "/art/companions/" + companion.id + ".svg";
      buddy.alt = t(companion.name);
      sky.append(buddy);
      const name = node("strong", player.name);
      name.dir = "auto";
      const hearts = node(
        "span",
        "♥".repeat(player.hearts) + "♡".repeat(Math.max(0, 3 - player.hearts)),
        "relay-hearts",
      );
      hearts.setAttribute("aria-label", t`${player.hearts} hearts`);
      card.append(
        sky,
        name,
        hearts,
        node(
          "span",
          player.score.toLocaleString(language()) + " m",
          "relay-pilot-score",
        ),
      );
      card.append(node("small", t`Heart charge ${player.charge || 0}/1,500`));
      if (player.id === room.self) card.append(node("small", t("You")));
      else
        card.append(
          button(
            "Report pilot",
            () => {
              dialog.close();
              passport.report(
                player.account || player.identity || player.id,
                room.code,
              );
            },
            "relay-report",
          ),
        );
      if (room.status === "finished")
        card.append(node("b", t`Rank ${player.rank}`, "relay-rank"));
      field.append(card);
    }
    return field;
  }
  function lobby() {
    dialog.append(
      node(
        "p",
        t("Share the code or invite link, then start when everyone is here."),
        "relay-intro",
      ),
    );
    const code = node("div", undefined, "relay-room-code");
    code.append(node("span", t("Room code")), node("strong", room.code));
    const invite = button("Invite friends", async () => {
      const link =
        publicOrigin + localizedPath("/", language()) + "?room=" + room.code;
      try {
        const result = await shareFlight(
          t`Join my Sky Relay flight. Room ${room.code}. ${link}`,
        );
        if (result !== "cancelled")
          message(
            result === "copied" ? "Invite link copied." : "Invite shared.",
          );
      } catch {
        message("Copy this room code and send it to a friend.");
      }
    });
    code.append(invite);
    dialog.append(code, fleet());
    if (room.automatic)
      dialog.append(
        node(
          "p",
          t(
            "Finding real pilots. This table starts when full; you can leave and choose a smaller table.",
          ),
          "relay-queue-note",
        ),
      );
    if (room.rated)
      dialog.append(
        node(
          "p",
          t("Rated flight · similar ratings first, wider matches as you wait."),
          "eyebrow",
        ),
      );
    if (room.isHost && !room.automatic) {
      const start = button("Start the relay", () => act("start"), "primary");
      start.dataset.action = "start";
      start.dataset.start = "true";
      dialog.append(start);
    } else if (!room.automatic)
      dialog.append(
        node("p", t("Waiting for the host to start."), "relay-intro"),
      );
    dialog.append(rules());
  }
  function play() {
    const pilot = room.players.find((player) => player.id === room.current);
    const mine = room.current === room.self;
    const status = node("div", undefined, "relay-stage");
    const timer = node("div", undefined, "relay-timer");
    const seconds = node("strong");
    seconds.dataset.relayClock = "";
    timer.setAttribute("aria-label", t("Shared countdown"));
    timer.append(seconds, node("span", t("seconds")));
    status.append(
      node("span", t`Stage ${room.stage} of ${room.stages}`),
      timer,
    );
    const question = node("h3", room.question.prompt, "relay-question");
    question.dir = "auto";
    const turn = node(
      "p",
      mine ? t("Your turn. Catch the breeze.") : t`${pilot.name} is flying.`,
      "relay-turn",
    );
    dialog.append(status, question, turn);
    const form = node("form", undefined, "relay-answer-form");
    const label = node("label", t("Your answer"), "sr-only");
    label.htmlFor = "relay-answer";
    const input = node("input");
    input.id = "relay-answer";
    input.dir = "auto";
    input.maxLength = 100;
    input.autocomplete = "off";
    input.autocapitalize = "none";
    input.spellcheck = false;
    input.placeholder = t("Think of something unexpected…");
    input.dataset.answer = "true";
    const submit = button(
      "Pass the breeze",
      () => form.requestSubmit(),
      "primary",
    );
    submit.dataset.answer = "true";
    submit.dataset.action = "answer";
    form.append(label, input, submit);
    let composing = false;
    input.addEventListener("compositionstart", () => {
      composing = true;
    });
    input.addEventListener("compositionend", () => {
      composing = false;
    });
    form.onsubmit = (event) => {
      event.preventDefault();
      if (!composing && input.value.trim() && mine)
        act("answer", { answer: input.value.trim() });
    };
    dialog.append(form, fleet());
    const used = node("div", undefined, "relay-used");
    used.append(node("span", t("Already flown")));
    for (const answer of room.used)
      used.append(node("span", answer, "relay-answer-chip"));
    dialog.append(used);
    const latest = room.events.at(-1);
    if (latest) {
      const name =
        room.players.find((player) => player.id === latest.pilot)?.name || "";
      dialog.append(
        node(
          "p",
          latest.kind === "timeout"
            ? t`${name} lost a heart.`
            : t`${name} caught ${latest.points} m.`,
          "relay-event",
        ),
      );
    }
  }
  function results() {
    dialog.append(node("p", t("FLIGHT COMPLETE"), "eyebrow"), fleet());
    if (room.ratings?.length) {
      const self = room.players.find((player) => player.id === room.self);
      const result = room.ratings.find(
        (item) => item.account === self?.account,
      );
      if (result)
        dialog.append(
          node(
            "p",
            t`Rating change ${String(result.delta > 0 ? "+" : "") + result.delta}`,
            "relay-rating-result",
          ),
        );
      passport.load().catch(() => {});
    }
    const again = button(
      "Create another room",
      () => {
        clearSeat();
        rendered = "";
        render();
      },
      "primary",
    );
    dialog.append(again);
  }
  function render(force = false) {
    if (!dialog.open) return;
    const signature = JSON.stringify([
      room?.code,
      room?.turn,
      room?.status,
      room?.ratings,
      room?.language,
      language(),
    ]);
    if (!force && rendered === signature) return message(feedback);
    const oldInput = dialog.querySelector("#relay-answer");
    const draft = oldInput?.value || "";
    const focused = document.activeElement === oldInput;
    const sameTurn =
      room && paintedTurn === room.turn && paintedCode === room.code;
    rendered = signature;
    paintedTurn = room?.turn;
    paintedCode = room?.code;
    clearInterval(clock);
    dialog.replaceChildren(shell());
    if (!room) setup();
    else {
      if (room.status === "waiting") lobby();
      else if (room.status === "playing") play();
      else results();
      const leave = button("Leave room", () => act("leave"), "relay-leave");
      leave.dataset.action = "leave";
      dialog.append(leave);
      const self = room.players.find((player) => player.id === room.self);
      const score = self?.score || 0;
      onFlight({
        mode: "play",
        altitude: score,
        gain: Math.max(0, score - (visualScore ?? score)),
      });
      visualScore = score;
    }
    const output = node("p", t(feedback), "relay-feedback");
    output.setAttribute("role", "status");
    dialog.append(output);
    updateControls();
    if (sameTurn) {
      const input = dialog.querySelector("#relay-answer");
      if (input) {
        input.value = draft;
        if (focused) input.focus();
      }
    }
    tick();
    clock = setInterval(tick, 250);
    if (!sameTurn) dialog.scrollTop = 0;
  }
  function open() {
    if (!dialog.open) dialog.showModal();
    rendered = "";
    render();
    if (room) refresh();
  }
  entry.onclick = open;
  dialog.addEventListener("close", () => {
    stopPolling();
    visualScore = null;
    onFlight(null);
  });
  addEventListener("rare:language", () => {
    if (dialog.open) {
      render(true);
      if (room) refresh();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearTimeout(poll);
    else if (dialog.open && room) refresh();
  });
  addEventListener("rare:resume", () => {
    if (dialog.open && room) refresh();
  });
  addEventListener("online", () => {
    if (dialog.open && room) refresh();
  });
  if (setupCode) open();
}
