import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const origin = process.env.TEST_URL || "http://127.0.0.1:8791";
if (!["localhost", "127.0.0.1"].includes(new URL(origin).hostname))
  throw Error("Local test fixtures only");
const cookies = new Map([["rare_player", crypto.randomUUID()]]);
async function call(path, body = {}, jar = cookies) {
  const response = await fetch(origin + "/api/" + path, {
    method: path === "passport" ? "GET" : "POST",
    headers: {
      Cookie: [...jar].map(([k, v]) => k + "=" + v).join("; "),
      "Content-Type": "application/json",
    },
    body: path === "passport" ? undefined : JSON.stringify(body),
  });
  for (const line of response.headers.getSetCookie()) {
    const pair = line.split(";")[0],
      index = pair.indexOf("=");
    jar.set(pair.slice(0, index), pair.slice(index + 1));
  }
  return { status: response.status, data: await response.json() };
}
const sql = (command) =>
  execFileSync(
    "node_modules/.bin/wrangler",
    ["d1", "execute", "DB", "--local", "--command", command],
    { stdio: "pipe" },
  );
assert.equal((await call("passport/wardrobe")).status, 401);
const created = await call("passport/create", { name: "Reward validation" });
assert.equal(created.status, 200);
const account = (await call("passport")).data.account;
assert.equal(account.avatar, "swallow");
let state = (await call("passport/wardrobe")).data;
assert.equal(state.balance, 0);
assert.equal(state.owned.length, 3);
assert.equal((await call("passport/avatar", { avatar: "wren" })).status, 200);
assert.equal((await call("passport/avatar", { avatar: "dragon" })).status, 409);
assert.equal(
  (
    await call("passport/redeem", {
      avatar: "dragon",
      cost: -100,
      earned: 99999,
    })
  ).status,
  409,
);
assert.equal((await call("passport/redeem", { avatar: "bad" })).status, 400);
const privatePlayer = crypto.randomUUID();
// Historical guest chapter progress is imported through the actual consent path.
const fixtureCookie = new Map([
  ["rare_player", privatePlayer],
  ["rare_passport", cookies.get("rare_passport")],
]);
const today = new Date().toISOString().slice(0, 10);
const rows = Array.from({ length: 7 }, (_, i) => {
  const id = crypto.randomUUID();
  return `INSERT INTO sessions(id,player,day,mode,seed,round,started,created,name,completed_at) VALUES('${id}','${privatePlayer}','${today}','practice','chapter:world-0${i + 1}:${id}',5,0,${Date.now()},'Fixture',${Date.now()}); INSERT INTO answers(session,round,question,answer,label,tier,points,correct,timed_out) VALUES('${id}',0,'fixture','','',4,5000,1,0)`;
});
sql(rows.join(";"));
assert.equal(
  (await call("passport/import", { confirm: true }, fixtureCookie)).status,
  200,
);
state = (await call("passport/wardrobe")).data;
assert.equal(state.balance, 420);
const duplicates = await Promise.all(
  Array.from({ length: 4 }, () => call("passport/redeem", { avatar: "moth" })),
);
assert(duplicates.every((result) => result.status === 200));
state = (await call("passport/wardrobe")).data;
assert.equal(state.balance, 300);
assert.equal(state.spent, 120);
assert.equal((await call("passport/redeem", { avatar: "moth" })).status, 200);
const races = await Promise.all([
  call("passport/redeem", { avatar: "phoenix" }),
  call("passport/redeem", { avatar: "ray" }),
]);
assert.deepEqual(races.map((result) => result.status).sort(), [200, 409]);
const winner = races[0].status === 200 ? "phoenix" : "ray";
const spent = winner === "phoenix" ? 300 : 360;
state = (await call("passport/wardrobe")).data;
assert.equal(state.spent, spent);
assert.equal(state.balance, 420 - spent);
assert.equal((await call("passport/avatar", { avatar: winner })).status, 200);
const restored = new Map([["rare_player", crypto.randomUUID()]]);
assert.equal(
  (
    await call(
      "passport/recover",
      { recovery: created.data.recovery },
      restored,
    )
  ).status,
  200,
);
assert.equal(
  (await call("passport/wardrobe", {}, restored)).data.selected,
  winner,
);
assert.equal(
  (await call("passport/redeem", { avatar: "moth" }, restored)).data.balance,
  420 - spent,
);
assert.equal(
  (
    await call("passport/delete", {
      recovery: created.data.recovery,
      confirm: true,
    })
  ).status,
  200,
);
const remaining = execFileSync(
  "node_modules/.bin/wrangler",
  [
    "d1",
    "execute",
    "DB",
    "--local",
    "--json",
    "--command",
    `SELECT COUNT(*) AS n FROM passport_unlocks WHERE account='${account.id}'`,
  ],
  { encoding: "utf8" },
);
assert.equal(JSON.parse(remaining)[0].results[0].n, 0);
console.log(
  "PASS rewards D1 integration: guest protection, free icons, forged balance rejection, imported history, idempotent and concurrent redemption, recovery, selection and deletion cascade.",
);
