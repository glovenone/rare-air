import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { questions } from '../src/questions.js';

const base = process.env.TEST_URL || 'http://127.0.0.1:8787';
const cookies = new Map();
async function call(action, body, headers = {}) {
  if (!cookies.has(body.token)) cookies.set(body.token, 'rare_player=' + crypto.randomUUID());
  const cookie = cookies.get(body.token);
  const response = await fetch(base + '/api/relay/' + action, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie, ...headers },
    body: JSON.stringify(body),
  });
  return { status: response.status, data: await response.json() };
}
const host = crypto.randomUUID();
const guest = crypto.randomUUID();
const created = await call('create', { token: host, name: 'Host' });
assert.equal(created.status, 200);
const code = created.data.code;
assert.match(code, /^[A-HJ-NP-Z2-9]{6}$/);
assert.equal((await call('state', { code, token: guest })).status, 403);
assert.equal((await call('join', { code: 'ABC', token: guest, name: 'Guest' })).status, 400);
assert.equal((await call('join', { code, token: guest, name: 'Guest' }, { Origin: 'https://other.example' })).status, 403);
const joined = await call('join', { code, token: guest, name: 'Guest' });
assert.equal(joined.status, 200);
assert.equal((await call('start', { code, token: guest })).status, 409);
const { data: playing } = await call('start', { code, token: host });
assert.equal(playing.status, 'playing');
assert.equal(playing.question.answers, undefined);
assert.equal(playing.players[0].token, undefined);
assert.equal(playing.self, playing.current);
const q = questions.find(question => question.id === playing.question.id);
const submission = { code, token: host, turn: playing.turn, answer: q.answers[0].label };
const concurrent = await Promise.all([call('answer', submission), call('answer', submission), call('answer', submission)]);
assert(concurrent.every(result => result.status === 200));
let { data: state } = await call('state', { code, token: guest, language: 'zh' });
assert.equal(state.players[0].score, [0, 100, 250, 500, 1000][q.answers[0].tier]);
assert.equal(state.used.length, 1);
assert.equal(state.turn, playing.turn + 1);
const duplicate = await call('answer', { code, token: guest, turn: state.turn, language: 'zh', answer: q.localizations.zh.answers[0] });
assert.equal(duplicate.data.feedback, 'That answer has already been used in this stage.');
assert.equal(duplicate.data.turn, state.turn);
const resumed = await call('state', { code, token: guest, language: 'ar' });
assert.equal(resumed.data.self, state.self);
assert.equal(resumed.data.deadline, state.deadline);
assert.equal(resumed.data.question.prompt, q.localizations.ar.prompt);

// Force a local deadline to exercise recovery without sleeping through a game.
execFileSync('npx', ['wrangler', 'd1', 'execute', 'DB', '--local', '--command',
  `UPDATE relay_rooms SET state_json=json_set(state_json,'$.deadline',${Date.now() - 1000}),revision=revision+1 WHERE code='${code}'`], { stdio: 'pipe' });
state = (await call('state', { code, token: guest })).data;
assert.equal(state.stage, 2);
assert.equal(state.players[1].hearts, 2);
assert.equal(state.current, state.players[0].id);
assert.equal(state.used.length, 0);
execFileSync('npx', ['wrangler', 'd1', 'execute', 'DB', '--local', '--command',
  `UPDATE relay_rooms SET state_json=json_set(state_json,'$.deadline',${Date.now() - 200000}),revision=revision+1 WHERE code='${code}'`], { stdio: 'pipe' });
const finals = await Promise.all([call('state', { code, token: host }), call('state', { code, token: guest })]);
assert(finals.every(result => result.data.status === 'finished'));
assert.deepEqual(finals[0].data.players, finals[1].data.players);
assert.equal(finals[0].data.deadline, null);

const capacityHost = crypto.randomUUID();
const lobby = (await call('create', { token: capacityHost, name: 'Capacity' })).data;
const crowd = await Promise.all(Array.from({ length: 6 }, (_, index) => call('join', { code: lobby.code, token: crypto.randomUUID(), name: 'Pilot ' + index })));
assert.equal(crowd.filter(result => result.status === 200).length, 5);
assert.equal(crowd.filter(result => result.status === 409).length, 1);
const full = (await call('state', { code: lobby.code, token: capacityHost })).data;
assert.equal(full.players.length, 6);
const successor = crowd.find(result => result.status === 200).data.self;
await call('leave', { code: lobby.code, token: capacityHost });
assert.equal((await call('state', { code: lobby.code, token: capacityHost })).status, 403);
assert(full.players.some(player => player.id === successor));
console.log('PASS: real D1 two-seat relay, authorization, concurrent scoring, cross-language duplicates, shared clocks, timeout recovery, final consistency and concurrent six-seat capacity.');
