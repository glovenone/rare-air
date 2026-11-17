import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { progressFromRecords } from "../src/progression.js";
const compiled = await build({
  entryPoints: ["src/rewards.ts"],
  bundle: true,
  format: "esm",
  platform: "node",
  write: false,
});
const { earnedSkyPoints } = await import(
  "data:text/javascript;base64," +
    Buffer.from(compiled.outputFiles[0].text).toString("base64")
);
const day = "2026-11-17";
const record = (
  mode,
  seed,
  score,
  completed_at = Date.parse(day + "T12:00:00Z"),
) => ({ day, mode, seed, score, completed_at });

test("points reward unique eligible daily dates and chapters and only improve with best scores", () => {
  const rows = [
    record("daily", day, 1000),
    record("daily", day, 2500),
    record("practice", "chapter:world-01:a", 4000),
    record("practice", "chapter:world-01:b", 1000),
  ];
  assert.equal(earnedSkyPoints(progressFromRecords(rows, day)), 85);
  assert.equal(
    earnedSkyPoints(progressFromRecords([...rows, rows[0], rows[2]], day)),
    85,
  );
  assert.equal(
    earnedSkyPoints(
      progressFromRecords(
        [...rows, record("practice", "chapter:world-01:c", 5000)],
        day,
      ),
    ),
    95,
  );
});
test("archive, late, legacy and unrestricted practice flights do not earn spendable points", () => {
  const rows = [
    record("daily", day, 5000, null),
    record("daily", day, 5000, Date.parse("2026-11-18")),
    record("practice", "random", 5000),
    { ...record("daily", "2026-11-16", 5000), day: "2026-11-16" },
  ];
  assert.equal(earnedSkyPoints(progressFromRecords(rows, day)), 0);
  assert.equal(earnedSkyPoints({ dailyBest: { a: 9000 }, chapters: {} }), 60);
});
