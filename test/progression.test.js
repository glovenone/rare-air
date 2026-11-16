import test from "node:test";
import { createHash } from "node:crypto";
import manifest from "../content/routes.json" with { type: "json" };
import original from "./routes-original-hashes.json" with { type: "json" };
import assert from "node:assert/strict";
import {
  chapterRoutes,
  chapterQuestions,
  chapterFromSeed,
} from "../src/chapters.js";
import {
  chapterStars,
  dailyStreak,
  progressFromRecords,
} from "../src/progression.js";

test("frozen chapters contain distinct bank questions and retain their IDs on replay", () => {
  assert.equal(chapterRoutes.length, 9);
  for (const route of chapterRoutes) {
    assert.equal(
      route.chapters.length,
      ["world", "movies", "books", "games"].includes(route.id) ? 30 : 6,
    );
    const first = manifest.routes
      .find((item) => item.id === route.id)
      .chapters.slice(0, 6);
    assert.equal(
      createHash("sha256").update(JSON.stringify(first)).digest("hex"),
      original[route.id],
    );
    const ids = route.chapters
      .slice(0, 6)
      .flatMap((chapter) => chapter.questionIds);
    const sets = route.chapters.map((chapter) =>
      [...chapter.questionIds].sort().join(","),
    );
    assert.equal(new Set(sets).size, sets.length);
    assert.equal(ids.length, 30);
    assert.equal(new Set(ids).size, 30);
    for (const chapter of route.chapters) {
      assert.deepEqual(
        chapterQuestions(chapter.id).map((question) => question.id),
        chapter.questionIds,
      );
      assert.equal(
        chapterFromSeed("chapter:" + chapter.id + ":different-session").id,
        chapter.id,
      );
    }
  }
  assert.equal(chapterFromSeed("topic:science:legacy"), null);
  assert.throws(() => chapterQuestions("unknown"), /available chapter/);
});

test("star thresholds and best chapter progress retain a stronger earlier attempt", () => {
  assert.deepEqual(
    [0, 999, 1000, 2499, 2500, 3999, 4000, 5000].map(chapterStars),
    [0, 0, 1, 1, 2, 2, 3, 3],
  );
  const progress = progressFromRecords(
    [
      { mode: "practice", seed: "chapter:science-01:first", score: 4000 },
      { mode: "practice", seed: "chapter:science-01:second", score: 0 },
    ],
    "2026-11-16",
  );
  const course = progress.routes.find((route) => route.id === "science");
  assert.equal(course.chapters[0].best, 4000);
  assert.equal(course.chapters[0].stars, 3);
  assert.equal(course.chapters[1].unlocked, true);
  assert.equal(course.chapters[2].unlocked, false);
  assert.equal(progress.chapters["science-01"].attempts, 2);
});

test("daily streaks handle UTC boundaries, gaps, duplicate dates and the unfinished current day", () => {
  assert.deepEqual(
    dailyStreak(
      ["2026-11-13", "2026-11-14", "2026-11-15", "2026-11-15"],
      "2026-11-16",
    ),
    { current: 3, best: 3, completedToday: false },
  );
  assert.deepEqual(
    dailyStreak(["2026-11-13", "2026-11-14", "2026-11-15"], "2026-11-17"),
    { current: 0, best: 3, completedToday: false },
  );
  assert.deepEqual(
    dailyStreak(["2026-11-14", "2026-11-16", "2026-11-17"], "2026-11-16"),
    { current: 1, best: 1, completedToday: true },
  );
  assert.deepEqual(dailyStreak([], "2026-11-16"), {
    current: 0,
    best: 0,
    completedToday: false,
  });
});

test("archive, late and legacy completions preserve totals without backfilling streaks", () => {
  const record = (day, finished) => ({
    day,
    mode: "daily",
    seed: day,
    completed_at: finished && Date.parse(finished),
    score: 0,
  });
  const progress = progressFromRecords(
    [
      record("2026-11-12", null),
      record("2026-11-13", "2026-11-16T12:00:00Z"),
      record("2026-11-14", "2026-11-15T00:00:00Z"),
      record("2026-11-15", "2026-11-15T23:59:59Z"),
      record("2026-11-16", "2026-11-16T00:00:00Z"),
    ],
    "2026-11-16",
  );
  assert.equal(progress.totalDaily, 5);
  assert.equal(progress.legacyDaily, 1);
  assert.deepEqual(progress.streak, {
    current: 2,
    best: 2,
    completedToday: true,
  });
  assert.deepEqual(progress.unlockedTrails, ["classic"]);
});

test("earned trails remain unlocked after a streak breaks", () => {
  const records = ["2026-11-12", "2026-11-13", "2026-11-14"].map((day) => ({
    mode: "daily",
    seed: day,
    day,
    score: 0,
    completed_at: Date.parse(day + "T12:00:00Z"),
  }));
  const progress = progressFromRecords(records, "2026-11-16");
  assert.equal(progress.streak.current, 0);
  assert.equal(progress.streak.best, 3);
  assert.deepEqual(progress.unlockedTrails, ["classic", "gold"]);
});
