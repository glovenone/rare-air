import test from 'node:test';
import assert from 'node:assert/strict';
import { createRelay, relayAction, publicRelay, settleRelay } from '../src/relay.js';

function flight() {
  const now = 100000;
  const room = createRelay('ABC234', 'First pilot', 'first', now);
  relayAction(room, 'join', 'second', { name: 'Second pilot' }, 'en', now);
  relayAction(room, 'start', 'first', {}, 'en', now);
  return { room, now };
}

test('relay aliases share one canonical answer and stale retries cannot score twice', () => {
  const { room, now } = flight();
  const question = room.questions[0];
  const turn = room.turn;
  relayAction(room, 'answer', 'first', { turn, answer: question.answers[0].label }, 'en', now + 1000);
  const score = room.players[0].score;
  assert(score > 0);
  assert.equal(room.current, 1);
  relayAction(room, 'answer', 'first', { turn, answer: question.answers[0].label }, 'en', now + 1100);
  assert.equal(room.players[0].score, score);
  const duplicate = relayAction(room, 'answer', 'second', { turn: room.turn, answer: question.localizations.zh.answers[0] }, 'zh', now + 2000);
  assert.equal(duplicate.feedback, 'That answer has already been used in this stage.');
  assert.equal(room.current, 1);
  assert.equal(room.used.length, 1);
});

test('the shared clock retains its deadline and gives the next pilot an eight-second floor', () => {
  const { room, now } = flight();
  const original = room.deadline;
  relayAction(room, 'answer', 'first', { turn: room.turn, answer: room.questions[0].answers[0].label }, 'en', now + 1000);
  assert.equal(room.deadline, original);
  relayAction(room, 'answer', 'second', { turn: room.turn, answer: room.questions[0].answers[1].label }, 'en', original - 1000);
  assert.equal(room.deadline, original + 7000);
});

test('timeouts settle without a connected client and finish after bounded stages', () => {
  const { room, now } = flight();
  const oldTurn = room.turn;
  relayAction(room, 'answer', 'first', { turn: oldTurn, answer: room.questions[0].answers[0].label }, 'en', now + 30000);
  assert.equal(room.players[0].hearts, 2);
  assert.equal(room.players[0].score, 0);
  assert.equal(room.stage, 1);
  assert.equal(room.current, 1);
  assert.equal(room.deadline, now + 60000);
  settleRelay(room, now + 200000);
  assert.equal(room.status, 'finished');
  assert.equal(room.deadline, null);
  assert.equal(room.events.filter(event => event.kind === 'timeout').length, 5);
});

test('lobby ownership, capacity and leaving an active turn are authoritative', () => {
  const room = createRelay('ABC234', 'First', 'first', 0);
  assert.equal(relayAction(room, 'start', 'first', {}, 'en', 0).error, 'Invite at least one other pilot.');
  for (let index = 1; index < 6; index++) relayAction(room, 'join', 'seat' + index, { name: 'Pilot ' + index }, 'en', 0);
  assert.equal(relayAction(room, 'join', 'overflow', { name: 'Extra' }, 'en', 0).error, 'This room is full. Create another flight.');
  assert.equal(relayAction(room, 'start', 'seat1', {}, 'en', 0).error, 'Only the host can start this flight.');
  relayAction(room, 'leave', 'first', {}, 'en', 0);
  assert.equal(room.host, 'seat1');
  relayAction(room, 'start', 'seat1', {}, 'en', 0);
  // A departed lobby seat must never own the first active turn.
  assert.equal(room.players[room.current].left, false);
  const current = room.players[room.current].token;
  relayAction(room, 'leave', current, {}, 'en', 1000);
  assert.equal(room.players[room.current].left, false);
});

test('public room state hides seat credentials and unused answer sets', () => {
  const { room, now } = flight();
  const before = publicRelay(room, 'first', 'ar', now);
  assert.equal(before.question.prompt, room.questions[0].localizations.ar.prompt);
  assert.equal(before.question.answers, undefined);
  assert.equal(before.players[0].token, undefined);
  assert.equal(before.host, undefined);
  assert.equal(before.questions, undefined);
  const deadline = before.deadline;
  relayAction(room, 'state', 'first', {}, 'ja', now + 5000);
  const resumed = publicRelay(room, 'first', 'ja', now + 5000);
  assert.equal(resumed.deadline, deadline);
  assert.equal(resumed.self, before.self);
  room.status = 'finished';
  const final = publicRelay(room, 'first', 'en', now);
  assert.deepEqual(final.players.map(player => player.rank), [1, 1]);
});
