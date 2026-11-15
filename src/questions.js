import {questions as legacyQuestions} from './legacy-questions.js';
import {bank, batches} from './bank.js';
export {legacyQuestions};
export const questions = [...legacyQuestions, ...bank];
export const bankInfo = {bankSize:questions.length, latestBatch:batches[batches.length-1]?.batch || 'legacy'};
export { normalize, evaluate, publicQuestion } from './answers.js';
const topicGroups = [
  {
    id: 'world', label: 'Around the world', description: 'Geography and history',
    categories: ['GEOGRAPHY', 'HISTORY'],
  },
  {
    id: 'science', label: 'Science & space', description: 'Discoveries, technology and numbers',
    categories: ['SCIENCE', 'SPACE', 'TECH', 'TECHNOLOGY', 'MATH'],
  },
  {
    id: 'nature', label: 'The natural world', description: 'Animals, plants and the living planet',
    categories: ['NATURE'],
  },
  {
    id: 'movies', label: 'At the movies', description: 'Films, characters and the big screen',
    categories: ['MOVIES'],
  },
  {
    id: 'books', label: 'Books & words', description: 'Literature and language',
    categories: ['BOOKS', 'LITERATURE', 'LANGUAGE'],
  },
  {
    id: 'music', label: 'All about music', description: 'Instruments, artists and musical knowledge',
    categories: ['MUSIC'],
  },
  {
    id: 'games', label: 'Games & sport', description: 'From the game board to the playing field',
    categories: ['GAMES', 'SPORT', 'SPORTS'],
  },
  {
    id: 'arts', label: 'Art & culture', description: 'Creative works and cultural knowledge',
    categories: ['ART', 'ARTS', 'CULTURE'],
  },
  {
    id: 'everyday', label: 'Food & everyday', description: 'Familiar things with surprising answers',
    categories: ['FOOD', 'EVERYDAY'],
  },
];
export const practiceTopics = topicGroups.map(({ id, label, description, categories }) => ({
  id, label, description,
  questionCount: questions.filter(question => categories.includes(question.category)).length,
})).filter(topic => topic.questionCount >= 5);

export function schedule(key, legacyOnly = false, topic = null) {
  let seed = 2166136261;
  for (const character of 'rare-v1:' + key) {
    seed = Math.imul(seed ^ character.charCodeAt(0), 16777619) >>> 0;
  }
  const daily = /^\d{4}-\d{2}-\d{2}$/.test(key);
  let pool = legacyOnly
    ? [...legacyQuestions]
    : [...legacyQuestions, ...bank.filter(question => !daily || question.releasedOn <= key)];
  if (topic !== null) {
    const group = topicGroups.find(group => group.id === topic);
    if (!group || daily || legacyOnly) throw new Error('Choose an available practice topic.');
    pool = pool.filter(question => group.categories.includes(question.category));
    if (pool.length < 5) throw new Error('This topic needs more questions before takeoff.');
  }
  for (let index = pool.length - 1; index > 0; index--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const other = seed % (index + 1);
    [pool[index], pool[other]] = [pool[other], pool[index]];
  }
  return pool.slice(0, 5);
}
