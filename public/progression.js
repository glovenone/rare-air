import {
  companions,
  selectedCompanion,
  selectCompanion,
} from "./companions.js";
import { t, language } from "./i18n.js";
import { flightTrails, selectedTrail, selectTrail } from "./trails.js";

export function initProgression({ request, openDialog, startChapter }) {
  let progress = null;
  let cached = false;
  let refreshedGame = null;
  let activeRoute = null;
  let routesOpen = false;
  try {
    progress = JSON.parse(localStorage.getItem("rare:progression"));
  } catch {}

  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  const stars = (value) => "★".repeat(value) + "☆".repeat(3 - value);
  async function load() {
    try {
      progress = await request("progress");
      cached = false;
      try {
        localStorage.setItem("rare:progression", JSON.stringify(progress));
      } catch {}
    } catch (error) {
      if (!progress) throw error;
      cached = true;
    }
    return progress;
  }
  function openRoutes(routeId = null) {
    activeRoute = routeId;
    routesOpen = true;
    drawRoutes();
  }
  async function drawRoutes() {
    const content = openDialog("Your flight routes.", [
      "Complete chapters, collect stars and explore a new part of the sky.",
    ]);
    const body = node("div", undefined, "route-body");
    body.textContent = "…";
    content.append(body);
    try {
      await load();
      body.replaceChildren();
      if (cached)
        body.append(node("p", t("Saved progress. Reconnect to refresh.")));
      const route = progress.routes.find((route) => route.id === activeRoute);
      if (!route) {
        const grid = node("div", undefined, "route-grid");
        for (const route of progress.routes) {
          const completed = route.chapters.filter(
            (chapter) => chapter.completed,
          ).length;
          const button = node("button", undefined, "route-card");
          button.type = "button";
          button.style.setProperty(
            "--route-art",
            `url(/art/routes/${route.id}.svg)`,
          );
          button.append(
            node("strong", t(route.label)),
            node("span", t(route.description)),
            node(
              "small",
              t`${completed} of ${route.chapters.length} chapters complete`,
            ),
          );
          const track = node("span", undefined, "route-track");
          for (const chapter of route.chapters)
            track.append(
              node(
                "i",
                chapter.completed ? "✓" : "",
                chapter.completed ? "complete" : "",
              ),
            );
          button.append(track);
          button.onclick = () => openRoutes(route.id);
          grid.append(button);
        }
        body.append(grid);
      } else {
        const back = node("button", t("← All routes"), "back");
        back.type = "button";
        back.onclick = () => openRoutes();
        body.append(back, node("h3", t(route.label), "route-title"));
        const path = node("div", undefined, "chapter-path");
        for (const chapter of route.chapters) {
          const button = node("button", undefined, "chapter-card");
          button.type = "button";
          button.disabled = !chapter.unlocked;
          button.classList.toggle("complete", chapter.completed);
          button.append(
            node(
              "span",
              chapter.completed ? "✓" : String(chapter.number),
              "chapter-stop",
            ),
          );
          const description = node("span", undefined, "chapter-copy");
          description.append(
            node("strong", t`Chapter ${chapter.number}`),
            node(
              "small",
              !chapter.unlocked
                ? t("Complete the previous chapter first.")
                : chapter.completed
                  ? t`Best ${chapter.best.toLocaleString(language())} m`
                  : t("Five questions. A new horizon."),
            ),
          );
          button.append(
            description,
            node("span", stars(chapter.stars), "chapter-stars"),
          );
          button.setAttribute(
            "aria-label",
            t`Chapter ${chapter.number} · ${chapter.stars} stars`,
          );
          button.onclick = () => {
            document.getElementById("modal").close();
            startChapter(chapter.id);
          };
          path.append(button);
        }
        body.append(
          path,
          node(
            "p",
            t(
              "Finish all five questions to open the next chapter. Earn stars at 1,000, 2,500 and 4,000 meters.",
            ),
            "route-note",
          ),
        );
      }
    } catch (error) {
      body.textContent = t(error.message);
    }
  }
  async function decorateLog(content) {
    const section = node("section", undefined, "streak-section");
    content.append(section);
    section.textContent = "…";
    try {
      await load();
      section.replaceChildren(node("h3", t("Keep your sky streak.")));
      if (cached)
        section.append(node("p", t("Saved progress. Reconnect to refresh.")));
      const stats = node("div", undefined, "streak-stats");
      stats.append(
        node("strong", String(progress.streak.current)),
        node("span", t("day streak")),
        node("small", t`Best streak ${progress.streak.best} days`),
      );
      section.append(
        stats,
        node(
          "p",
          t(
            "Complete today’s daily flight to keep your streak. Days reset at midnight UTC. Archive replays and offline practice do not extend it.",
          ),
          "route-note",
        ),
      );
      if (progress.legacyDaily)
        section.append(
          node(
            "p",
            t(
              "Earlier flights remain in your log. Streaks count new daily completions.",
            ),
            "route-note",
          ),
        );
      section.append(node("h3", t("Your flight trails.")));
      const grid = node("div", undefined, "trail-grid");
      for (const trail of flightTrails) {
        const unlocked = progress.unlockedTrails.includes(trail.id);
        const button = node("button", undefined, "trail-card");
        button.type = "button";
        button.disabled = !unlocked;
        button.style.setProperty("--trail-color", trail.color);
        button.style.setProperty("--trail-accent", trail.planes[0]);
        const swatch = node("span", "↗", "trail-swatch");
        swatch.setAttribute("aria-hidden", "true");
        const description = node("span");
        description.append(
          node("strong", t(trail.name)),
          node(
            "small",
            unlocked ? t("Unlocked") : t`${trail.days}-day best streak`,
          ),
        );
        button.append(swatch, description);
        button.setAttribute(
          "aria-pressed",
          String(selectedTrail().id === trail.id),
        );
        button.onclick = () => {
          selectTrail(trail.id);
          request("passport/preferences", { trail: trail.id }).catch(() => {});
          for (const other of grid.querySelectorAll("button"))
            other.setAttribute("aria-pressed", String(other === button));
        };
        grid.append(button);
      }
      section.append(grid, node("h3", t("Your sky companions.")));
      const buddies = node("div", undefined, "companion-grid");
      for (const companion of companions) {
        const button = node("button", undefined, "companion-card");
        button.type = "button";
        button.disabled = !(
          progress.unlockedCompanions || ["swallow"]
        ).includes(companion.id);
        button.setAttribute(
          "aria-pressed",
          String(selectedCompanion().id === companion.id),
        );
        const icon = node("img");
        icon.src = "/art/companions/" + companion.id + ".svg";
        icon.alt = "";
        button.append(
          icon,
          node("strong", t(companion.name)),
          node(
            "small",
            button.disabled
              ? t`${companion.days}-day best streak`
              : t("Unlocked"),
          ),
        );
        button.onclick = async () => {
          selectCompanion(companion.id);
          for (const other of buddies.children)
            other.setAttribute("aria-pressed", String(other === button));
          try {
            await request("passport/preferences", { buddy: companion.id });
          } catch {}
        };
        buddies.append(button);
      }
      section.append(buddies);
    } catch (error) {
      section.textContent = t(error.message);
    }
  }
  addEventListener("rare:identity", () => {
    progress = null;
    cached = false;
    refreshedGame = null;
  });
  document.getElementById("routes-entry").onclick = () => openRoutes();
  document.getElementById("modal").addEventListener("close", () => {
    routesOpen = false;
  });
  addEventListener("rare:language", () => {
    if (routesOpen && document.getElementById("modal").open) drawRoutes();
  });
  return {
    openRoutes,
    decorateLog,
    recordCompletion(game) {
      if (game.mode === "offline" || refreshedGame === game.id) return;
      refreshedGame = game.id;
      load().catch(() => {});
    },
  };
}
