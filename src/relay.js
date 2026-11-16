import { schedule, evaluate, publicQuestion } from './questions.js';
import { answerLabel } from './localization.js';

export const relayLimits = { capacity: 6, stages: 5, hearts: 3, clock: 30000, floor: 8000, lifetime: 86400000 };

export function createRelay(code, name, token, now) {
  return {
    code, status: 'waiting', created: now, expires: now + relayLimits.lifetime,
    host: token, players: [{ id: crypto.randomUUID(), token, name, hearts: relayLimits.hearts, score: 0, left: false }],
    questions: schedule('relay:' + crypto.randomUUID()), stage: 0, turn: 0,
    current: 0, deadline: null, used: [], events: [],
  };
}

function active(room) {
  return room.players.filter(player => !player.left && player.hearts > 0);
}

function nextPilot(room) {
  for (let offset = 1; offset <= room.players.length; offset++) {
    const index = (room.current + offset) % room.players.length;
    const player = room.players[index];
    if (!player.left && player.hearts > 0) return index;
  }
  return room.current;
}

function record(room, event) {
  room.events.push({ ...event, id: room.turn, stage: room.stage });
  room.events = room.events.slice(-24);
}

function finishIfNeeded(room) {
  if (room.stage >= room.questions.length || active(room).length < 2) {
    room.status = 'finished';
    room.deadline = null;
    return true;
  }
  return false;
}

function nextStage(room, now) {
  room.stage++;
  room.used = [];
  room.current = nextPilot(room);
  if (!finishIfNeeded(room)) room.deadline = now + relayLimits.clock;
}

// Deadlines advance from the expired deadline, so sleeping clients cannot pause
// a room. At most five stages can expire before the final result is reached.
export function settleRelay(room, now) {
  while (room.status === 'playing' && now >= room.deadline) {
    const expiredAt = room.deadline;
    const pilot = room.players[room.current];
    pilot.hearts--;
    room.turn++;
    record(room, { kind: 'timeout', pilot: pilot.id });
    nextStage(room, expiredAt);
  }
}

export function relayAction(room, action, token, body, language, now) {
  const previousTurn = room.turn;
  settleRelay(room, now);
  const pilot = room.players.find(player => player.token === token);
  if (action === 'join') {
    if (pilot && !pilot.left) return {};
    if (room.status !== 'waiting') return { error: 'This flight has already started.' };
    if (room.players.filter(player => !player.left).length >= relayLimits.capacity) return { error: 'This room is full. Create another flight.' };
    room.players = room.players.filter(player => !player.left);
    room.players.push({ id: crypto.randomUUID(), token, name: body.name, hearts: relayLimits.hearts, score: 0, left: false });
    room.turn++;
    return {};
  }
  if (!pilot || pilot.left) return { error: 'Rejoin this room to take a seat.', forbidden: true };
  if (action === 'state') return {};
  if (action === 'leave') {
    pilot.left = true;
    pilot.hearts = 0;
    room.turn++;
    if (room.host === token) room.host = room.players.find(player => !player.left)?.token || '';
    if (room.status === 'playing' && !finishIfNeeded(room) && room.players[room.current] === pilot) {
      room.current = nextPilot(room);
      room.deadline = Math.max(room.deadline, now + relayLimits.floor);
    }
    if (room.status === 'waiting' && active(room).length === 0) room.status = 'finished';
    return {};
  }
  if (action === 'start') {
    if (room.status !== 'waiting') return {};
    if (room.host !== token) return { error: 'Only the host can start this flight.' };
    if (active(room).length < 2) return { error: 'Invite at least one other pilot.' };
    room.status = 'playing';
    room.current = room.players.findIndex(player => !player.left && player.hearts > 0);
    room.deadline = now + relayLimits.clock;
    room.turn++;
    return {};
  }
  if (action !== 'answer') return { error: 'Choose an available room action.' };
  if (room.status !== 'playing' || body.turn !== room.turn || previousTurn !== room.turn) return {};
  if (room.players[room.current] !== pilot) return { error: 'Wait for your turn.' };
  const question = room.questions[room.stage];
  const result = evaluate(question, body.answer, language);
  if (!result.correct) return { feedback: 'Try another answer before the breeze passes.' };
  // Canonical labels deduplicate spelling variants and different languages.
  if (room.used.includes(result.label)) return { feedback: 'That answer has already been used in this stage.' };
  room.used.push(result.label);
  pilot.score += result.points;
  room.turn++;
  record(room, { kind: 'answer', pilot: pilot.id, label: result.label, points: result.points });
  if (room.used.length === question.answers.length) nextStage(room, now);
  else {
    room.current = nextPilot(room);
    room.deadline = Math.max(room.deadline, now + relayLimits.floor);
  }
  return {};
}

export function publicRelay(room, token, language, now) {
  const self = room.players.find(player => player.token === token && !player.left);
  const standings = [...room.players].sort((a, b) => b.hearts - a.hearts || b.score - a.score);
  const rank = player => standings.findIndex(other => other.hearts === player.hearts && other.score === player.score) + 1;
  return {
    code: room.code, language, status: room.status, turn: room.turn, stage: Math.min(room.stage + 1, relayLimits.stages),
    stages: relayLimits.stages, capacity: relayLimits.capacity, serverNow: now, expires: room.expires,
    self: self?.id || null, isHost: room.host === token,
    current: room.status === 'playing' ? room.players[room.current].id : null,
    deadline: room.deadline,
    players: room.players.map(player => ({ id: player.id, name: player.name, hearts: player.hearts, score: player.score, left: player.left, rank: rank(player) })),
    question: room.status === 'playing' ? publicQuestion(room.questions[room.stage], language) : null,
    used: room.status === 'playing' ? room.used.map(label => answerLabel(room.questions[room.stage], label, language)) : [],
    events: room.events.map(event => ({ ...event, label: event.label ? answerLabel(room.questions[event.stage], event.label, language) : null })),
  };
}
