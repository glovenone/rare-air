import { createRelay, relayAction, publicRelay, relayLimits } from "./relay.js";
import { companions } from "../public/companions.js";
import { playerProgress } from "./progression.js";
import { ratingChanges } from "./rating.js";
import { safeName, limited, hashSecret, type Passport } from "./auth.js";
interface RoomRow {
  code: string;
  state_json: string;
  revision: number;
  expires: number;
}
const failure = (error: string, status = 400) =>
  Response.json(
    { error },
    { status, headers: { "Cache-Control": "no-store" } },
  );
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
async function blocked(
  db: D1Database,
  account: Passport | null,
  room: any,
  creator: string,
) {
  const viewer = account?.id || (await hashSecret(creator));
  const ids = room.players
    .map((p: any) => p.account || p.identity)
    .filter((id: string) => id && id !== viewer);
  if (!ids.length) return false;
  const slots = ids.map(() => "?").join(",");
  return !!(await db
    .prepare(
      `SELECT 1 FROM pilot_blocks WHERE (owner=? AND target IN (${slots})) OR (target=? AND owner IN (${slots})) LIMIT 1`,
    )
    .bind(viewer, ...ids, viewer, ...ids)
    .first());
}
export async function finishRatings(db: D1Database, room: any) {
  if (!room.rated || room.status !== "finished" || !room.startedAt) return;
  const state = publicRelay(room, "", "en", Date.now());
  const players = state.players
    .filter((p: any) => p.account)
    .map((p: any) => ({ account: p.account, rating: p.rating, rank: p.rank }));
  if (players.length !== room.players.length || players.length < 2) return;
  const existing = await db
    .prepare(
      `SELECT id FROM passports WHERE id IN (${players.map(() => "?").join(",")})`,
    )
    .bind(...players.map((p: { account: string }) => p.account))
    .all<{ id: string }>();
  const activeAccounts = new Set(existing.results.map((row) => row.id));
  const changes = ratingChanges(players).filter((item: { account: string }) =>
      activeAccounts.has(item.account),
    ),
    now = Date.now(),
    resultId = room.id || room.code;
  // D1 batch is transactional. applied gates the increment even on a replay or
  // two clients settling the same room concurrently.
  if (!changes.length) return;
  await db.batch(
    changes.flatMap(
      (item: { account: string; delta: number; rank: number }) => [
        db
          .prepare(
            "INSERT OR IGNORE INTO rating_results(room,account,delta,rank,created) VALUES(?,?,?,?,?)",
          )
          .bind(resultId, item.account, item.delta, item.rank, now),
        db
          .prepare(
            "UPDATE passports SET rating=MAX(100,rating+(SELECT delta FROM rating_results WHERE room=? AND account=?)),matches=matches+1 WHERE id=? AND EXISTS(SELECT 1 FROM rating_results WHERE room=? AND account=? AND applied=0)",
          )
          .bind(resultId, item.account, item.account, resultId, item.account),
        db
          .prepare(
            "UPDATE rating_results SET applied=1 WHERE room=? AND account=?",
          )
          .bind(resultId, item.account),
        db
          .prepare("DELETE FROM ranked_seats WHERE account=? AND room=?")
          .bind(item.account, room.code),
      ],
    ),
  );
}
export async function relayApi(
  db: D1Database,
  creator: string,
  action: string,
  body: Record<string, unknown>,
  language: string,
  respond: (data: unknown) => Response,
  account: Passport | null = null,
  matching = false,
): Promise<Response> {
  const now = Date.now(),
    token = typeof body.token === "string" ? body.token : "",
    name = safeName(body.name);
  if (!(await limited(db, "relay:" + creator, 150, 60000)))
    return failure("Please slow down and try again.", 429);
  if (action === "list") {
    const { results } = await db
      .prepare(
        "SELECT code,state_json FROM relay_rooms WHERE visibility='public' AND activity>? AND expires>? ORDER BY activity DESC LIMIT 40",
      )
      .bind(now - 90000, now)
      .all<{ code: string; state_json: string }>();
    const rooms = [];
    for (const row of results) {
      const room = JSON.parse(row.state_json);
      if (
        room.status !== "waiting" ||
        room.rated ||
        room.players.filter((p: any) => !p.left).length >= (room.capacity || 6)
      )
        continue;
      if (await blocked(db, account, room, creator)) continue;
      rooms.push({
        code: row.code,
        name: room.players.find((p: any) => p.token === room.host)?.name || "",
        players: room.players.filter((p: any) => !p.left).length,
        capacity: room.capacity || 6,
      });
    }
    return respond({ rooms });
  }
  if (action === "recover") {
    if (!account) return failure("Open your flight passport first.", 401);
    const seat = await db
      .prepare("SELECT room FROM ranked_seats WHERE account=? AND expires>?")
      .bind(account.id, now)
      .first<{ room: string }>();
    if (!seat)
      return failure("There is no active rated flight to resume.", 404);
    for (let attempt = 0; attempt < 5; attempt++) {
      const row = await db
        .prepare(
          "SELECT state_json,revision,expires FROM relay_rooms WHERE code=?",
        )
        .bind(seat.room)
        .first<RoomRow>();
      if (!row || row.expires <= now)
        return failure("This room has expired or could not be found.", 404);
      const room = JSON.parse(row.state_json),
        self = room.players.find(
          (p: any) => p.account === account.id && !p.left,
        );
      if (!self) return failure("Rejoin this room to take a seat.", 403);
      const next = crypto.randomUUID();
      if (room.host === self.token) room.host = next;
      self.token = next;
      const saved = await db
        .prepare(
          "UPDATE relay_rooms SET state_json=?,revision=revision+1 WHERE code=? AND revision=?",
        )
        .bind(JSON.stringify(room), seat.room, row.revision)
        .run();
      if (saved.meta.changes)
        return respond({
          ...publicRelay(room, next, language, now),
          seatToken: next,
        });
    }
    return failure("The room is busy. Please try again.", 503);
  }
  if (!/^[a-f0-9-]{36}$/.test(token))
    return failure("Open the room again to restore your seat.");
  if ((action === "create" || action === "join" || action === "match") && !name)
    return failure("Enter a pilot name.");
  if (
    action === "answer" &&
    (typeof body.answer !== "string" ||
      body.answer.length > 100 ||
      !Number.isInteger(body.turn))
  )
    return failure("Use an answer under 100 characters.");
  let buddy = account?.buddy || "swallow";
  if (
    !account &&
    ["create", "match", "join"].includes(action) &&
    typeof body.buddy === "string" &&
    body.buddy !== "swallow"
  ) {
    const progress = await playerProgress(
      db,
      creator,
      new Date().toISOString().slice(0, 10),
    );
    const earned = companions.find(
      (item) => item.id === body.buddy && item.days <= progress.streak.best,
    );
    if (earned) buddy = earned.id;
  }
  if (action === "create" || action === "match") {
    const rated = matching && body.rated === true;
    if (rated && !account)
      return failure("Open your flight passport to play rated.", 401);
    await db
      .prepare("DELETE FROM ranked_seats WHERE expires<?")
      .bind(now)
      .run();
    if (rated) {
      const seat = await db
        .prepare("SELECT room FROM ranked_seats WHERE account=?")
        .bind(account!.id)
        .first<{ room: string }>();
      if (seat)
        return failure("Finish or leave your other rated flight first.", 409);
    }
    const rate = await db
      .prepare(
        "SELECT COUNT(*) AS n FROM relay_rooms WHERE creator=? AND created>?",
      )
      .bind(creator, now - 3600000)
      .first<{ n: number }>();
    if ((rate?.n || 0) >= 20)
      return failure(
        "You have created 20 rooms this hour. Try again later.",
        429,
      );
    await db.prepare("DELETE FROM relay_rooms WHERE expires<?").bind(now).run();
    const capacity = [2, 3, 6, 10].includes(Number(body.capacity))
      ? Number(body.capacity)
      : 6;
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = Array.from(
        crypto.getRandomValues(new Uint8Array(6)),
        (v) => alphabet[v % alphabet.length],
      ).join("");
      const room = createRelay(code, name, token, now, {
        capacity,
        visibility: body.visibility === "public" ? "public" : "private",
        rated,
        automatic: matching,
        account: account?.id || null,
        rating: account?.rating || 1000,
        buddy,
        pool: typeof body.pool === "string" ? body.pool : null,
      });
      Object.assign(room.players[0], {
        owner: creator,
        identity: account?.id || (await hashSecret(creator)),
      });
      const saved = await db
        .prepare(
          "INSERT OR IGNORE INTO relay_rooms(code,state_json,creator,created,expires,visibility,pool,activity) VALUES(?,?,?,?,?,?,?,?)",
        )
        .bind(
          code,
          JSON.stringify(room),
          creator,
          now,
          room.expires,
          room.visibility,
          room.pool,
          now,
        )
        .run();
      if (!saved.meta.changes) continue;
      if (rated) {
        const reservation = await db
          .prepare(
            "INSERT OR IGNORE INTO ranked_seats(account,room,expires) VALUES(?,?,?)",
          )
          .bind(account!.id, code, now + 90000)
          .run();
        if (!reservation.meta.changes) {
          await db
            .prepare("DELETE FROM relay_rooms WHERE code=?")
            .bind(code)
            .run();
          return failure("Finish or leave your other rated flight first.", 409);
        }
      }
      return respond(publicRelay(room, token, language, now));
    }
    return failure("A room could not be created. Please try again.", 503);
  }
  const code =
    typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code))
    return failure("Enter a six-character room code.");
  if (!["join", "state", "start", "answer", "leave"].includes(action))
    return failure("Choose an available room action.");
  for (let attempt = 0; attempt < 8; attempt++) {
    const row = await db
      .prepare(
        "SELECT code,state_json,revision,expires FROM relay_rooms WHERE code=?",
      )
      .bind(code)
      .first<RoomRow>();
    if (!row || row.expires <= now)
      return failure("This room has expired or could not be found.", 404);
    const room = JSON.parse(row.state_json);
    if (action === "join") {
      if (room.rated && !matching)
        return failure("Join rated flights through matchmaking.", 403);
      if (await blocked(db, account, room, creator))
        return failure("This flight is unavailable.", 403);
      if (
        room.players.some(
          (p: any) => p.owner === creator && !p.left && p.token !== token,
        )
      )
        return failure("You already have a seat in this flight.", 409);
      if (room.rated && account) {
        const seat = await db
          .prepare("SELECT room FROM ranked_seats WHERE account=?")
          .bind(account.id)
          .first<{ room: string }>();
        if (seat && seat.room !== code)
          return failure("Finish or leave your other rated flight first.", 409);
      }
    }
    if (
      action !== "join" &&
      !room.players.some((p: any) => p.token === token && !p.left)
    )
      return failure("Rejoin this room to take a seat.", 403);
    const result = relayAction(
      room,
      action,
      token,
      {
        ...body,
        name,
        account: account?.id || null,
        rating: account?.rating || 1000,
        buddy,
      },
      language,
      now,
    );
    if (action === "join" && !result.error) {
      const self = room.players.find((p: any) => p.token === token);
      if (self)
        Object.assign(self, {
          owner: creator,
          identity: account?.id || (await hashSecret(creator)),
        });
    }
    if (
      matching &&
      action === "join" &&
      !result.error &&
      room.status === "waiting" &&
      room.players.filter((p: any) => !p.left).length >= (room.capacity || 6)
    )
      relayAction(room, "start", room.host, {}, language, now);
    const encoded = JSON.stringify(room);
    if (encoded !== row.state_json) {
      const updated = await db
        .prepare(
          "UPDATE relay_rooms SET state_json=?,revision=revision+1,activity=? WHERE code=? AND revision=?",
        )
        .bind(encoded, now, code, row.revision)
        .run();
      if (!updated.meta.changes) continue;
    } else if (
      action === "state" &&
      room.status === "waiting" &&
      room.host === token
    )
      await db
        .prepare("UPDATE relay_rooms SET activity=? WHERE code=?")
        .bind(now, code)
        .run();
    if (result.error)
      return failure(result.error, result.forbidden ? 403 : 409);
    if (room.rated && action === "join" && account) {
      const reserved = await db
        .prepare(
          "INSERT OR IGNORE INTO ranked_seats(account,room,expires) VALUES(?,?,?)",
        )
        .bind(
          account.id,
          code,
          room.status === "waiting" ? now + 90000 : room.expires,
        )
        .run();
      if (!reserved.meta.changes) {
        const seat = await db
          .prepare("SELECT room FROM ranked_seats WHERE account=?")
          .bind(account.id)
          .first<{ room: string }>();
        if (seat?.room !== code)
          return failure("Finish or leave your other rated flight first.", 409);
      }
    }
    if (room.rated && room.status === "playing")
      await db
        .prepare("UPDATE ranked_seats SET expires=? WHERE room=?")
        .bind(room.expires, code)
        .run();
    if (room.rated && room.status === "waiting" && account)
      await db
        .prepare("UPDATE ranked_seats SET expires=? WHERE account=? AND room=?")
        .bind(now + 90000, account.id, code)
        .run();
    if (action === "leave" && account)
      await db
        .prepare("DELETE FROM ranked_seats WHERE account=? AND room=?")
        .bind(account.id, code)
        .run();
    await finishRatings(db, room);
    const ratings =
      room.rated && room.status === "finished"
        ? (
            await db
              .prepare(
                "SELECT account,delta FROM rating_results WHERE room=? AND applied=1",
              )
              .bind(room.id || code)
              .all()
          ).results
        : [];
    return respond({
      ...publicRelay(room, token, language, now),
      feedback: result.feedback || null,
      ratings,
    });
  }
  return failure("The room is busy. Please try again.", 503);
}
