export function normalize(input) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\u064b-\u0652\u0656-\u065f\u0670\u0640]/g, "")
    .replace(/[٠-٩۰-۹०-९০-৯]/g, (digit) => {
      const code = digit.codePointAt(0);
      const zero = [0x0660, 0x06f0, 0x0966, 0x09e6].find((start) => code >= start && code <= start + 9);
      return String(code - zero);
    })
    .replace(/[^\p{L}\p{N}\p{M}]/gu, "");
}

export function evaluate(question, input, language = "en") {
  const normalized = normalize(input);
  const localized = question.localizations?.[language];
  let localIndex = localized?.answers.findIndex((label, index) =>
    [label, ...(localized.aliases?.[index] || [])].some((alias) => normalize(alias) === normalized),
  ) ?? -1;
  if (localIndex < 0 && language === "ar" && localized && /[\u0600-\u06ff]/.test(input)) {
    // Forgive omitted hamza only when it still identifies one answer. Its
    // position distinguishes names such as Arabic epsilon and upsilon.
    const relaxed = (value) => normalize(value).replace(/[\u0653-\u0655]/g, "");
    const candidates = localized.answers.flatMap((label, index) =>
      [label, ...(localized.aliases?.[index] || [])].some((alias) => relaxed(alias) === relaxed(input)) ? [index] : [],
    );
    if (candidates.length === 1) localIndex = candidates[0];
  }
  const answer = localIndex >= 0 ? question.answers[localIndex] : question.answers.find((answer) =>
    [answer.label, ...answer.aliases].some(
      (alias) => normalize(alias) === normalized,
    ),
  );
  if (!answer) return { correct: false, label: input, tier: 0, points: 0 };
  return {
    correct: true,
    label: answer.label,
    tier: answer.tier,
    points: [0, 100, 250, 500, 1000][answer.tier],
  };
}

export const publicQuestion = (question, language = "en") => ({
  id: question.id,
  category: question.category,
  prompt: question.localizations?.[language]?.prompt || question.prompt,
});
