import { applyLanguage, selectLanguage, createLanguageSelector } from "./i18n.js";
import { localizedPath } from "./locales.js";

createLanguageSelector((code) => {
  selectLanguage(code);
  location.assign(localizedPath(location.pathname, code));
});
applyLanguage();
