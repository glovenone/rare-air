import test from "node:test";
import assert from "node:assert/strict";
import { createOfflineClient, offlineRequest } from "../native/offline.js";
import { questions } from "../src/questions.js";

test("offline flights preserve hidden prompts, scoring, idempotent rounds and their separate mode", () => {
  let game = offlineRequest("start");
  assert.equal(game.mode, "offline");
  assert.equal(game.question, null);
  assert.equal(game.review, null);
  assert.match(game.id, /^offline:/);
  let total = 0;
  for (let index = 0; index < 5; index++) {
    game = offlineRequest("next", { id: game.id, round: game.round });
    const deadline = game.deadline;
    assert.equal(
      offlineRequest("next", { id: game.id, round: game.round }).deadline,
      deadline,
    );
    assert.equal(game.question.answers, undefined);
    const question = questions.find((item) => item.id === game.question.id);
    const answer = question.answers.at(-1);
    const submitted = { id: game.id, round: game.round, answer: answer.label };
    game = offlineRequest("answer", submitted);
    assert.equal(game.round, index + 1);
    assert.equal(game.question, null);
    assert.equal(offlineRequest("answer", submitted).answers.length, index + 1);
    total += [0, 100, 250, 500, 1000][answer.tier];
  }
  assert.equal(game.done, true);
  assert.equal(
    game.answers.reduce((sum, answer) => sum + answer.points, 0),
    total,
  );
  assert.equal(game.review.length, 5);
  assert.equal(new Set(game.review.map((question) => question.id)).size, 5);
  const nextGame = offlineRequest("start");
  assert.notEqual(nextGame.id, game.id);
  assert.throws(() => offlineRequest("resume", { id: game.id }), /not found/);

  const isolated = createOfflineClient((count) => new Uint32Array(count));
  const separate = isolated("start");
  separate.answers.push({ points: 5000 });
  assert.equal(isolated("resume", { id: separate.id }).answers.length, 0);
  assert.equal(offlineRequest("resume", { id: nextGame.id }).id, nextGame.id);
});
