// This marker is a public passport ID, never an authentication capability.
const marker = "rare:passport-owner";
const onlineKeys = ["history", "sessions", "practice", "progression"];
export function reconcilePassportCache(storage, account) {
  const owner = account?.id || "guest";
  try {
    const previous = storage.getItem(marker);
    // Keep unmarked guest history from versions predating passports. An
    // unmarked signed-in cache cannot be safely attributed to this account.
    const changed = previous === null ? owner !== "guest" : previous !== owner;
    if (changed)
      for (const key of onlineKeys) storage.removeItem("rare:" + key);
    storage.setItem(marker, owner);
    return changed;
  } catch {
    // If storage is unavailable, there is no readable persistent cache to leak.
    return false;
  }
}

// Pending game responses belong to the identity that initiated them.
export function createFlightIdentityGate() {
  let revision = 0;
  function assertCurrent(checkpoint) {
    if (checkpoint !== revision) {
      const error = new Error();
      error.name = "IdentityChangedError";
      throw error;
    }
  }
  return {
    checkpoint: () => revision,
    reset: () => {
      revision++;
    },
    assertCurrent,
    async run(request) {
      const checkpoint = revision;
      try {
        const result = await request();
        assertCurrent(checkpoint);
        return result;
      } catch (error) {
        assertCurrent(checkpoint);
        throw error;
      }
    },
  };
}
