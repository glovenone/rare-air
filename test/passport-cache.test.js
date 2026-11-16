import test from "node:test";
import assert from "node:assert/strict";
import {
  reconcilePassportCache,
  createFlightIdentityGate,
} from "../public/passport-cache.js";
function stored(owner) {
  const data = new Map(
    [
      "history",
      "sessions",
      "practice",
      "progression",
      "offline-history",
      "language",
      "analytics",
    ].map((k) => ["rare:" + k, "retained-" + k]),
  );
  if (owner !== undefined) data.set("rare:passport-owner", owner);
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => data.set(k, v),
    removeItem: (k) => data.delete(k),
    data,
  };
}
test("expired passport removes only the prior online identity cache", () => {
  const s = stored("pilot-a");
  assert.equal(reconcilePassportCache(s, null), true);
  for (const key of ["history", "sessions", "practice", "progression"])
    assert.equal(s.getItem("rare:" + key), null);
  for (const key of ["offline-history", "language", "analytics"])
    assert.equal(s.getItem("rare:" + key), "retained-" + key);
  assert.equal(s.getItem("rare:passport-owner"), "guest");
});
test("switching between passports clears stale server-derived scores and active game IDs", () => {
  const s = stored("pilot-a");
  assert.equal(reconcilePassportCache(s, { id: "pilot-b" }), true);
  assert.equal(s.getItem("rare:history"), null);
  assert.equal(s.getItem("rare:passport-owner"), "pilot-b");
});
test("same-passport startup preserves resumable daily IDs and cached scores", () => {
  const s = stored("pilot-a");
  assert.equal(reconcilePassportCache(s, { id: "pilot-a" }), false);
  assert.equal(s.getItem("rare:sessions"), "retained-sessions");
  assert.equal(s.getItem("rare:history"), "retained-history");
});
test("unmarked legacy guests keep their history while an unattributed account cache is isolated", () => {
  const guest = stored();
  assert.equal(reconcilePassportCache(guest, null), false);
  assert.equal(guest.getItem("rare:history"), "retained-history");
  const account = stored();
  assert.equal(reconcilePassportCache(account, { id: "pilot-a" }), true);
  assert.equal(account.getItem("rare:history"), null);
});
test("unavailable storage does not prevent passport authentication", () => {
  assert.doesNotThrow(() =>
    reconcilePassportCache(
      {
        getItem() {
          throw Error("Storage denied");
        },
      },
      { id: "pilot-a" },
    ),
  );
});

test("a response or countdown from an old flight identity is discarded", async () => {
  const gate = createFlightIdentityGate();
  let resolve;
  const result = gate.run(() => new Promise((r) => (resolve = r)));
  const checkpoint = gate.checkpoint();
  gate.reset();
  resolve({ id: "old-account-flight" });
  await assert.rejects(result, { name: "IdentityChangedError" });
  assert.throws(() => gate.assertCurrent(checkpoint), {
    name: "IdentityChangedError",
  });
  assert.deepEqual(await gate.run(async () => ({ id: "new-account-flight" })), {
    id: "new-account-flight",
  });
});

test("old network failures are canceled while current-identity failures remain actionable", async () => {
  const gate = createFlightIdentityGate();
  let reject;
  const pending = gate.run(() => new Promise((_, r) => (reject = r)));
  gate.reset();
  reject(Error("Old network failure"));
  await assert.rejects(pending, { name: "IdentityChangedError" });
  await assert.rejects(
    gate.run(async () => {
      throw Error("Current network failure");
    }),
    /Current network failure/,
  );
});
