import {
  accountSession,
  authFailure,
  cookieValue,
  hashSecret,
  limited,
  newSecret,
  passkeyApi,
  safeName,
  type Passport,
} from "./auth.js";
import { questions } from "./questions.js";
import { answerLabel } from "./localization.js";
import { resolveLocale } from "../public/locales.js";
import { rewardsApi } from "./rewards.js";
import { playerProgress } from "./progression.js";
export async function passportApi(
  req: Request,
  db: D1Database,
  action: string,
  b: Record<string, unknown>,
  guest: string,
  account: Passport | null,
) {
  const now = Date.now(),
    today = new Date().toISOString().slice(0, 10);
  if (action.startsWith("passkey-"))
    return passkeyApi(req, db, action, b, account?.player || guest, account);
  const json = (data: unknown) =>
    Response.json(data, { headers: { "Cache-Control": "no-store" } });
  const ip = req.headers.get("CF-Connecting-IP") || guest;
  if (action === "status") {
    if (!account) return json({ account: null });
    const keyCount = await db
      .prepare("SELECT COUNT(*) AS n FROM passkeys WHERE account=?")
      .bind(account.id)
      .first<{ n: number }>();
    const linked = await db
      .prepare("SELECT account FROM passport_players WHERE player=?")
      .bind(guest)
      .first<{ account: string }>();
    const recent = await db
      .prepare(
        "SELECT id,day,mode,round FROM sessions WHERE player=? AND round=5 LIMIT 1",
      )
      .bind(guest)
      .first();
    const { player: privatePlayer, ...publicAccount } = account;
    return json({
      account: publicAccount,
      passkeys: keyCount?.n || 0,
      canImport: !!recent && !linked,
    });
  }
  if (action === "create" || action === "recover") {
    if (!(await limited(db, "passport:" + ip, 10)))
      return authFailure("Too many sign-in attempts. Try again later.", 429);
    if (action === "create") {
      if (account)
        return authFailure("Sign out before creating another passport.", 409);
      const name = safeName(b.name);
      if (!name) return authFailure("Enter a pilot name.");
      const id = crypto.randomUUID(),
        recovery = newSecret();
      await db
        .prepare(
          "INSERT INTO passports(id,player,name,recovery_hash,created) VALUES(?,?,?,?,?)",
        )
        .bind(id, crypto.randomUUID(), name, await hashSecret(recovery), now)
        .run();
      return accountSession(db, id, req, { ok: true, recovery });
    }
    if (
      typeof b.recovery !== "string" ||
      !/^[a-f0-9]{64}$/i.test(b.recovery.replace(/[\s-]/g, ""))
    )
      return authFailure("Enter your complete recovery code.");
    const found = await db
      .prepare("SELECT id FROM passports WHERE recovery_hash=?")
      .bind(await hashSecret(b.recovery.replace(/[\s-]/g, "").toLowerCase()))
      .first<{ id: string }>();
    if (!found) return authFailure("The recovery code could not be verified.");
    return accountSession(db, found.id, req, { ok: true });
  }
  if (action === "logout") {
    const hash = await hashSecret(
      cookieValue(
        req,
        new URL(req.url).protocol === "https:"
          ? "__Host-rare_passport"
          : "rare_passport",
      ),
    );
    await db
      .prepare("DELETE FROM passport_sessions WHERE hash=?")
      .bind(hash)
      .run();
    const headers = new Headers({ "Cache-Control": "no-store" }),
      secure = new URL(req.url).protocol === "https:" ? "; Secure" : "";
    headers.append(
      "Set-Cookie",
      `${new URL(req.url).protocol === "https:" ? "__Host-rare_passport" : "rare_passport"}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`,
    );
    headers.append(
      "Set-Cookie",
      `rare_player=${crypto.randomUUID()}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000${secure}`,
    );
    return Response.json({ ok: true }, { headers });
  }
  if (!account) return authFailure("Open your flight passport first.", 401);
  if (!(await limited(db, "social:" + account.id, 120, 60000)))
    return authFailure("Please slow down and try again.", 429);
  if (action === "import") {
    if (b.confirm !== true)
      return authFailure("Confirm before importing this device history.");
    const previous = await db
      .prepare("SELECT account FROM passport_players WHERE player=?")
      .bind(guest)
      .first<{ account: string }>();
    if (previous && previous.account !== account.id)
      return authFailure(
        "This device history belongs to another passport.",
        409,
      );
    if (guest !== account.player)
      await db
        .prepare(
          "INSERT OR IGNORE INTO passport_players(player,account) VALUES(?,?)",
        )
        .bind(guest, account.id)
        .run();
    const linked = await db
      .prepare("SELECT account FROM passport_players WHERE player=?")
      .bind(guest)
      .first<{ account: string }>();
    if (guest !== account.player && linked?.account !== account.id)
      return authFailure(
        "This device history belongs to another passport.",
        409,
      );
    return json({ ok: true });
  }
  if (action === "history") {
    const { results } = await db
      .prepare(
        "SELECT s.id,s.day,s.mode,s.seed,s.completed_at,SUM(a.points) AS score,GROUP_CONCAT(a.tier) AS tiers FROM sessions s JOIN answers a ON a.session=s.id WHERE (s.player=? OR s.player IN (SELECT player FROM passport_players WHERE account=?)) AND s.round=5 GROUP BY s.id ORDER BY s.created DESC LIMIT 500",
      )
      .bind(account.player, account.id)
      .all();
    return json({ entries: results });
  }
  if (["wardrobe", "redeem", "avatar"].includes(action))
    return rewardsApi(db, account, action, b);
  if (action === "profile") {
    const name = safeName(b.name);
    if (!name) return authFailure("Enter a pilot name.");
    await db
      .prepare("UPDATE passports SET name=? WHERE id=?")
      .bind(name, account.id)
      .run();
    return json({ ok: true });
  }
  if (action === "preferences") {
    const progress = await playerProgress(db, account.player, today);
    const { companions } = await import("../public/companions.js");
    const buddy = companions.find(
      (item) => item.id === b.buddy && item.days <= progress.streak.best,
    );
    if (b.buddy !== undefined && !buddy)
      return authFailure(
        "Complete more daily flights to unlock this companion.",
        409,
      );
    if (
      b.trail !== undefined &&
      !progress.unlockedTrails.includes(String(b.trail))
    )
      return authFailure(
        "Complete more daily flights to unlock this trail.",
        409,
      );
    await db
      .prepare("UPDATE passports SET buddy=?,trail=? WHERE id=?")
      .bind(
        buddy?.id || account.buddy,
        typeof b.trail === "string" ? b.trail : account.trail,
        account.id,
      )
      .run();
    return json({ ok: true });
  }
  if (action === "invite") {
    const code = newSecret();
    await db
      .prepare("DELETE FROM friend_invites WHERE expires<?")
      .bind(now)
      .run();
    await db
      .prepare("INSERT INTO friend_invites(hash,account,expires) VALUES(?,?,?)")
      .bind(await hashSecret(code), account.id, now + 7 * 86400000)
      .run();
    return json({ code, expires: now + 7 * 86400000 });
  }
  if (action === "invite-preview" || action === "accept") {
    const code = typeof b.code === "string" ? b.code : "";
    if (!/^[a-f0-9]{64}$/.test(code))
      return authFailure("This friend invitation is invalid.");
    const invite = await db
      .prepare(
        "SELECT p.id,p.name FROM friend_invites i JOIN passports p ON p.id=i.account WHERE i.hash=? AND i.expires>?",
      )
      .bind(await hashSecret(code), now)
      .first<{ id: string; name: string }>();
    if (!invite) return authFailure("This friend invitation has expired.", 404);
    if (invite.id === account.id)
      return authFailure("Invite another pilot with this link.");
    const blocked = await db
      .prepare(
        "SELECT 1 FROM pilot_blocks WHERE (owner=? AND target=?) OR (owner=? AND target=?)",
      )
      .bind(account.id, invite.id, invite.id, account.id)
      .first();
    if (blocked) return authFailure("This friendship is unavailable.", 403);
    if (action === "invite-preview") return json({ pilot: invite });
    const [a, c] = [account.id, invite.id].sort();
    await db
      .prepare("INSERT OR IGNORE INTO friendships(a,b,created) VALUES(?,?,?)")
      .bind(a, c, now)
      .run();
    return json({ ok: true });
  }
  if (action === "friends") {
    const { results } = await db
      .prepare(
        "SELECT p.id,p.name,p.rating,p.matches,p.buddy,p.avatar FROM friendships f JOIN passports p ON p.id=CASE WHEN f.a=? THEN f.b ELSE f.a END WHERE f.a=? OR f.b=?",
      )
      .bind(account.id, account.id, account.id)
      .all();
    return json({ entries: results });
  }
  if (action === "unfriend" || action === "block" || action === "unblock") {
    const target = typeof b.target === "string" ? b.target : "";
    if (
      !/^(?:[a-f0-9-]{36}|[a-f0-9]{64})$/.test(target) ||
      target === account.id
    )
      return authFailure("Choose another pilot.");
    if (action === "unblock") {
      await db
        .prepare("DELETE FROM pilot_blocks WHERE owner=? AND target=?")
        .bind(account.id, target)
        .run();
      return json({ ok: true });
    }
    const [a, c] = [account.id, target].sort();
    const statements = [
      db.prepare("DELETE FROM friendships WHERE a=? AND b=?").bind(a, c),
    ];
    if (action === "block")
      statements.push(
        db
          .prepare(
            "INSERT OR IGNORE INTO pilot_blocks(owner,target) VALUES(?,?)",
          )
          .bind(account.id, target),
      );
    await db.batch(statements);
    return json({ ok: true });
  }
  if (action === "blocked") {
    const { results } = await db
      .prepare(
        "SELECT b.target,p.name FROM pilot_blocks b LEFT JOIN passports p ON p.id=b.target WHERE b.owner=?",
      )
      .bind(account.id)
      .all();
    return json({ entries: results });
  }
  if (action === "report") {
    const target = typeof b.target === "string" ? b.target.slice(0, 64) : "",
      reason =
        typeof b.reason === "string" ? b.reason.trim().slice(0, 300) : "";
    if (!target || !reason)
      return authFailure("Describe the problem before sending a report.");
    if (!(await limited(db, "reports:" + account.id, 5)))
      return authFailure(
        "Your reports have been received. Please try again later.",
        429,
      );
    await db
      .prepare(
        "INSERT INTO pilot_reports(id,reporter,target,room,reason,created) VALUES(?,?,?,?,?,?)",
      )
      .bind(
        crypto.randomUUID(),
        account.id,
        target,
        typeof b.room === "string" ? b.room.slice(0, 6) : null,
        reason,
        now,
      )
      .run();
    return json({ ok: true });
  }
  if (action === "friend-board") {
    const day = typeof b.day === "string" ? b.day : today;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || day > today)
      return authFailure("Choose an available puzzle date.");
    const completed = await db
      .prepare(
        "SELECT id FROM sessions WHERE (player=? OR player IN (SELECT player FROM passport_players WHERE account=?)) AND mode='daily' AND day=? AND round=5 LIMIT 1",
      )
      .bind(account.player, account.id, day)
      .first();
    if (!completed) return json({ locked: true, day, entries: [] });
    const { results } = await db
      .prepare(
        `WITH people AS (
   SELECT id,name,player FROM passports WHERE id=? OR id IN (SELECT CASE WHEN a=? THEN b ELSE a END FROM friendships WHERE a=? OR b=?)
  ), scored AS (
   SELECT p.id,p.name,s.id AS session,SUM(a.points) AS score,
    json_group_array(json_object('round',a.round,'label',a.label,'points',a.points,'question',a.question,'correct',a.correct)) FILTER(WHERE a.session IS NOT NULL) AS answers,
    ROW_NUMBER() OVER(PARTITION BY p.id ORDER BY SUM(a.points) DESC,s.created ASC) AS position
   FROM people p LEFT JOIN sessions s ON (s.player=p.player OR s.player IN (SELECT player FROM passport_players WHERE account=p.id)) AND s.mode='daily' AND s.day=? AND s.round=5
   LEFT JOIN answers a ON a.session=s.id GROUP BY p.id,s.id
  ) SELECT id,name,score,answers FROM scored WHERE position=1 ORDER BY COALESCE(score,-1) DESC`,
      )
      .bind(account.id, account.id, account.id, account.id, day)
      .all<{
        id: string;
        name: string;
        score: number | null;
        answers: string;
      }>();
    const language = resolveLocale(b.language).code;
    return json({
      locked: false,
      day,
      entries: results.map((row) => ({
        ...row,
        answers: JSON.parse(row.answers)
          .sort(
            (a: { round: number }, b: { round: number }) => a.round - b.round,
          )
          .map(
            (answer: {
              round: number;
              label: string;
              points: number;
              question: string;
              correct: number;
            }) => {
              const question = questions.find((q) => q.id === answer.question);
              return {
                round: answer.round,
                points: answer.points,
                label:
                  answer.correct && question
                    ? answerLabel(question, answer.label, language)
                    : answer.label,
              };
            },
          ),
      })),
    });
  }
  if (action === "rotate" || action === "delete") {
    if (typeof b.recovery !== "string")
      return authFailure("Confirm with your current recovery code.");
    const current = await db
      .prepare("SELECT id FROM passports WHERE id=? AND recovery_hash=?")
      .bind(
        account.id,
        await hashSecret(b.recovery.replace(/[\s-]/g, "").toLowerCase()),
      )
      .first();
    if (!current)
      return authFailure("The recovery code could not be verified.");
    if (action === "rotate") {
      const recovery = newSecret();
      await db.batch([
        db
          .prepare("UPDATE passports SET recovery_hash=? WHERE id=?")
          .bind(await hashSecret(recovery), account.id),
        db
          .prepare("DELETE FROM passport_sessions WHERE account=?")
          .bind(account.id),
      ]);
      return accountSession(db, account.id, req, { recovery });
    }
    if (b.confirm !== true)
      return authFailure("Confirm before deleting your passport.");
    await db.batch([
      db
        .prepare(
          "DELETE FROM answers WHERE session IN (SELECT id FROM sessions WHERE player=? OR player IN (SELECT player FROM passport_players WHERE account=?))",
        )
        .bind(account.player, account.id),
      db
        .prepare(
          "DELETE FROM sessions WHERE player=? OR player IN (SELECT player FROM passport_players WHERE account=?)",
        )
        .bind(account.player, account.id),
      db.prepare("DELETE FROM pilot_reports WHERE reporter=?").bind(account.id),
      db.prepare("DELETE FROM passports WHERE id=?").bind(account.id),
    ]);
    return Response.json(
      { ok: true },
      {
        headers: {
          "Cache-Control": "no-store",
          "Set-Cookie": `${new URL(req.url).protocol === "https:" ? "__Host-rare_passport" : "rare_passport"}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${new URL(req.url).protocol === "https:" ? "; Secure" : ""}`,
        },
      },
    );
  }
  return authFailure("Choose an available passport action.", 404);
}
