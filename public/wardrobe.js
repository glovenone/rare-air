import { t, language } from "./i18n.js";
import {
  avatars,
  avatarImage,
  selectedAvatar,
  selectAvatar,
} from "./avatars.js";

export function initWardrobe({ request, openDialog, passport, progression }) {
  let state = null;
  let owner = null;
  let revision = 0;
  let root = null;
  let tab = "icons";
  let pending = null;
  let busy = false;
  let notice = "";
  const node = (tag, text, cls) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (cls) element.className = cls;
    return element;
  };
  function image(id, cls) {
    const img = node("img", undefined, cls);
    img.src = avatarImage(id);
    img.alt = "";
    img.width = 80;
    img.height = 80;
    return img;
  }
  function updateHome() {
    for (const id of ["pilot-avatar", "reward-avatar"]) {
      const img = document.getElementById(id);
      if (img) img.src = avatarImage(selectedAvatar().id);
    }
    for (const id of ["reward-balance", "result-reward-balance"]) {
      const balance = document.getElementById(id);
      if (balance)
        balance.textContent = state
          ? t`${state.balance.toLocaleString(language())} Sky points`
          : t("Icons, companions & trails");
    }
  }
  async function refresh() {
    await passport.ready;
    if (busy) return;
    const current = ++revision;
    const latest = await passport.load();
    if (current !== revision) return;
    const latestOwner = latest.account?.id || null;
    const result = latestOwner ? await request("passport/wardrobe", {}) : null;
    if (
      current !== revision ||
      latestOwner !== (passport.account()?.id || null)
    )
      return;
    owner = latestOwner;
    state = result;
    if (state) selectAvatar(state.selected);
    updateHome();
  }
  function draw() {
    if (!root?.isConnected) return;
    root.replaceChildren(node("h2", t("Your sky. Your style.")));
    const summary = node("div", undefined, "wardrobe-summary");
    summary.append(image(selectedAvatar().id, "wardrobe-preview"));
    const wallet = node("div");
    wallet.append(node("strong", t(selectedAvatar().name)));
    wallet.append(
      node(
        "p",
        state
          ? t`${state.balance.toLocaleString(language())} Sky points`
          : t("Choose your pilot icon."),
        "wallet-balance",
      ),
    );
    summary.append(wallet);
    root.append(summary);
    if (!state) {
      const onboarding = node("section", undefined, "wardrobe-onboarding");
      onboarding.append(
        node("p", t("Create a free passport to earn points and redeem icons.")),
      );
      const join = node("button", t("Open my passport"), "wardrobe-secondary");
      join.type = "button";
      join.onclick = () => passport.open();
      onboarding.append(join);
      root.append(onboarding);
    }
    const tabs = node("div", undefined, "wardrobe-tabs");
    for (const [id, label] of [
      ["icons", "Pilot icons"],
      ["streak", "Companions & trails"],
    ]) {
      const button = node("button", t(label));
      button.type = "button";
      button.setAttribute("aria-pressed", String(tab === id));
      button.onclick = () => {
        tab = id;
        pending = null;
        notice = "";
        draw();
      };
      tabs.append(button);
    }
    root.append(tabs);
    const status = node("p", notice, "wardrobe-status");
    status.setAttribute("role", "status");
    root.append(status);
    if (tab === "streak") {
      progression.decorateLog(root);
      return;
    }
    if (pending) {
      const confirm = node("section", undefined, "redeem-confirm");
      confirm.setAttribute("aria-label", t("Confirm redemption"));
      confirm.append(image(pending.id));
      confirm.append(
        node(
          "h3",
          t`Redeem ${t(pending.name)} for ${pending.cost} Sky points?`,
        ),
      );
      const approve = node("button", t("Redeem & equip"), "primary");
      approve.type = "button";
      approve.disabled = busy;
      approve.onclick = () => act(pending, true);
      const cancel = node("button", t("Back to icons"), "wardrobe-secondary");
      cancel.type = "button";
      cancel.disabled = busy;
      cancel.onclick = () => {
        pending = null;
        draw();
      };
      confirm.append(approve, cancel);
      root.append(confirm);
      return;
    }
    const grid = node("div", undefined, "avatar-grid");
    const owned =
      state?.owned ||
      avatars.filter((item) => item.cost === 0).map((item) => item.id);
    for (const avatar of avatars) {
      const unlocked = owned.includes(avatar.id);
      const selected = selectedAvatar().id === avatar.id;
      const button = node("button", undefined, "avatar-card");
      button.type = "button";
      button.dataset.avatar = avatar.id;
      button.disabled = busy;
      button.style.setProperty("--avatar-color", avatar.color);
      button.setAttribute("aria-pressed", String(selected));
      button.append(image(avatar.id));
      button.append(node("strong", t(avatar.name)));
      button.append(
        node(
          "span",
          selected
            ? t("Equipped")
            : unlocked
              ? t("Use icon")
              : t`${avatar.cost} Sky points`,
          "avatar-price",
        ),
      );
      button.onclick = () => {
        notice = "";
        if (unlocked) act(avatar, false);
        else if (!state) {
          notice = t("Create a free passport to earn points and redeem icons.");
          draw();
          root
            .querySelector(".wardrobe-status")
            ?.scrollIntoView({ block: "nearest" });
        } else if (state.balance < avatar.cost) {
          notice = t`You need ${avatar.cost - state.balance} more Sky points.`;
          draw();
          root
            .querySelector(".wardrobe-status")
            ?.scrollIntoView({ block: "nearest" });
        } else {
          pending = avatar;
          draw();
          root.querySelector(".redeem-confirm .primary")?.focus();
        }
      };
      grid.append(button);
    }
    root.append(grid);
    const rules = node("details", undefined, "points-rules");
    rules.append(node("summary", t("How to earn Sky points")));
    rules.append(
      node(
        "p",
        t(
          "Finish an online daily flight on its UTC day or complete a chapter. Each unique challenge earns 10 points plus 1 per 100 best meters, up to 60 points.",
        ),
      ),
    );
    rules.append(
      node(
        "p",
        t(
          "A higher replay score adds only the improvement. Archive replays and free or offline practice do not earn points. Earlier eligible passport history counts too.",
        ),
      ),
    );
    root.append(rules);
    const routes = node("button", t("Flight routes ↗"), "wardrobe-secondary");
    routes.type = "button";
    routes.onclick = () => progression.openRoutes();
    root.append(routes);
  }
  async function act(avatar, redeem) {
    if (busy) return;
    busy = true;
    const currentOwner = owner;
    const currentRevision = revision;
    draw();
    try {
      if (state) {
        if (redeem) await request("passport/redeem", { avatar: avatar.id });
        const result = await request("passport/avatar", { avatar: avatar.id });
        if (
          currentOwner !== passport.account()?.id ||
          currentRevision !== revision
        )
          return;
        state = result;
      } else if (avatar.cost) return;
      selectAvatar(avatar.id);
      notice = t(
        redeem ? "Icon unlocked and equipped." : "Pilot icon updated.",
      );
      pending = null;
      updateHome();
    } catch (error) {
      if (currentRevision === revision) notice = t(error.message);
      // A redemption may have committed before an equip request lost its connection.
      if (redeem && currentOwner === passport.account()?.id) {
        const latest = await request("passport/wardrobe", {}).catch(() => null);
        if (
          latest &&
          currentRevision === revision &&
          currentOwner === passport.account()?.id
        ) {
          state = latest;
          selectAvatar(latest.selected);
          updateHome();
        }
      }
    } finally {
      if (currentRevision === revision) {
        busy = false;
        draw();
        root
          ?.querySelector(`.avatar-card[data-avatar="${avatar.id}"]`)
          ?.focus({ preventScroll: true });
      }
    }
  }
  async function open() {
    tab = "icons";
    pending = null;
    notice = "";
    root = openDialog("Your sky. Your style.", []);
    root.className = "wardrobe-content";
    root.append(node("p", t("Loading your rewards…")));
    try {
      await refresh();
    } catch (error) {
      notice = t(error.message);
    }
    draw();
  }
  document.getElementById("wardrobe-entry").onclick = open;
  document.getElementById("result-rewards").onclick = open;
  addEventListener("rare:wardrobe", open);
  addEventListener("rare:avatar", updateHome);
  addEventListener("rare:language", () => {
    notice = "";
    updateHome();
    draw();
  });
  addEventListener("rare:identity", () => {
    revision++;
    state = null;
    owner = passport.account()?.id || null;
    pending = null;
    busy = false;
    selectAvatar("swallow");
    refresh()
      .then(draw)
      .catch(() => {});
  });
  addEventListener("rare:history", () =>
    refresh()
      .then(draw)
      .catch(() => {}),
  );
  addEventListener("rare:rewards", () =>
    refresh()
      .then(draw)
      .catch(() => {}),
  );
  updateHome();
  Promise.resolve(passport.ready)
    .then(refresh)
    .catch(() => {});
  return { open };
}
