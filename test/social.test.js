import test from "node:test";
import assert from "node:assert/strict";
import { ratingChanges } from "../src/rating.js";
import { createRelay, relayAction, publicRelay } from "../src/relay.js";
test("pairwise Elo treats ties symmetrically and scales wins by opponent strength", () => {
  assert.deepEqual(
    ratingChanges([
      { account: "a", rank: 1, rating: 1000 },
      { account: "b", rank: 2, rating: 1000 },
    ]).map((p) => p.delta),
    [16, -16],
  );
  assert.deepEqual(
    ratingChanges([
      { account: "a", rank: 1, rating: 1000 },
      { account: "b", rank: 1, rating: 1000 },
    ]).map((p) => p.delta),
    [0, 0],
  );
  const upset = ratingChanges([
    { account: "a", rank: 1, rating: 600 },
    { account: "b", rank: 2, rating: 1400 },
  ]);
  assert(upset[0].delta > 16);
  assert(upset[1].delta < -16);
  assert.deepEqual(
    ratingChanges([
      { account: "a", rank: 1, rating: 1000 },
      { account: "a", rank: 2, rating: 1000 },
    ]),
    [],
  );
});
test("ten-seat table is bounded, rated start waits for capacity, and identities cannot take two seats", () => {
  const room = createRelay("ABC234", "A", "a", 100, {
    capacity: 10,
    rated: true,
    account: "account-a",
    automatic: true,
  });
  assert.equal(room.questions.length, 30);
  assert.match(relayAction(room, "start", "a", {}, "en", 100).error, /fill/);
  assert.match(
    relayAction(
      room,
      "join",
      "duplicate",
      { name: "X", account: "account-a" },
      "en",
      100,
    ).error,
    /already/,
  );
  for (let i = 1; i < 10; i++)
    assert(
      !relayAction(
        room,
        "join",
        "t" + i,
        { name: "P" + i, account: "account-" + i },
        "en",
        100,
      ).error,
    );
  assert.match(
    relayAction(room, "join", "extra", { name: "X" }, "en", 100).error,
    /full/,
  );
  relayAction(room, "start", "a", {}, "en", 100);
  assert.equal(room.status, "playing");
  assert.equal(publicRelay(room, "a", "en", 100).capacity, 10);
});
test("rare meters charge a bounded extra heart once per unique answer", () => {
  const room = createRelay("ABC234", "A", "a", 100);
  relayAction(room, "join", "b", { name: "B" }, "en", 100);
  relayAction(room, "start", "a", {}, "en", 100);
  room.questions[0] = {
    ...room.questions[0],
    answers: [
      { label: "First", tier: 4, aliases: [] },
      { label: "Second", tier: 3, aliases: [] },
      { label: "Third", tier: 4, aliases: [] },
      { label: "Fourth", tier: 4, aliases: [] },
    ],
  };
  room.players[0].charge = 500;
  room.players[0].hearts = 3;
  const turn = room.turn;
  relayAction(room, "answer", "a", { turn, answer: "First" }, "en", 101);
  assert.equal(room.players[0].hearts, 4);
  assert.equal(room.players[0].charge, 0);
  relayAction(room, "answer", "a", { turn, answer: "First" }, "en", 102);
  assert.equal(room.players[0].hearts, 4);
});
