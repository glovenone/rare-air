import test from "node:test";
import assert from "node:assert/strict";
const values = new Map();
let eventTarget = new EventTarget();
globalThis.window = eventTarget;
globalThis.localStorage = {
  getItem: (k) => values.get(k) ?? null,
  setItem: (k, v) => values.set(k, v),
  removeItem: (k) => values.delete(k),
};
globalThis.document = {
  documentElement: { lang: "en" },
  getElementById: () => ({ textContent: "", onclick: null }),
  querySelector: () => null,
};
globalThis.location = { href: "http://localhost/" };
globalThis.addEventListener = eventTarget.addEventListener.bind(eventTarget);
const { initPassport } = await import("../public/passport.js");
const tick = () => new Promise((resolve) => setImmediate(resolve));
function deferred() {
  let resolve;
  const promise = new Promise((r) => (resolve = r));
  return { promise, resolve };
}
function fixtures() {
  eventTarget = new EventTarget();
  globalThis.window = eventTarget;
  globalThis.addEventListener = eventTarget.addEventListener.bind(eventTarget);
  values.clear();
  values.set("rare:passport-owner", "pilot-a");
  values.set("rare:sessions", "active-daily-id");
  values.set("rare:offline-history", "offline-stays");
}
test("background passport history refresh does not reset an active flight or lose its resume ID", async () => {
  fixtures();
  const history = deferred();
  let identities = 0,
    refreshes = 0;
  const onIdentity = () => identities++,
    onHistory = () => refreshes++;
  eventTarget.addEventListener("rare:identity", onIdentity);
  eventTarget.addEventListener("rare:history", onHistory);
  initPassport({
    request: (path) =>
      path === "passport"
        ? Promise.resolve({
            account: {
              id: "pilot-a",
              name: "A",
              buddy: "swallow",
              trail: "classic",
            },
          })
        : history.promise,
    openDialog() {
      throw Error("Unexpected dialog");
    },
    native: false,
    publicOrigin: "http://localhost/",
  });
  await tick();
  assert.equal(identities, 0); // A flight can start while history is pending.
  history.resolve({
    entries: [
      { mode: "daily", day: "2026-11-16", score: 1000, tiers: "4,0,0,0,0" },
    ],
  });
  await tick();
  assert.equal(identities, 0);
  assert.equal(refreshes, 1);
  assert.equal(values.get("rare:sessions"), "active-daily-id");
  assert.equal(
    JSON.parse(values.get("rare:history"))["2026-11-16"].score,
    1000,
  );
  eventTarget.removeEventListener("rare:identity", onIdentity);
  eventTarget.removeEventListener("rare:history", onHistory);
});
test("an expired passport clears prior account history even when startup has no signed-in account", async () => {
  fixtures();
  values.set("rare:history", "old-private-account-history");
  let identities = 0;
  const listener = () => identities++;
  eventTarget.addEventListener("rare:identity", listener);
  initPassport({
    request: () => Promise.resolve({ account: null }),
    openDialog() {},
    native: false,
    publicOrigin: "http://localhost/",
  });
  await tick();
  assert.equal(identities, 1);
  assert.equal(values.get("rare:history"), undefined);
  assert.equal(values.get("rare:sessions"), undefined);
  assert.equal(values.get("rare:offline-history"), "offline-stays");
  eventTarget.removeEventListener("rare:identity", listener);
});
test("a late history response from a prior account cannot repopulate the new identity cache", async () => {
  fixtures();
  const history = deferred();
  let account = {
    id: "pilot-a",
    name: "A",
    buddy: "swallow",
    trail: "classic",
  };
  const passport = initPassport({
    request: (path) =>
      path === "passport" ? Promise.resolve({ account }) : history.promise,
    openDialog() {},
    native: false,
    publicOrigin: "http://localhost/",
  });
  await tick();
  account = { id: "pilot-b", name: "B", buddy: "swallow", trail: "classic" };
  await passport.load();
  history.resolve({
    entries: [
      { mode: "daily", day: "2026-11-16", score: 5000, tiers: "4,4,4,4,4" },
    ],
  });
  await tick();
  assert.equal(passport.account().id, "pilot-b");
  assert.equal(values.get("rare:history"), undefined);
  assert.equal(values.get("rare:passport-owner"), "pilot-b");
});
test("out-of-order passport status responses keep the most recently requested identity", async () => {
  fixtures();
  let queued = null;
  const passport = initPassport({
    request: (path) =>
      path === "passport"
        ? queued
          ? queued.shift().promise
          : Promise.resolve({
              account: {
                id: "pilot-a",
                name: "A",
                buddy: "swallow",
                trail: "classic",
              },
            })
        : Promise.resolve({ entries: [] }),
    openDialog() {},
    native: false,
    publicOrigin: "http://localhost/",
  });
  await tick();
  const earlier = deferred(),
    later = deferred();
  queued = [earlier, later];
  const first = passport.load(),
    second = passport.load();
  later.resolve({ account: { id: "pilot-b", name: "B" } });
  await second;
  earlier.resolve({ account: { id: "pilot-a", name: "A" } });
  await first;
  assert.equal(passport.account().id, "pilot-b");
  assert.equal(values.get("rare:passport-owner"), "pilot-b");
});

test("an open tab resets its active flight when another tab changes passport identity", async () => {
  fixtures();
  let account = {
    id: "pilot-a",
    name: "A",
    buddy: "swallow",
    trail: "classic",
  };
  const passport = initPassport({
    request: (path) =>
      Promise.resolve(path === "passport" ? { account } : { entries: [] }),
    openDialog() {},
    native: false,
    publicOrigin: "http://localhost/",
  });
  await tick();
  let identities = 0;
  const listener = () => identities++;
  eventTarget.addEventListener("rare:identity", listener);
  account = null;
  values.set("rare:passport-owner", "guest");
  values.delete("rare:history");
  values.delete("rare:sessions");
  const event = new Event("storage");
  Object.defineProperty(event, "key", { value: "rare:passport-owner" });
  eventTarget.dispatchEvent(event);
  await tick();
  assert.equal(passport.account(), null);
  assert(identities >= 1);
  assert.equal(values.get("rare:history"), undefined);
  assert.equal(values.get("rare:offline-history"), "offline-stays");
  eventTarget.removeEventListener("rare:identity", listener);
});
