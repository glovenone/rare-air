import { publicRoutes } from "./chapters.js";
import { companions } from "../public/companions.js";
import { flightTrails } from "../public/trails.js";

export function chapterStars(score) {
  return [1000, 2500, 4000].filter((threshold) => score >= threshold).length;
}

export function dailyStreak(days, today) {
  const dayNumber = (day) => Date.parse(day + "T00:00:00Z") / 86400000;
  const ordered = [...new Set(days)]
    .map(dayNumber)
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  const end = dayNumber(today);
  let best = 0;
  let run = 0;
  let previous = -Infinity;
  for (const day of ordered) {
    if (day > end) continue;
    run = day === previous + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }
  return {
    current: previous >= end - 1 ? run : 0,
    best,
    completedToday: ordered.includes(end),
  };
}

export function progressFromRecords(records, today) {
  const chapters = {};
  const eligible = [];
  const dailyDates = new Set();
  let totalDaily = 0;
  let legacyDaily = 0;
  for (const record of records) {
    if (record.mode === "daily") {
      dailyDates.add(record.day);
      totalDaily = dailyDates.size;
      if (record.completed_at == null) legacyDaily++;
      else if (
        new Date(record.completed_at).toISOString().slice(0, 10) === record.day
      )
        eligible.push(record.day);
    }
    const id = record.seed.match(/^chapter:([a-z]+-\d{2}):/)?.[1];
    if (!id) continue;
    const previous = chapters[id] || { score: 0, stars: 0, attempts: 0 };
    const score = Math.max(previous.score, Number(record.score));
    chapters[id] = {
      score,
      stars: chapterStars(score),
      attempts: previous.attempts + 1,
    };
  }
  const streak = dailyStreak(eligible, today);
  return {
    day: today,
    totalDaily,
    legacyDaily,
    chapters,
    streak,
    unlockedCompanions: companions
      .filter((item) => streak.best >= item.days)
      .map((item) => item.id),
    unlockedTrails: flightTrails
      .filter((trail) => streak.best >= trail.days)
      .map((trail) => trail.id),
    routes: publicRoutes.map((route) => ({
      ...route,
      chapters: route.chapters.map((chapter, index) => ({
        ...chapter,
        completed: Boolean(chapters[chapter.id]),
        unlocked:
          index === 0 || Boolean(chapters[route.chapters[index - 1].id]),
        best: chapters[chapter.id]?.score || 0,
        stars: chapters[chapter.id]?.stars || 0,
      })),
    })),
  };
}

export async function playerProgress(db, player, today) {
  const { results } = await db
    .prepare(
      "SELECT s.day,s.mode,s.seed,s.completed_at,SUM(a.points) AS score FROM sessions s JOIN answers a ON a.session=s.id WHERE (s.player=? OR s.player IN (SELECT player FROM passport_players WHERE account=(SELECT id FROM passports WHERE player=?))) AND s.round=5 GROUP BY s.id",
    )
    .bind(player, player)
    .all();
  return progressFromRecords(results, today);
}
