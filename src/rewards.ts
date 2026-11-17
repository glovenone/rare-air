import { avatars } from "../public/avatars.js";
import { playerProgress } from "./progression.js";
import { authFailure, type Passport } from "./auth.js";

export function earnedSkyPoints(progress: {
  dailyBest: Record<string, number>;
  chapters: Record<string, { score: number }>;
}) {
  const scores = [
    ...Object.values(progress.dailyBest),
    ...Object.values(progress.chapters).map((chapter) => chapter.score),
  ];
  return scores.reduce(
    (total, score) =>
      total + 10 + Math.floor(Math.min(5000, Math.max(0, score)) / 100),
    0,
  );
}

export async function wardrobeState(db: D1Database, account: Passport) {
  const progress = await playerProgress(
    db,
    account.player,
    new Date().toISOString().slice(0, 10),
  );
  const { results } = await db
    .prepare("SELECT item,cost FROM passport_unlocks WHERE account=?")
    .bind(account.id)
    .all<{ item: string; cost: number }>();
  const earned = earnedSkyPoints(progress);
  const spent = results.reduce((total, item) => total + item.cost, 0);
  const profile = await db
    .prepare("SELECT avatar FROM passports WHERE id=?")
    .bind(account.id)
    .first<{ avatar: string }>();
  return {
    earned,
    spent,
    balance: Math.max(0, earned - spent),
    owned: [
      ...avatars.filter((item) => item.cost === 0).map((item) => item.id),
      ...results.map((item) => item.item),
    ],
    selected: profile?.avatar || "swallow",
  };
}

export async function rewardsApi(
  db: D1Database,
  account: Passport,
  action: string,
  body: Record<string, unknown>,
) {
  const json = (value: unknown) =>
    Response.json(value, { headers: { "Cache-Control": "no-store" } });
  if (action === "wardrobe") return json(await wardrobeState(db, account));
  const item = avatars.find((item) => item.id === body.avatar);
  if (!item) return authFailure("Choose an available pilot icon.");
  if (action === "redeem") {
    const progress = await playerProgress(
      db,
      account.player,
      new Date().toISOString().slice(0, 10),
    );
    const earned = earnedSkyPoints(progress);
    if (item.cost > 0) {
      // D1 evaluates the balance check and insert in one SQLite statement.
      // The unique key makes retries and competing redemptions idempotent.
      await db
        .prepare(
          "INSERT INTO passport_unlocks(account,item,cost,created) SELECT ?,?,?,? WHERE ?-COALESCE((SELECT SUM(cost) FROM passport_unlocks WHERE account=?),0)>=? ON CONFLICT(account,item) DO NOTHING",
        )
        .bind(
          account.id,
          item.id,
          item.cost,
          Date.now(),
          earned,
          account.id,
          item.cost,
        )
        .run();
    }
    const state = await wardrobeState(db, account);
    if (!state.owned.includes(item.id))
      return authFailure("You need more Sky points for this icon.", 409);
    return json(state);
  }
  // Selection and ownership are checked together, including under concurrent requests.
  const result = await db
    .prepare(
      "UPDATE passports SET avatar=? WHERE id=? AND (?=0 OR EXISTS(SELECT 1 FROM passport_unlocks WHERE account=? AND item=?))",
    )
    .bind(item.id, account.id, item.cost, account.id, item.id)
    .run();
  if (!result.meta.changes)
    return authFailure("Redeem this icon before using it.", 409);
  return json(await wardrobeState(db, account));
}
