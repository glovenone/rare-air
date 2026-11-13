export function normalize(input) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function evaluate(question, input) {
  const normalized = normalize(input);
  const answer = question.answers.find((answer) =>
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

export const publicQuestion = (question) => ({
  id: question.id,
  category: question.category,
  prompt: question.prompt,
});
