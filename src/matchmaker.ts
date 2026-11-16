import { DurableObject } from "cloudflare:workers";
import { relayApi } from "./relay-api.js";
import type { Passport } from "./auth.js";
interface Env {
  DB: D1Database;
}
export class Matchmaker extends DurableObject<Env> {
  async fetch(request: Request): Promise<Response> {
    return this.ctx.blockConcurrencyWhile(async () => {
      const { creator, body, language, account } = await request.json<{
        creator: string;
        body: Record<string, unknown>;
        language: string;
        account: Passport | null;
      }>();
      const capacity = [2, 3, 6, 10].includes(Number(body.capacity))
          ? Number(body.capacity)
          : 2,
        rated = body.rated === true;
      if (rated && !account)
        return Response.json(
          { error: "Open your flight passport to play rated." },
          { status: 401 },
        );
      const pool = (rated ? "rated:" : "quick:") + capacity,
        now = Date.now();
      const out = (data: unknown) =>
        Response.json(data, { headers: { "Cache-Control": "no-store" } });
      // Each pool is serialized across the entire namespace. No synthetic users.
      const { results } = await this.env.DB.prepare(
        "SELECT code,state_json,created FROM relay_rooms WHERE pool=? AND activity>? AND expires>? ORDER BY created LIMIT 30",
      )
        .bind(pool, now - 90000, now)
        .all<{ code: string; state_json: string; created: number }>();
      for (const candidate of results) {
        const room = JSON.parse(candidate.state_json);
        if (room.status !== "waiting") continue;
        const existing = room.players.find(
          (p: any) =>
            !p.left &&
            ((account && p.account === account.id) || p.token === body.token),
        );
        if (existing) {
          if (existing.token === body.token)
            return relayApi(
              this.env.DB,
              creator,
              "state",
              { ...body, code: candidate.code },
              language,
              out,
              account,
              true,
            );
          return Response.json(
            { error: "You already have a seat in this flight." },
            { status: 409 },
          );
        }
        const people = room.players.filter((p: any) => !p.left);
        if (people.length >= capacity) continue;
        const band =
          100 +
          Math.min(600, Math.floor((now - candidate.created) / 15000) * 100);
        if (
          rated &&
          Math.abs((people[0]?.rating || 1000) - account!.rating) > band
        )
          continue;
        const response = await relayApi(
          this.env.DB,
          creator,
          "join",
          { ...body, code: candidate.code },
          language,
          out,
          account,
          true,
        );
        if (response.ok) return response;
        if (response.status === 403) continue;
        if (response.status !== 409) return response;
      }
      return relayApi(
        this.env.DB,
        creator,
        "match",
        {
          ...body,
          capacity,
          rated,
          pool,
          visibility: rated ? "private" : "public",
        },
        language,
        out,
        account,
        true,
      );
    });
  }
}
