import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { questions } from "../src/questions.js";
import { encodeCBOR } from "@levischuck/tiny-cbor";
const base = process.env.TEST_URL || "http://127.0.0.1:8787";
const sql = (command) =>
  JSON.parse(
    execFileSync(
      "node_modules/.bin/wrangler",
      ["d1", "execute", "DB", "--local", "--json", "--command", command],
      { encoding: "utf8" },
    ),
  );
function client(guest = crypto.randomUUID()) {
  const cookies = new Map([["rare_player", guest]]);
  const call = async (path, body, headers = {}) => {
    const response = await fetch(base + "/api/" + path, {
      method: body ? "POST" : "GET",
      headers: {
        Cookie: [...cookies].map(([k, v]) => k + "=" + v).join("; "),
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    for (const line of response.headers.getSetCookie()) {
      const pair = line.split(";")[0],
        i = pair.indexOf("=");
      cookies.set(pair.slice(0, i), pair.slice(i + 1));
    }
    return { status: response.status, data: await response.json() };
  };
  return { call, cookies, guest };
}
async function finishDaily(c) {
  let g = (await c.call("start", { mode: "daily" })).data;
  while (!g.done) {
    g = (await c.call("next", { id: g.id, round: g.round })).data;
    const q = questions.find((q) => q.id === g.question.id);
    g = (
      await c.call("answer", {
        id: g.id,
        round: g.round,
        answer: q.answers[0].label,
      })
    ).data;
  }
  return g;
}
if (!['127.0.0.1', 'localhost'].includes(new URL(base).hostname)) throw Error('This integration mutates local test fixtures only.');
sql("DELETE FROM request_limits");
sql("DELETE FROM ranked_seats; DELETE FROM relay_rooms WHERE pool IS NOT NULL");
const a = client(),
  b = client();
await a.call("puzzle");
await b.call("puzzle");
const guestGame = await finishDaily(a);
let created = await a.call("passport/create", { name: "Alpha" });
assert.equal(created.status, 200);
const recovery = created.data.recovery;
assert(/^[a-f0-9]{64}$/.test(recovery));
const me = (await a.call("passport")).data;
assert(me.account);
assert(!("player" in me.account));
assert(!("recovery_hash" in me.account));
assert.equal(me.canImport, true);
assert.equal((await a.call("progress")).data.totalDaily, 0);
assert.equal((await a.call("passport/import", {})).status, 400);
assert.equal((await a.call("passport/import", { confirm: true })).status, 200);
assert.equal((await a.call("progress")).data.totalDaily, 1);
const c = client();
assert.equal((await c.call("passport/recover", { recovery })).status, 200);
assert.equal((await c.call("resume", { id: guestGame.id })).status, 200);
assert.equal((await c.call("progress")).data.totalDaily, 1);
const impersonator = client(me.account.id);
assert.equal(
  (await impersonator.call("resume", { id: guestGame.id })).status,
  404,
);
assert.equal((await impersonator.call("progress")).data.totalDaily, 0);
assert.equal((await b.call("resume", { id: guestGame.id })).status, 404);
assert.equal(
  (
    await b.call(
      "passport/create",
      { name: "Beta" },
      { Origin: "https://elsewhere.example" },
    )
  ).status,
  403,
);
assert.equal((await b.call("passport/create", { name: "Beta" })).status, 200);
const other = (await b.call("passport")).data.account;
const invitation = (await a.call("passport/invite", {})).data;
assert.equal(
  (await b.call("passport/accept", { code: invitation.code })).status,
  200,
);
assert.equal((await a.call("passport/friends", {})).data.entries.length, 1);
assert.equal((await b.call("passport/friend-board", {})).data.locked, true);
await finishDaily(b);
const board = (await b.call("passport/friend-board", {})).data;
assert.equal(board.entries.length, 2);
assert(board.entries.every((p) => p.answers.length === 5));
assert(!("player" in board.entries[0]));
// A software WebAuthn authenticator performs real signed registration/login.
const b64 = (value) => Buffer.from(value).toString("base64url");
const unb64 = (value) => new Uint8Array(Buffer.from(value, "base64url"));
const concat = (...values) =>
  Buffer.concat(values.map((value) => Buffer.from(value)));
const digest = async (value) =>
  new Uint8Array(await crypto.subtle.digest("SHA-256", value));
const pair = await crypto.subtle.generateKey(
  { name: "ECDSA", namedCurve: "P-256" },
  true,
  ["sign", "verify"],
);
const jwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
const cred = crypto.getRandomValues(new Uint8Array(32));
const options = (await a.call("passport/passkey-register-options", {})).data;
const rpHash = await digest(new TextEncoder().encode(new URL(base).hostname));
const pub = encodeCBOR(
  new Map([
    [1, 2],
    [3, -7],
    [-1, 1],
    [-2, unb64(jwk.x)],
    [-3, unb64(jwk.y)],
  ]),
);
const clientData = Buffer.from(
  JSON.stringify({
    type: "webauthn.create",
    challenge: options.options.challenge,
    origin: base,
    crossOrigin: false,
  }),
);
const authData = concat(
  rpHash,
  [0x45],
  [0, 0, 0, 0],
  new Uint8Array(16),
  [0, 32],
  cred,
  pub,
);
const registration = {
  id: b64(cred),
  rawId: b64(cred),
  response: {
    clientDataJSON: b64(clientData),
    attestationObject: b64(
      encodeCBOR(
        new Map([
          ["fmt", "none"],
          ["attStmt", new Map()],
          ["authData", authData],
        ]),
      ),
    ),
    transports: ["internal"],
  },
  type: "public-key",
  clientExtensionResults: {},
  authenticatorAttachment: "platform",
};
let registered = await a.call("passport/passkey-register", {
  id: options.id,
  response: registration,
});
assert.equal(registered.status, 200, JSON.stringify(registered.data));
assert.equal(
  (
    await a.call("passport/passkey-register", {
      id: options.id,
      response: registration,
    })
  ).status,
  409,
);
const loginClient = client(),
  login = (await loginClient.call("passport/passkey-login-options", {})).data;
const loginData = Buffer.from(
  JSON.stringify({
    type: "webauthn.get",
    challenge: login.options.challenge,
    origin: base,
    crossOrigin: false,
  }),
);
const loginAuth = concat(rpHash, [0x05], [0, 0, 0, 1]);
const signed = await crypto.subtle.sign(
  { name: "ECDSA", hash: "SHA-256" },
  pair.privateKey,
  concat(loginAuth, await digest(loginData)),
);
function derInteger(bytes) {
  let b = Buffer.from(bytes);
  while (b.length > 1 && b[0] === 0) b = b.subarray(1);
  if (b[0] & 128) b = concat([0], b);
  return concat([2, b.length], b);
}
const raw = new Uint8Array(signed),
  r = derInteger(raw.slice(0, 32)),
  s = derInteger(raw.slice(32));
const signature = concat([0x30, r.length + s.length], r, s);
const assertion = {
  id: b64(cred),
  rawId: b64(cred),
  response: {
    clientDataJSON: b64(loginData),
    authenticatorData: b64(loginAuth),
    signature: b64(signature),
    userHandle: options.options.user.id,
  },
  type: "public-key",
  clientExtensionResults: {},
  authenticatorAttachment: "platform",
};
const signedIn = await loginClient.call("passport/passkey-login", {
  id: login.id,
  response: assertion,
});
assert.equal(signedIn.status, 200, JSON.stringify(signedIn.data));
assert.equal(
  (await loginClient.call("passport")).data.account.id,
  me.account.id,
);
// Durable Object serializes simultaneous joins and results settle once.
const ta = crypto.randomUUID(),
  tb = crypto.randomUUID();
const wait = await a.call("relay/match", {
  name: "Alpha",
  token: ta,
  rated: true,
  capacity: 2,
});
assert.equal(wait.status, 200, JSON.stringify(wait.data));
const started = await b.call("relay/match", {
  name: "Beta",
  token: tb,
  rated: true,
  capacity: 2,
});
assert.equal(started.status, 200, JSON.stringify(started.data));
assert.equal(started.data.code, wait.data.code);
assert.equal(started.data.status, "playing");
assert.equal(started.data.players.length, 2);
assert.equal(
  (
    await c.call("relay/join", {
      code: wait.data.code,
      token: crypto.randomUUID(),
      name: "Injected",
    })
  ).status,
  403,
);
sql(
  `UPDATE relay_rooms SET state_json=json_set(state_json,'$.deadline',${Date.now() - 2000000}),revision=revision+1 WHERE code='${wait.data.code}'`,
);
const settled = await Promise.all([
  a.call("relay/state", { code: wait.data.code, token: ta }),
  b.call("relay/state", { code: wait.data.code, token: tb }),
  a.call("relay/state", { code: wait.data.code, token: ta }),
]);
assert(settled.every((r) => r.status === 200 && r.data.status === "finished"));
assert.equal((await a.call("passport")).data.account.matches, 1);
assert.equal((await b.call("passport")).data.account.matches, 1);
assert.equal(
  (await a.call("passport/block", { target: other.id })).status,
  200,
);
assert.equal(
  (await b.call("passport/accept", { code: invitation.code })).status,
  403,
);
assert.equal((await a.call("passport/friends", {})).data.entries.length, 0);
const qa = await a.call("relay/match", {
  name: "Alpha",
  token: crypto.randomUUID(),
  capacity: 2,
  rated: true,
});
const qb = await b.call("relay/match", {
  name: "Beta",
  token: crypto.randomUUID(),
  capacity: 2,
  rated: true,
});
assert.notEqual(
  qa.data.code,
  qb.data.code,
  "blocked pilots must not share a new match",
);
const guests = Array.from({ length: 10 }, () => client());
const tokens = guests.map(() => crypto.randomUUID());
const ten = await Promise.all(
  guests.map((g, i) =>
    g.call("relay/match", {
      name: "Pilot " + i,
      token: tokens[i],
      capacity: 10,
    }),
  ),
);
assert(ten.every((r) => r.status === 200));
assert.equal(new Set(ten.map((r) => r.data.code)).size, 1);
const final = (
  await guests[0].call("relay/state", {
    code: ten[0].data.code,
    token: tokens[0],
  })
).data;
assert.equal(final.players.length, 10);
assert.equal(final.status, "playing");
assert.equal(final.stages, 30);
assert(!JSON.stringify(final).includes("recovery_hash"));
assert.equal((await a.call("passport/logout", {})).status, 200);
assert.equal((await a.call("passport")).data.account, null);
assert.equal((await a.call("resume", { id: guestGame.id })).status, 404);
assert.equal((await c.call("passport")).data.account.id, me.account.id);
const guestIdentity = final.players[0].identity;
assert.equal((await b.call("passport/block", {target:guestIdentity})).status,200);
const blockedHostToken=crypto.randomUUID();
const blockedRoom=(await b.call("relay/create",{name:"Beta",token:blockedHostToken,capacity:2,visibility:"public"})).data;
const guestJoin={code:blockedRoom.code,token:crypto.randomUUID(),name:"Guest"};
assert.equal((await guests[0].call("relay/join",guestJoin)).status,403);
assert.equal((await b.call("passport/unblock",{target:guestIdentity})).status,200);
assert.equal((await guests[0].call("relay/join",guestJoin)).status,200);
const recoveredSeat = await c.call("relay/recover", {});
assert.equal(recoveredSeat.status, 200);
assert.equal(recoveredSeat.data.code, qa.data.code);
assert(typeof recoveredSeat.data.seatToken === "string");
const rotated = await c.call("passport/rotate", {recovery});
assert.equal(rotated.status, 200);
assert.equal((await loginClient.call("passport")).data.account, null);
assert.equal((await a.call("passport/recover", {recovery})).status, 400);
assert.equal((await a.call("passport/recover", {recovery:rotated.data.recovery})).status, 200);
assert.equal((await a.call("passport/delete", {recovery:rotated.data.recovery,confirm:false})).status, 400);
assert.equal((await a.call("passport/delete", {recovery:rotated.data.recovery,confirm:true})).status, 200);
assert.equal((await c.call("passport")).data.account, null);
assert.equal((await a.call("passport/recover", {recovery:rotated.data.recovery})).status, 400);
console.log(
  "PASS: Cloudflare D1/DO passport recovery/import/isolation, real signed WebAuthn, friend spoiler gate and block, simultaneous ten-seat match, rated settlement exactly once and logout isolation.",
);
