import { createOfflineClient } from "../native/offline.js";

// Practice scores stay on this device. Server-ranked flights use server identity.
const offlineRequest = createOfflineClient((count) =>
  Array.from({ length: count }, () => Math.floor(Math.random() * 4294967296)),
);
const origin = process.env.SITE_URL || "https://krillionunlimited.top";

export function readStorage(key, fallback) {
  try {
    return wx.getStorageSync("rare-air:" + key) || fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    wx.setStorageSync("rare-air:" + key, value);
  } catch {
    wx.showToast({ title: "Device storage is full", icon: "none" });
  }
}

export async function request(path, body) {
  if (body?.mode === "offline" || body?.id?.startsWith("offline:"))
    return offlineRequest(path, body);
  return new Promise((resolve, reject) => {
    wx.request({
      url: origin + "/api/" + path,
      method: body ? "POST" : "GET",
      header: {
        "Content-Type": "application/json",
        Origin: origin,
        Cookie: readStorage("cookie", ""),
      },
      data: body,
      timeout: 12000,
      success(response) {
        const cookies = response.cookies || [];
        const playerCookie = cookies
          .map((cookie) => cookie.split(";")[0])
          .find((cookie) => cookie.startsWith("rare_player="));
        if (playerCookie) writeStorage("cookie", playerCookie);
        if (response.statusCode >= 200 && response.statusCode < 300)
          resolve(response.data);
        else reject(new Error(response.data?.error || "Please retry your flight."));
      },
      fail() {
        reject(new Error("Daily flights need a connection. Offline practice is available."));
      },
    });
  });
}
