import { t, language } from "./i18n.js";
import { startRegistration, startAuthentication } from "./vendor/passkeys.js";
import { selectCompanion } from "./companions.js";
import { selectTrail } from "./trails.js";
export function initPassport({
  request,
  openDialog,
  native,
  publicOrigin,
  shareFlight,
}) {
  let state = { account: null },
    busy = false,
    view = "passport",
    recovery = null;
  let invitation = new URL(location.href).searchParams.get("friend") || "";
  const node = (tag, text, cls) => {
    const e = document.createElement(tag);
    if (text !== undefined) e.textContent = text;
    if (cls) e.className = cls;
    return e;
  };
  const text = (tag, value, cls) => node(tag, t(value), cls);
  const button = (value, fn, cls = "passport-button") => {
    const e = text("button", value, cls);
    e.type = "button";
    e.onclick = () => {
      document.activeElement?.blur();
      run(fn);
    };
    return e;
  };
  const input = (label, type = "text") => {
    const e = node("input");
    e.type = type;
    e.autocomplete = "off";
    e.maxLength = type === "password" ? 90 : 24;
    const wrap = text("label", label);
    wrap.append(e);
    return { wrap, input: e };
  };
  async function run(fn) {
    if (busy) return;
    busy = true;
    try {
      await fn();
    } catch (error) {
      const output = document.querySelector("#modal .passport-status");
      if (output)
        output.textContent = t(
          error.name === "NotAllowedError"
            ? "Passkey cancelled. Your passport is unchanged."
            : error.message,
        );
    } finally {
      busy = false;
    }
  }
  function status(body) {
    const p = node("p", "", "passport-status");
    p.setAttribute("role", "status");
    body.append(p);
  }
  async function load() {
    state = await request("passport");
    const entry = document.getElementById("passport-entry");
    entry.textContent = state.account
      ? state.account.name + " ↗"
      : t("Flight passport ↗");
    return state;
  }
  async function syncIdentity() {
    for (const key of ["history", "sessions", "progression"])
      try {
        localStorage.removeItem("rare:" + key);
      } catch {}
    await load();
    if (state.account) {
      const log = await request("passport/history", {}),
        history = {};
      for (const flight of log.entries)
        if (flight.mode === "daily" && !history[flight.day])
          history[flight.day] = {
            day: flight.day,
            score: Number(flight.score),
            tiers: String(flight.tiers || "")
              .split(",")
              .map(Number),
          };
      try {
        localStorage.setItem("rare:history", JSON.stringify(history));
      } catch {}
      selectCompanion(state.account.buddy);
      selectTrail(state.account.trail);
    } else {
      selectCompanion("swallow");
      selectTrail("classic");
    }
    window.dispatchEvent(new Event("rare:identity"));
  }
  function panel(title, intro) {
    const body = openDialog(title, intro ? [intro] : []);
    body.classList.add("passport-content");
    return body;
  }
  function showRecovery(code) {
    recovery = code;
    const body = panel(
      "Your passport is ready.",
      "Save this private recovery code. It opens your passport on another device. We store only its fingerprint and cannot email it to you.",
    );
    const output = node("textarea");
    output.readOnly = true;
    output.value = code.match(/.{1,8}/g).join("-");
    output.className = "recovery-code";
    output.setAttribute("aria-label", t("Recovery code"));
    body.append(
      output,
      button("Copy recovery code", async () => {
        await navigator.clipboard.writeText(output.value);
        document.querySelector(".passport-status").textContent = t(
          "Recovery code copied.",
        );
      }),
    );
    const saved = text("label", "I saved my recovery code.");
    const checkbox = node("input");
    checkbox.type = "checkbox";
    saved.prepend(checkbox);
    const done = button(
      "Open my passport",
      async () => {
        recovery = null;
        await syncIdentity();
        await open();
      },
      "primary",
    );
    done.disabled = true;
    checkbox.onchange = () => (done.disabled = !checkbox.checked);
    body.append(saved, done);
    status(body);
  }
  async function loginPasskey() {
    const options = await request("passport/passkey-login-options", {});
    const response = await startAuthentication({
      optionsJSON: options.options,
    });
    await request("passport/passkey-login", { id: options.id, response });
    await syncIdentity();
    await open();
  }
  async function open(tab = "passport") {
    view = tab;
    const body = panel(
      "Flight passport",
      "Your flights. Your friends. The same sky on every device.",
    );
    status(body);
    await load();
    body.replaceChildren(
      text("h2", "Flight passport"),
      text("p", "Your flights. Your friends. The same sky on every device."),
    );
    const tabs = node("nav", undefined, "passport-tabs");
    for (const [id, label] of [
      ["passport", "Passport"],
      ["friends", "Friends"],
      ["board", "Friends leaderboard"],
    ]) {
      const b = button(label, () => open(id));
      b.setAttribute("aria-current", String(view === id));
      tabs.append(b);
    }
    body.append(tabs);
    if (!state.account) {
      body.append(
        text(
          "p",
          "Play as a guest, or create a free passport to keep your progress and play rated. No email address is required.",
        ),
      );
      const name = input("Pilot name");
      name.input.autocomplete = "nickname";
      const create = button(
        "Create a passport",
        async () => {
          if (!name.input.value.trim()) throw new Error("Enter a pilot name.");
          const result = await request("passport/create", {
            name: name.input.value,
          });
          showRecovery(result.recovery);
        },
        "primary",
      );
      body.append(name.wrap, create);
      if (!native && window.PublicKeyCredential)
        body.append(button("Sign in with a passkey", loginPasskey));
      const recover = input("Recovery code", "password");
      recover.input.maxLength = 90;
      body.append(
        recover.wrap,
        button("Restore my passport", async () => {
          await request("passport/recover", { recovery: recover.input.value });
          await syncIdentity();
          await open();
        }),
      );
      status(body);
      return;
    }
    const card = node("section", undefined, "passport-card");
    card.append(
      text("span", "FLIGHT PASSPORT", "eyebrow"),
      node("h3", state.account.name),
      text("small", "Private recovery. No email. No advertising profile."),
    );
    const stats = node("div", undefined, "passport-stats");
    stats.append(
      node("strong", String(state.account.rating)),
      text("span", "rating"),
      node("strong", String(state.account.matches)),
      text("span", "rated flights"),
    );
    card.append(stats);
    body.append(card);
    if (invitation) {
      try {
        const invite = await request("passport/invite-preview", {
          code: invitation,
        });
        const offer = node("section", undefined, "passport-invite");
        offer.append(
          node("p", t`${invite.pilot.name} invited you to fly together.`),
          button(
            "Accept friend invitation",
            async () => {
              await request("passport/accept", { code: invitation });
              invitation = "";
              history.replaceState(null, "", location.pathname);
              await open("friends");
            },
            "primary",
          ),
        );
        body.append(offer);
      } catch (error) {
        body.append(node("p", t(error.message)));
        invitation = "";
      }
    }
    if (view === "friends") {
      await friends(body);
      await blockedPilots(body);
    } else if (view === "board") await board(body);
    else {
      if (state.canImport)
        body.append(
          text(
            "p",
            "This browser has earlier guest flights. Import them only if they are yours.",
          ),
          button("Import this device history", async () => {
            await request("passport/import", { confirm: true });
            await syncIdentity();
            await open();
          }),
        );
      const name = input("Pilot name");
      name.input.value = state.account.name;
      body.append(
        name.wrap,
        button("Save pilot name", async () => {
          await request("passport/profile", { name: name.input.value });
          await load();
          await open();
        }),
      );
      if (!native && window.PublicKeyCredential)
        body.append(
          button(
            state.passkeys ? "Add another passkey" : "Add a passkey",
            async () => {
              const options = await request(
                "passport/passkey-register-options",
                {},
              );
              const response = await startRegistration({
                optionsJSON: options.options,
              });
              await request("passport/passkey-register", {
                id: options.id,
                response,
              });
              await open();
            },
          ),
        );
      if (native)
        body.append(
          text(
            "p",
            "Manage passkeys on the website. Use your recovery code to sign in here.",
          ),
        );
      body.append(
        button("Sign out", async () => {
          await request("passport/logout", {});
          await syncIdentity();
          await open();
        }),
      );
      const settings = node("details");
      settings.append(text("summary", "Recovery and deletion"));
      const key = input("Current recovery code", "password");
      settings.append(
        key.wrap,
        button("Replace recovery code", async () => {
          const next = await request("passport/rotate", {
            recovery: key.input.value,
          });
          showRecovery(next.recovery);
        }),
      );
      const consent = text(
        "label",
        "Delete my passport and its online flight history permanently.",
      );
      const check = node("input");
      check.type = "checkbox";
      consent.prepend(check);
      settings.append(
        consent,
        button(
          "Delete passport",
          async () => {
            if (!check.checked)
              throw new Error("Confirm before deleting your passport.");
            await request("passport/delete", {
              recovery: key.input.value,
              confirm: true,
            });
            await syncIdentity();
            await open();
          },
          "passport-danger",
        ),
      );
      body.append(settings);
    }
    status(body);
  }
  async function friends(body) {
    body.append(
      button("Invite a friend", async () => {
        const invite = await request("passport/invite", {});
        const link = publicOrigin + "/?friend=" + invite.code;
        await shareFlight(t`Join my RARE Air flight crew. ${link}`);
      }),
    );
    const { entries } = await request("passport/friends", {});
    if (!entries.length)
      body.append(
        text("p", "Your crew is still quiet. Invite someone you know."),
      );
    for (const friend of entries) {
      const row = node("article", undefined, "friend-row");
      row.append(
        node("strong", friend.name),
        node("span", String(friend.rating)),
        button("Remove friend", async () => {
          await request("passport/unfriend", { target: friend.id });
          await open("friends");
        }),
        button("Block pilot", async () => {
          await request("passport/block", { target: friend.id });
          await open("friends");
        }),
      );
      body.append(row);
    }
  }
  async function blockedPilots(body) {
    const { entries } = await request("passport/blocked", {});
    if (!entries.length) return;
    const list = document.createElement("details");
    list.append(text("summary", "Blocked pilots"));
    for (const entry of entries) {
      const row = node("div", undefined, "friend-row");
      row.append(
        node("strong", entry.name || t("Guest pilot")),
        button("Unblock pilot", async () => {
          await request("passport/unblock", { target: entry.target });
          await open("friends");
        }),
      );
      list.append(row);
    }
    body.append(list);
  }
  async function board(body) {
    const result = await request("passport/friend-board", {});
    if (result.locked) {
      body.append(
        text(
          "p",
          "Finish today’s daily flight to reveal your friends’ scores and answers.",
        ),
      );
      return;
    }
    body.append(node("p", result.day));
    for (const entry of result.entries) {
      const row = node("details", undefined, "friend-board-row");
      row.append(
        node(
          "summary",
          entry.name +
            " · " +
            (entry.score === null
              ? t("Not flown yet")
              : entry.score.toLocaleString(language()) + " m"),
        ),
      );
      for (const answer of entry.answers)
        row.append(node("p", answer.label + " · " + answer.points + " m"));
      body.append(row);
    }
  }
  async function report(target, room) {
    const body = panel(
      "Report a pilot",
      "Describe what happened. Reports are stored for moderation. You can also block a signed-in pilot.",
    );
    if (!state.account) {
      body.append(button("Open my passport", () => open()));
      return;
    }
    const reason = node("textarea");
    reason.maxLength = 300;
    reason.setAttribute("aria-label", t("Report details"));
    body.append(
      reason,
      button("Send report", async () => {
        await request("passport/report", {
          target,
          room,
          reason: reason.value,
        });
        reason.value = "";
        document.querySelector(".passport-status").textContent =
          t("Report received.");
      }),
    );
    if (/^(?:[a-f0-9-]{36}|[a-f0-9]{64})$/.test(target))
      body.append(
        button("Block pilot", async () => {
          await request("passport/block", { target });
          document.querySelector(".passport-status").textContent =
            t("Pilot blocked.");
        }),
      );
    status(body);
  }
  document.getElementById("passport-entry").onclick = () => run(() => open());
  addEventListener("rare:language", () => {
    if (document.querySelector("#modal[open] .passport-content"))
      run(() => open(view));
  });
  load()
    .then(() => (state.account ? syncIdentity() : null))
    .catch(() => {});
  if (
    invitation ||
    new URL(location.href).searchParams.get("passport") === "delete"
  )
    run(() => open());
  return {
    open: () => run(() => open()),
    load,
    report: (target, room) => run(() => report(target, room)),
    account: () => state.account,
  };
}
