import { translations } from "./localized-bank.js";

export function withTranslations(question) {
  if (question.localizations) return question;
  const entry = translations[question.id];
  if (!entry || entry.sourcePrompt !== question.prompt ||
      entry.sourceAnswers.length !== question.answers.length ||
      entry.sourceAnswers.some((label, index) => label !== question.answers[index].label)) {
    return question;
  }
  return {
    ...question,
    localizations: entry.languages,
  };
}

export function answerLabel(question, label, language = "en") {
  const index = question.answers.findIndex((answer) => answer.label === label);
  return question.localizations?.[language]?.answers[index] || label;
}
