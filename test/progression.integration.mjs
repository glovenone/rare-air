import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chapterQuestions } from '../src/chapters.js';

const origin = 'http://127.0.0.1:8787';
const player = crypto.randomUUID();
const cookie = 'rare_player=' + player;
async function request(path, body) {
  const response = await fetch(origin + '/api/' + path, {
    method: body ? 'POST' : 'GET', headers: { Cookie: cookie, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, data: await response.json() };
}
const initial = (await request('progress')).data;
assert.equal(initial.routes.length, 9);
assert.equal(initial.routes[0].chapters[1].unlocked, false);
assert.equal((await request('start', { mode: 'practice', chapter: 'world-02' })).status, 409);
assert.equal((await request('start', { mode: 'daily', chapter: 'world-01' })).status, 400);
assert.equal((await request('start', { mode: 'practice', chapter: 'not-a-chapter' })).status, 400);
assert.equal((await request('start', { mode: 'practice', chapter: 'world-01', topic: 'science' })).status, 400);
let game = (await request('start', { mode: 'practice', chapter: 'world-01' })).data;
assert.equal(game.chapter.id, 'world-01');
assert.equal(game.completedAt, null);
assert.equal(game.question, null);
const chapter = chapterQuestions('world-01');
let total = 0;
for (let round = 0; round < 5; round++) {
  game = (await request('next', { id: game.id, round, language: 'zh' })).data;
  assert.equal(game.question.id, chapter[round].id);
  const answer = chapter[round].answers.reduce((best, answer) => answer.tier > best.tier ? answer : best);
  total += [0, 100, 250, 500, 1000][answer.tier];
  const submit = { id: game.id, round, answer: answer.label, language: 'en' };
  const attempts = await Promise.all([request('answer', submit), request('answer', submit)]);
  assert(attempts.every(attempt => attempt.status === 200));
  game = (await request('resume', { id: game.id })).data;
}
assert(game.completedAt > 0);
const completedAt = game.completedAt;
assert.equal(game.answers.reduce((sum, answer) => sum + answer.points, 0), total);
assert.equal((await request('answer', { id: game.id, round: 4, answer: '' })).data.completedAt, completedAt);
const progress = (await request('progress')).data;
assert.equal(progress.chapters['world-01'].score, total);
assert.equal(progress.routes[0].chapters[1].unlocked, true);
assert.equal(progress.routes[0].chapters[2].unlocked, false);
const replay = (await request('start', { mode: 'practice', chapter: 'world-01' })).data;
const firstReplay = (await request('next', { id: replay.id, round: 0 })).data;
assert.equal(firstReplay.question.id, chapter[0].id);
assert.equal((await request('start', { mode: 'practice', chapter: 'world-02' })).status, 200);

// Local fixtures model a past eligible streak, an archive completion and a legacy row.
const today = new Date().toISOString().slice(0, 10);
const dayAgo = offset => new Date(Date.parse(today) - offset * 86400000).toISOString().slice(0, 10);
const rows = [
  ...[1, 2, 3].map(offset => ({ day: dayAgo(offset), completed: Date.parse(dayAgo(offset) + 'T12:00:00Z') })),
  { day: dayAgo(4), completed: Date.now() },
  { day: dayAgo(5), completed: null },
];
const statements = rows.flatMap(row => {
  const id = crypto.randomUUID();
  return [
    `INSERT INTO sessions(id,player,day,mode,seed,round,started,created,name,completed_at) VALUES('${id}','${player}','${row.day}','daily','${row.day}',5,0,${Date.parse(row.day)},'Progress fixture',${row.completed ?? 'NULL'})`,
    `INSERT INTO answers(session,round,question,answer,label,tier,points,correct,timed_out) VALUES('${id}',0,'fixture','','',0,0,0,0)`,
  ];
});
execFileSync('npx', ['wrangler', 'd1', 'execute', 'DB', '--local', '--command', statements.join(';')], { stdio: 'pipe' });
const earned = (await request('progress')).data;
assert.deepEqual(earned.streak, { current: 3, best: 3, completedToday: false });
assert.equal(earned.totalDaily, 5);
assert.equal(earned.legacyDaily, 1);
assert(earned.unlockedTrails.includes('gold'));
assert.equal(earned.unlockedTrails.includes('cloud'), false);
console.log('PASS: real D1 chapter locks, deterministic replay, best scores, concurrent completion timestamps, archive/legacy exclusion and earned streak rewards.');
