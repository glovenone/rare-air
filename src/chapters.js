import manifest from "../content/routes.json" with { type: "json" };
import { questions, practiceTopics } from "./questions.js";

const bank = new Map(questions.map((question) => [question.id, question]));
export const chapterRoutes = manifest.routes.map((route) => {
  const topic = practiceTopics.find((topic) => topic.id === route.id);
  if (!topic) throw new Error("Unknown chapter route: " + route.id);
  const chapters = route.chapters.map((chapter, index) => {
    if (
      chapter.questions.length !== 5 ||
      chapter.questions.some((id) => !bank.has(id)) ||
      new Set(chapter.questions).size !== 5
    ) {
      throw new Error("Invalid or repeated chapter question: " + chapter.id);
    }
    return {
      id: chapter.id,
      number: index + 1,
      questionIds: chapter.questions,
    };
  });
  return {
    id: route.id,
    label: topic.label,
    description: topic.description,
    chapters,
  };
});

export function chapterInfo(id) {
  for (const route of chapterRoutes) {
    const chapter = route.chapters.find((chapter) => chapter.id === id);
    if (chapter)
      return {
        id: chapter.id,
        number: chapter.number,
        route: route.id,
        label: route.label,
      };
  }
  return null;
}

export function chapterQuestions(id) {
  for (const route of chapterRoutes) {
    const chapter = route.chapters.find((chapter) => chapter.id === id);
    if (chapter) return chapter.questionIds.map((id) => bank.get(id));
  }
  throw new Error("Choose an available chapter.");
}

export const publicRoutes = chapterRoutes.map((route) => ({
  id: route.id,
  label: route.label,
  description: route.description,
  chapters: route.chapters.map((chapter) => ({
    id: chapter.id,
    number: chapter.number,
  })),
}));

export function chapterFromSeed(seed) {
  const id = seed.match(/^chapter:([a-z]+-\d{2}):/)?.[1];
  return id ? chapterInfo(id) : null;
}
