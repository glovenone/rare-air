import test from "node:test";
import assert from "node:assert/strict";
import { practiceTopics, questions, schedule } from "../src/questions.js";

const categories = {
  world: ["GEOGRAPHY", "HISTORY"],
  science: ["SCIENCE", "SPACE", "TECH", "TECHNOLOGY", "MATH"],
  nature: ["NATURE"],
  movies: ["MOVIES"],
  books: ["BOOKS", "LITERATURE", "LANGUAGE"],
  music: ["MUSIC"],
  games: ["GAMES", "SPORT", "SPORTS"],
  arts: ["ART", "ARTS", "CULTURE"],
  everyday: ["FOOD", "EVERYDAY"],
};

test("practice topics expose accurate counts and public metadata", () => {
  assert.equal(practiceTopics.length, 9);
  for (const topic of practiceTopics) {
    assert.deepEqual(Object.keys(topic).sort(), ["description", "id", "label", "questionCount"]);
    const pool = questions.filter((question) => categories[topic.id].includes(question.category));
    assert.equal(topic.questionCount, pool.length);
    assert.ok(pool.length >= 5);
  }
});

test("topic flights are deterministic, distinct and contained in the selected subject", () => {
  for (const topic of practiceTopics) {
    for (let run = 0; run < 20; run++) {
      const seed = `topic:${topic.id}:test-${run}`;
      const flight = schedule(seed, false, topic.id);
      assert.equal(flight.length, 5);
      assert.equal(new Set(flight.map((question) => question.id)).size, 5);
      assert.deepEqual(flight, schedule(seed, false, topic.id));
      assert.ok(flight.every((question) => categories[topic.id].includes(question.category)));
    }
  }
});

test("topic selection rejects unknown topics and daily or legacy filtering", () => {
  assert.throws(() => schedule("practice", false, "unknown"), /practice topic/);
  assert.throws(() => schedule("2026-11-15", false, "science"), /practice topic/);
  assert.throws(() => schedule("old-session", true, "science"), /practice topic/);
});
