export const locales = [
  { code: "en", tag: "en", name: "English", direction: "ltr" },
  { code: "zh", tag: "zh-Hans", name: "中文", direction: "ltr" },
  { code: "es", tag: "es", name: "Español", direction: "ltr" },
  { code: "fr", tag: "fr", name: "Français", direction: "ltr" },
  { code: "pt", tag: "pt", name: "Português", direction: "ltr" },
  { code: "de", tag: "de", name: "Deutsch", direction: "ltr" },
  { code: "ja", tag: "ja", name: "日本語", direction: "ltr" },
  { code: "ko", tag: "ko", name: "한국어", direction: "ltr" },
  { code: "ru", tag: "ru", name: "Русский", direction: "ltr" },
  { code: "ar", tag: "ar", name: "العربية", direction: "rtl" },
  { code: "id", tag: "id", name: "Bahasa Indonesia", direction: "ltr" },
];

export function supportedLocale(value) {
  if (typeof value !== "string") return undefined;
  const normalized = value.toLowerCase().replaceAll("_", "-");
  // Only simplified Chinese has a translated catalog.
  if (/^zh-(?:hant|tw|hk|mo)(?:-|$)/.test(normalized)) return undefined;
  const code = normalized.split("-")[0];
  return locales.find((locale) => locale.code === code);
}

export function resolveLocale(value) {
  return supportedLocale(value) || locales[0];
}

export function preferredLocale(preferences) {
  for (const value of preferences) {
    const locale = supportedLocale(value);
    if (locale) return locale;
  }
  return locales[0];
}

export function localizedPath(path, code) {
  const prefix = path.split("/")[1];
  const source = locales.some((locale) => locale.code !== "en" && locale.code === prefix)
    ? path.slice(prefix.length + 1) || "/"
    : path || "/";
  return code === "en" ? source : `/${code}${source}`;
}
