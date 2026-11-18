import test from "node:test";
import assert from "node:assert/strict";
import { questions, evaluate, normalize, publicQuestion } from "../src/questions.js";
import { withTranslations } from "../src/localization.js";
import { locales, resolveLocale, localizedPath } from "../public/locales.js";
import { createOfflineClient } from "../native/offline.js";

test("answer normalization preserves distinct scripts and handles localized decimal digits", () => {
  assert.notEqual(normalize("火星"), normalize("水星"));
  assert.notEqual(normalize("バ"), normalize("ハ"));
  assert.equal(normalize(" الْأَرْض "), normalize("الأرض"));
  assert.notEqual(normalize("إبسيلون"), normalize("أبسيلون"));
  assert.equal(normalize("١٢٣"), "123");
  assert.equal(normalize("۱۲۳"), "123");
  assert.equal(normalize("Émily Brontë!"), "emilybronte");
});

test("Arabic hamza remains meaningful while unambiguous spelling variants are accepted", () => {
  const greek = questions.find((question) => question.id === "greek");
  assert.equal(evaluate(greek, "إبسيلون", "ar").label, "Epsilon");
  assert.equal(evaluate(greek, "أبسيلون", "ar").label, "Upsilon");
  assert.equal(evaluate(greek, "ابسيلون", "ar").correct, false, "ambiguous unmarked names must not silently select another letter");
  const planets = questions.find((question) => question.id === "planets");
  assert.equal(evaluate(planets, "الارض", "ar").label, "Earth");
});

test("all supported languages cover the bank and retain canonical scoring", () => {
  const translated = locales.filter((locale) => locale.code !== "en");
  assert.equal(locales.length, 11);
  assert.deepEqual(locales.map(({ code }) => code), ["en", "zh", "es", "fr", "pt", "de", "ja", "ko", "ru", "ar", "id"]);
  for (const question of questions) {
    for (const { code } of translated) {
      const entry = question.localizations?.[code];
      assert.ok(entry?.prompt, `${code} covers ${question.id}`);
      assert.equal(entry.answers.length, question.answers.length);
      entry.answers.forEach((label, index) => {
        for (const input of [label, ...(entry.aliases?.[index] || [])]) {
          const result = evaluate(question, input, code);
          assert.equal(result.label, question.answers[index].label, `${code} ${question.id} ${input}`);
          assert.equal(result.tier, question.answers[index].tier);
        }
        assert.equal(evaluate(question, question.answers[index].label, code).label, question.answers[index].label);
      });
      assert.deepEqual(Object.keys(publicQuestion(question, code)).sort(), ["category", "id", "prompt"]);
    }
  }
});

test("the selected language disambiguates local terms before English abbreviations", () => {
  const angle = questions.find((question) => question.id === "exp-aa8508a0ebc10b");
  assert.equal(evaluate(angle, "Grad", "de").label, "Degree");
  assert.equal(evaluate(angle, "grad", "en").label, "Gradian");
  assert.equal(evaluate(angle, "Gradian", "de").label, "Gradian");
  assert.equal(evaluate(angle, "Gon", "de").label, "Gradian");
});

test("locale changes preserve offline sessions, timers, points and accepted-answer review", () => {
  const request = createOfflineClient((count) => new Uint32Array(count));
  let game = request("start", { language: "zh" });
  const id = game.id;
  while (!game.done) {
    game = request("next", { id, round: game.round, language: "zh" });
    const question = questions.find((item) => item.id === game.question.id);
    assert.equal(game.question.prompt, question.localizations.zh.prompt);
    const resumed = request("resume", { id, language: "de" });
    assert.equal(resumed.id, id);
    assert.equal(resumed.round, game.round);
    assert.equal(resumed.deadline, game.deadline);
    assert.equal(resumed.question.prompt, question.localizations.de.prompt);
    game = request("answer", { id, round: game.round, language: "zh", answer: question.localizations.zh.answers[0] });
    assert.equal(game.answers.at(-1).correct, true);
    assert.equal(game.answers.at(-1).label, question.localizations.zh.answers[0]);
  }
  const english = request("resume", { id, language: "en" });
  assert.deepEqual(english.answers.map((answer) => answer.points), game.answers.map((answer) => answer.points));
  assert.equal(english.review.length, 5);
  assert.equal(english.review[0].answers[0].label, questions.find((item) => item.id === english.review[0].id).answers[0].label);
});

test("historic snapshots and locale routing retain their original meaning", () => {
  const snapshot = { ...questions[0], prompt: "An older version of this question.", localizations: undefined };
  assert.equal(withTranslations(snapshot), snapshot);
  assert.equal(publicQuestion(snapshot, "zh").prompt, snapshot.prompt);
  assert.equal(resolveLocale("pt-BR").code, "pt");
  assert.equal(resolveLocale("zh-TW").code, "en");
  assert.equal(resolveLocale("unsupported").code, "en");
  assert.equal(localizedPath("/fr/how-to-play/", "ja"), "/ja/how-to-play/");
  assert.equal(localizedPath("/ar/", "en"), "/");
});

test("reviewed localized terminology and common Chinese aliases retain their intended answers", () => {
  for (const [id, input, label] of [
    ["noble-gases", "氖气", "Neon"],
    ["chess", "皇后", "Queen"],
    ["zodiac", "巨蟹座", "Cancer"],
    ["si", "公斤", "Kilogram"],
    ["great-lakes", "苏必利尔湖", "Superior"],
  ]) {
    assert.equal(evaluate(questions.find((question) => question.id === id), input, "zh").label, label);
  }
});
