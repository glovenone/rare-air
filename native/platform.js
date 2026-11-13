import { Capacitor, CapacitorHttp } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Share } from "@capacitor/share";
import { App } from "@capacitor/app";
import { Network } from "@capacitor/network";
import { offlineRequest } from "./offline.js";

export const native = Capacitor.isNativePlatform();
export const publicOrigin =
  process.env.SITE_URL || "https://krillionunlimited.top";

export async function request(path, body) {
  if (body?.mode === "offline" || body?.id?.startsWith("offline:"))
    return offlineRequest(path, body);
  const response = await CapacitorHttp.request({
    url: publicOrigin + "/api/" + path,
    method: body ? "POST" : "GET",
    headers: {
      Origin: publicOrigin,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    data: body,
    responseType: "json",
    connectTimeout: 12000,
    readTimeout: 12000,
  });
  const data =
    typeof response.data === "string"
      ? JSON.parse(response.data)
      : response.data;
  if (response.status < 200 || response.status >= 300)
    throw new Error(
      data.error || "The flight connection is unavailable. Please retry.",
    );
  return data;
}
export async function haptic(tier) {
  try {
    if (tier >= 3)
      await Haptics.notification({ type: NotificationType.Success });
    else
      await Haptics.impact({
        style: ImpactStyle.Light,
      });
  } catch {
    /* Some tablets and simulators have no haptic hardware. */
  }
}
export async function shareFlight(text) {
  try {
    await Share.share({
      title: "My RARE Air flight",
      text,
      dialogTitle: "Share your flight",
    });
    return "shared";
  } catch (error) {
    if (/cancel/i.test(error?.message || "")) return "cancelled";
    throw error;
  }
}
if (native) {
  document.documentElement.classList.add("native-app");
  App.addListener("backButton", ({ canGoBack }) => {
    const dialog = document.querySelector("dialog[open]");
    if (dialog) dialog.close();
    else if (document.body.dataset.view === "launch") return;
    else if (document.body.dataset.view !== "home")
      document.getElementById("back-home").click();
    else if (canGoBack) history.back();
    else App.exitApp();
  });
  Network.addListener("networkStatusChange", ({ connected }) => {
    window.dispatchEvent(
      new CustomEvent("rare:network", { detail: { connected } }),
    );
  });
  App.addListener("appStateChange", ({ isActive }) => {
    if (isActive) window.dispatchEvent(new Event("rare:resume"));
  });
}
