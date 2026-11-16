export const locales = [
  { code: "en", tag: "en", name: "English", direction: "ltr" },
  { code: "zh", tag: "zh-Hans", name: "中文", direction: "ltr" },
  { code: "es", tag: "es", name: "Español", direction: "ltr" },
  { code: "fr", tag: "fr", name: "Français", direction: "ltr" },
  { code: "pt", tag: "pt", name: "Português", direction: "ltr" },
  { code: "de", tag: "de", name: "Deutsch", direction: "ltr" },
  { code: "ja", tag: "ja", name: "日本語", direction: "ltr" },
  { code: "ru", tag: "ru", name: "Русский", direction: "ltr" },
  { code: "ar", tag: "ar", name: "العربية", direction: "rtl" },
  { code: "id", tag: "id", name: "Bahasa Indonesia", direction: "ltr" },
];

export function resolveLocale(value) {
  const code = typeof value === "string" ? value.toLowerCase().split(/[-_]/)[0] : "en";
  return locales.find((locale) => locale.code === code) || locales[0];
}

export function localizedPath(path, code) {
  const source = path.replace(/^\/(?:zh|de|es|ar|fr|ja|pt|id|ru)(?=\/|$)/, "") || "/";
  return code === "en" ? source : `/${code}${source}`;
}
