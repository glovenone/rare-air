(() => {
  const id = document.querySelector('meta[name="google-analytics-id"]')?.content;
  if (!/^G-[A-Z0-9]+$/.test(id || "")) return;
  if (location.protocol !== "https:" || location.hostname !== "krillionunlimited.top") return;

  const storageKey = "rare_analytics_consent";
  let choice = null;
  try {
    choice = localStorage.getItem(storageKey);
  } catch {
    // Analytics stays optional when browser storage is unavailable.
  }

  let loaded = false;
  const send = (...args) => {
    if (choice === "granted" && loaded) window.gtag(...args);
  };
  const cleanUrl = (value) => {
    try {
      const url = new URL(value);
      return url.origin + url.pathname;
    } catch {
      return "";
    }
  };
  const enable = () => {
    window[`ga-disable-${id}`] = false;
    if (loaded) {
      window.gtag("consent", "update", { analytics_storage: "granted" });
      return;
    }
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    window.gtag("set", "send_page_view", false);
    window.gtag("js", new Date());
    window.gtag("config", id, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: cleanUrl(location.href),
      page_referrer: cleanUrl(document.referrer),
    });
    send("event", "page_view", {
      page_title: document.title,
      page_location: cleanUrl(location.href),
      page_referrer: cleanUrl(document.referrer),
    });
    const tag = document.createElement("script");
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.append(tag);
  };

  const banner = document.createElement("section");
  banner.className = "analytics-choice";
  banner.setAttribute("aria-label", "Analytics preferences");
  banner.innerHTML = '<p>Allow Google Analytics to help us understand visits and app downloads? <a href="/privacy/">Privacy policy</a></p><div><button type="button" data-choice="granted">Allow analytics</button><button type="button" data-choice="denied">Decline</button></div>';
  banner.hidden = choice === "granted" || choice === "denied";
  banner.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-choice]");
    if (!button) return;
    choice = button.dataset.choice;
    try {
      localStorage.setItem(storageKey, choice);
    } catch {
      // The selection still applies to this page visit.
    }
    banner.hidden = true;
    if (choice === "granted") {
      enable();
    } else {
      window[`ga-disable-${id}`] = true;
      if (loaded) window.gtag("consent", "update", { analytics_storage: "denied" });
      for (const cookie of document.cookie.split(";")) {
        const name = cookie.split("=")[0].trim();
        if (name !== "_ga" && !name.startsWith("_ga_")) continue;
        for (const domain of ["", "; domain=krillionunlimited.top"]) {
          document.cookie = `${name}=; Max-Age=0; path=/${domain}; SameSite=Lax; Secure`;
        }
      }
    }
  });
  document.body.append(banner);

  const settings = document.createElement("button");
  settings.type = "button";
  settings.className = "analytics-settings";
  settings.textContent = "Analytics settings";
  const translateChoices = () => {
    const tr = window.RareI18n?.t || ((text) => text);
    settings.textContent = tr("Analytics settings");
    banner.setAttribute("aria-label", tr("Analytics preferences"));
    banner.querySelector("p").firstChild.textContent = tr("Allow Google Analytics to help us understand visits and app downloads?") + " ";
    banner.querySelector("a").textContent = tr("Privacy policy");
    banner.querySelector('[data-choice="granted"]').textContent = tr("Allow analytics");
    banner.querySelector('[data-choice="denied"]').textContent = tr("Decline");
  };
  window.addEventListener?.("rare:language", translateChoices);
  if (window.RareI18n) translateChoices();
  settings.addEventListener("click", () => {
    banner.hidden = false;
    banner.querySelector("button").focus();
  });
  document.body.append(settings);

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-download-platform]");
    if (link) send("event", "app_download_click", { app_platform: link.dataset.downloadPlatform });
  });
  if (choice === "granted") enable();
})();
