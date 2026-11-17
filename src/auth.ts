import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";
export interface Passport {
  id: string;
  player: string;
  name: string;
  created: number;
  rating: number;
  matches: number;
  buddy: string;
  trail: string;
  avatar: string;
}
export const hashSecret = async (value: string) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
    (v) => v.toString(16).padStart(2, "0"),
  ).join("");
export const newSecret = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)), (v) =>
    v.toString(16).padStart(2, "0"),
  ).join("");
export const cookieValue = (req: Request, name: string) =>
  req.headers
    .get("Cookie")
    ?.split(/;\s*/)
    .find((value) => value.startsWith(name + "="))
    ?.slice(name.length + 1) || "";
export const safeName = (value: unknown) =>
  typeof value === "string"
    ? value
        .trim()
        .replace(/[\p{C}\p{Zl}\p{Zp}<>]/gu, "")
        .slice(0, 24)
        .trim()
    : "";
export const authFailure = (error: string, status = 400) =>
  Response.json(
    { error },
    { status, headers: { "Cache-Control": "no-store" } },
  );
export async function limited(
  db: D1Database,
  key: string,
  max: number,
  window = 3600000,
) {
  const now = Date.now(),
    bucket = Math.floor(now / window),
    hashed = await hashSecret(key + ":" + bucket);
  const result = await db
    .prepare(
      "INSERT INTO request_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count",
    )
    .bind(hashed, now + window)
    .first<{ count: number }>();
  if (crypto.getRandomValues(new Uint8Array(1))[0] < 8)
    await db
      .prepare("DELETE FROM request_limits WHERE expires<?")
      .bind(now)
      .run();
  return (result?.count || 0) <= max;
}
export async function authenticated(req: Request, db: D1Database) {
  const secret = cookieValue(
    req,
    new URL(req.url).protocol === "https:"
      ? "__Host-rare_passport"
      : "rare_passport",
  );
  if (!/^[a-f0-9]{64}$/.test(secret)) return null;
  return db
    .prepare(
      "SELECT p.id,p.player,p.name,p.created,p.rating,p.matches,p.buddy,p.trail,p.avatar FROM passports p JOIN passport_sessions s ON s.account=p.id WHERE s.hash=? AND s.expires>?",
    )
    .bind(await hashSecret(secret), Date.now())
    .first<Passport>();
}
export async function accountSession(
  db: D1Database,
  account: string,
  req: Request,
  data: object,
) {
  const token = newSecret(),
    expires = Date.now() + 30 * 86400000;
  await db
    .prepare(
      "INSERT INTO passport_sessions(hash,account,expires) VALUES(?,?,?)",
    )
    .bind(await hashSecret(token), account, expires)
    .run();
  return Response.json(data, {
    headers: {
      "Cache-Control": "no-store",
      "Set-Cookie": `${new URL(req.url).protocol === "https:" ? "__Host-rare_passport" : "rare_passport"}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${new URL(req.url).protocol === "https:" ? "; Secure" : ""}`,
    },
  });
}
const encode = (value: Uint8Array) => btoa(String.fromCharCode(...value));
const decode = (value: string) =>
  Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
export async function passkeyApi(
  req: Request,
  db: D1Database,
  action: string,
  b: Record<string, unknown>,
  player: string,
  account: Passport | null,
) {
  const url = new URL(req.url),
    rpID = url.hostname,
    origin = url.origin;
  if (!(await limited(db, "passkey:" + player, 30)))
    return authFailure("Too many sign-in attempts. Try again later.", 429);
  if (
    action === "passkey-register-options" ||
    action === "passkey-login-options"
  ) {
    if (action === "passkey-register-options" && !account)
      return authFailure("Open your flight passport first.", 401);
    const kind =
      account && action === "passkey-register-options" ? "register" : "login";
    const options =
      kind === "register"
        ? await generateRegistrationOptions({
            rpName: "RARE Air",
            rpID,
            userID: Uint8Array.from(new TextEncoder().encode(account!.id)),
            userName: account!.name,
            attestationType: "none",
            supportedAlgorithmIDs: [-7, -257],
            authenticatorSelection: {
              residentKey: "required",
              userVerification: "required",
            },
          })
        : await generateAuthenticationOptions({
            rpID,
            userVerification: "required",
          });
    const id = crypto.randomUUID();
    await db
      .prepare(
        "DELETE FROM auth_challenges WHERE expires<? OR (player=? AND kind=?)",
      )
      .bind(Date.now(), player, kind)
      .run();
    await db
      .prepare(
        "INSERT INTO auth_challenges(id,player,account,kind,challenge,expires) VALUES(?,?,?,?,?,?)",
      )
      .bind(
        id,
        player,
        kind === "register" ? account!.id : null,
        kind,
        options.challenge,
        Date.now() + 300000,
      )
      .run();
    return Response.json(
      { id, options },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!["passkey-register", "passkey-login"].includes(action))
    return authFailure("Choose an available passport action.", 404);
  if (typeof b.id !== "string" || !b.response || typeof b.response !== "object")
    return authFailure("This sign-in request is incomplete.");
  const c = await db
    .prepare(
      "DELETE FROM auth_challenges WHERE id=? AND player=? AND expires>? RETURNING *",
    )
    .bind(b.id, player, Date.now())
    .first<{ kind: string; challenge: string; account: string }>();
  if (!c || c.kind !== (action === "passkey-register" ? "register" : "login"))
    return authFailure("This sign-in request has expired. Start again.", 409);
  try {
    if (c.kind === "register") {
      if (!account || account.id !== c.account)
        return authFailure("Open your flight passport first.", 401);
      const result = await verifyRegistrationResponse({
        response: b.response as RegistrationResponseJSON,
        expectedChallenge: c.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: true,
      });
      if (!result.verified || !result.registrationInfo)
        return authFailure("The passkey could not be verified.");
      const credential = result.registrationInfo.credential;
      await db
        .prepare(
          "INSERT INTO passkeys(id,account,public_key,counter,transports) VALUES(?,?,?,?,?)",
        )
        .bind(
          credential.id,
          account.id,
          encode(credential.publicKey),
          credential.counter,
          JSON.stringify(credential.transports || []),
        )
        .run();
      return Response.json(
        { ok: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    const response = b.response as AuthenticationResponseJSON;
    const credential = await db
      .prepare("SELECT * FROM passkeys WHERE id=?")
      .bind(response.id)
      .first<{
        id: string;
        account: string;
        public_key: string;
        counter: number;
        transports: string;
      }>();
    if (!credential) return authFailure("This passkey is not registered.");
    const result = await verifyAuthenticationResponse({
      response,
      expectedChallenge: c.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: credential.id,
        publicKey: decode(credential.public_key),
        counter: credential.counter,
        transports: JSON.parse(credential.transports),
      },
      requireUserVerification: true,
    });
    if (!result.verified)
      return authFailure("The passkey could not be verified.");
    const updated = await db
      .prepare("UPDATE passkeys SET counter=? WHERE id=? AND counter=?")
      .bind(
        result.authenticationInfo.newCounter,
        credential.id,
        credential.counter,
      )
      .run();
    if (!updated.meta.changes)
      return authFailure("Please start sign-in again.", 409);
    return accountSession(db, credential.account, req, { ok: true });
  } catch {
    return authFailure("The passkey could not be verified.");
  }
}
