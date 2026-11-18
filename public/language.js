import { selectLanguage, createLanguageSelector, initialLanguage } from "./i18n.js";
import { localizedPath } from "./locales.js";

createLanguageSelector((code) => {
  selectLanguage(code);
  location.assign(localizedPath(location.pathname, code));
});
const selected = initialLanguage();
selectLanguage(selected);
const path = localizedPath(location.pathname, selected);
if (path !== location.pathname) location.replace(path + location.search + location.hash);
