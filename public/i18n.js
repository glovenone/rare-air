import { locales, resolveLocale, supportedLocale, preferredLocale, localizedPath } from "./locales.js";
import { messages } from "./translations.js";

// The packaged app bundles this module while its Canvas module loads it directly.
// Share selection so both copies follow the same language changes.
const state = window.RareLanguageState || (window.RareLanguageState = {
  selected: resolveLocale(document.documentElement.lang),
});

export function language() {
  return state.selected.code;
}

export function t(message, ...values) {
  const key = Array.isArray(message)
    ? message.reduce((result, part, index) => result + (index ? `{${index - 1}}` : "") + part, "")
    : String(message);
  const exact = messages[state.selected.code]?.[key];
  const normalized = messages[state.selected.code]?.[key.trim().replace(/\s+/g, " ")];
  const translated = typeof exact === "string" ? exact : typeof normalized === "string" ? normalized : key;
  return translated.replace(/\{(\d+)\}/g, (match, index) => {
    const value = values[index];
    return value === undefined ? match : String(value);
  });
}

export function applyLanguage() {
  const selected = state.selected;
  document.documentElement.lang = selected.tag;
  document.documentElement.dir = selected.direction;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const marker = node.previousSibling;
    if (marker?.nodeType !== Node.COMMENT_NODE || !marker.data.startsWith("i18n:")) continue;
    const source = decodeURIComponent(marker.data.slice(5));
    const key = source.trim().replace(/\s+/g, " ");
    node.textContent = source.replace(source.trim(), t(key));
  }
  for (const node of document.querySelectorAll("[aria-label], [placeholder], [title]")) {
    for (const name of ["aria-label", "placeholder", "title"]) {
      const source = node.getAttribute(`data-i18n-${name}`);
      if (source) node.setAttribute(name, t(source));
    }
  }
  for (const node of document.querySelectorAll("meta[data-i18n-content]")) {
    node.content = t(node.getAttribute("data-i18n-content"));
  }
  for (const node of document.querySelectorAll('link[rel="canonical"], meta[property="og:url"]')) {
    const attribute = node.tagName === "LINK" ? "href" : "content";
    const url = new URL(node.getAttribute(attribute));
    url.pathname = localizedPath(url.pathname, selected.code);
    node.setAttribute(attribute, url.href);
  }
  for (const link of document.querySelectorAll('a[href^="/"]')) {
    const url = new URL(link.href);
    if (url.pathname.endsWith("/") && !url.pathname.startsWith("/licenses/")) {
      link.setAttribute("href", localizedPath(url.pathname, selected.code) + url.search + url.hash);
    }
  }
  const selector = document.getElementById("language-select");
  if (selector) {
    selector.value = selected.code;
    selector.setAttribute("aria-label", t("Language"));
    document.getElementById("language-caption").textContent = t("Language");
  }
  const title = document.querySelector('meta[name="rare-source-title"]')?.content;
  if (title) document.title = t(title);
  window.dispatchEvent(new CustomEvent("rare:language", { detail: selected.code }));
}

export function selectLanguage(code) {
  state.selected = resolveLocale(code);
  try { localStorage.setItem("rare:language", state.selected.code); } catch {}
  applyLanguage();
}

export function createLanguageSelector(onChange) {
  const label = document.createElement("label");
  label.className = "language-selector";
  const caption = document.createElement("span");
  caption.id = "language-caption";
  caption.className = "sr-only";
  caption.textContent = "Language";
  const select = document.createElement("select");
  select.id = "language-select";
  select.setAttribute("aria-label", "Language");
  for (const locale of locales) {
    const option = document.createElement("option");
    option.value = locale.code;
    option.lang = locale.tag;
    option.textContent = locale.name;
    select.append(option);
  }
  select.value = state.selected.code;
  select.addEventListener("change", () => onChange(select.value));
  label.append(caption, select);
  (document.querySelector(".site-header nav") || document.querySelector("header")).append(label);
  return select;
}

export function initialLanguage() {
  const prefix = location.pathname.split("/")[1];
  const explicit = locales.find((locale) => locale.code !== "en" && locale.code === prefix);
  if (explicit) return explicit.code;
  try {
    const saved = supportedLocale(localStorage.getItem("rare:language"));
    if (saved) return saved.code;
  } catch {}
  const preferences = navigator.languages?.length ? navigator.languages : [navigator.language];
  return preferredLocale(preferences).code;
}

window.RareI18n = { t, applyLanguage };
