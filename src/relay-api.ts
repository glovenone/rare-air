import { createRelay, relayAction, publicRelay, relayLimits } from './relay.js';

interface RoomRow { code: string; state_json: string; revision: number; expires: number }
const failure = (error: string, status = 400) => Response.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });
const roomName = (value: unknown) => typeof value === 'string'
  ? value.trim().replace(/[\p{C}\p{Zl}\p{Zp}]/gu, '').slice(0, 24).trim() : '';

export async function relayApi(db: D1Database, creator: string, action: string, body: Record<string, unknown>, language: string, respond: (data: unknown) => Response) {
  const now = Date.now();
  const token = typeof body.token === 'string' ? body.token : '';
  if (!/^[a-f0-9-]{36}$/.test(token)) return failure('Open the room again to restore your seat.');
  const name = roomName(body.name);
  if ((action === 'create' || action === 'join') && !name) return failure('Enter a pilot name.');
  if (action === 'answer' && (typeof body.answer !== 'string' || body.answer.length > 100 || !Number.isInteger(body.turn))) return failure('Use an answer under 100 characters.');
  if (action === 'create') {
    const rate = await db.prepare('SELECT COUNT(*) AS n FROM relay_rooms WHERE creator=? AND created>?').bind(creator, now - 3600000).first<{ n: number }>();
    if ((rate?.n || 0) >= 10) return failure('You have created 10 rooms this hour. Try again later.', 429);
    await db.prepare('DELETE FROM relay_rooms WHERE expires<?').bind(now).run();
    for (let attempt = 0; attempt < 5; attempt++) {
      const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const code = Array.from(crypto.getRandomValues(new Uint8Array(6)), value => alphabet[value % alphabet.length]).join('');
      const room = createRelay(code, name, token, now);
      const saved = await db.prepare('INSERT OR IGNORE INTO relay_rooms(code,state_json,creator,created,expires) VALUES(?,?,?,?,?)')
        .bind(code, JSON.stringify(room), creator, now, now + relayLimits.lifetime).run();
      if (saved.meta.changes) return respond(publicRelay(room, token, language, now));
    }
    return failure('A room could not be created. Please try again.', 503);
  }
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) return failure('Enter a six-character room code.');
  if (!['join', 'state', 'start', 'answer', 'leave'].includes(action)) return failure('Choose an available room action.');
  for (let attempt = 0; attempt < 8; attempt++) {
    const row = await db.prepare('SELECT code,state_json,revision,expires FROM relay_rooms WHERE code=?').bind(code).first<RoomRow>();
    if (!row || row.expires <= now) return failure('This room has expired or could not be found.', 404);
    const room = JSON.parse(row.state_json);
    // Authenticate before advancing a room or disclosing its state.
    if (action !== 'join' && !room.players.some((player: { token: string; left: boolean }) => player.token === token && !player.left)) return failure('Rejoin this room to take a seat.', 403);
    const result = relayAction(room, action, token, { ...body, name }, language, now);
    const encoded = JSON.stringify(room);
    if (encoded !== row.state_json) {
      const updated = await db.prepare('UPDATE relay_rooms SET state_json=?,revision=revision+1 WHERE code=? AND revision=?')
        .bind(encoded, code, row.revision).run();
      if (!updated.meta.changes) continue;
    }
    if (result.error) return failure(result.error, result.forbidden ? 403 : 409);
    return respond({ ...publicRelay(room, token, language, now), feedback: result.feedback || null });
  }
  return failure('The room is busy. Please try again.', 503);
}
