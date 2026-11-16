import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const run = promisify(execFile);
const candidates = JSON.parse(
  await readFile(new URL("../content/packs/2026-11-15-daily.json", import.meta.url), "utf8"),
).questions.filter((question) => question.category === "NATURE").slice(0, 2);

test("bank build accepts small single-topic additions and a day without a pack", async (context) => {
  const root = await mkdtemp(join(tmpdir(), "rare-bank-policy-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  for (const path of ["scripts", "src", "content/packs"]) {
    await mkdir(join(root, path), { recursive: true });
  }
  await writeFile(join(root, "package.json"), '{"type":"module"}');
  await copyFile(new URL("../scripts/build-bank.mjs", import.meta.url), join(root, "scripts/build-bank.mjs"));
  await copyFile(new URL("../src/legacy-questions.js", import.meta.url), join(root, "src/legacy-questions.js"));

  const build = () => run(process.execPath, [join(root, "scripts/build-bank.mjs")]);
  assert.match((await build()).stdout, /Validated 30 questions in 0 expansion batches/);
  const packPath = join(root, "content/packs/2026-11-16-daily.json");
  const pack = {
    batch: "2026-11-16-daily",
    releasedOn: "2026-11-17",
    questions: candidates.slice(0, 1),
  };
  await writeFile(packPath, JSON.stringify(pack));
  assert.match((await build()).stdout, /Validated 31 questions in 1 expansion batches/);
  pack.questions = candidates;
  await writeFile(packPath, JSON.stringify(pack));
  assert.match((await build()).stdout, /Validated 32 questions in 1 expansion batches/);

  pack.questions = [];
  await writeFile(packPath, JSON.stringify(pack));
  await assert.rejects(build(), /Incorrect batch count/);
  pack.questions = [candidates[0], candidates[0]];
  await writeFile(packPath, JSON.stringify(pack));
  await assert.rejects(build(), /Duplicate\/invalid ID/);
});
