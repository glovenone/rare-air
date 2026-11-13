import { evaluate, publicQuestion } from "../src/answers.js";
import { questions } from "../src/questions.js";

export function createOfflineClient(randomWords = (count) =>
  crypto.getRandomValues(new Uint32Array(count))) {
  let session = null;

  function state() {
    if (!session) throw new Error("Start an offline flight first.");
    const done = session.round === 5;
    return {
      id: session.id,
      mode: "offline",
      day: session.day,
      name: "Offline flyer",
      round: session.round,
      done,
      awaitingStart: !done && session.started === 0,
      deadline: session.started ? session.started + 30000 : null,
      serverNow: Date.now(),
      question:
        done || session.started === 0
          ? null
          : publicQuestion(session.questions[session.round]),
      answers: session.answers,
      review: done
        ? session.questions.map((question) => ({
            ...publicQuestion(question),
            answers: question.answers.map((answer) => ({
              label: answer.label,
              tier: answer.tier,
            })),
          }))
        : null,
    };
  }

  return function offlineRequest(path, body = {}) {
    if (path === "start") {
      const day = new Date().toISOString().slice(0, 10);
      const pool = questions.filter((question) =>
        !question.releasedOn || question.releasedOn <= day);
      for (let index = pool.length - 1; index > 0; index--) {
        const random = randomWords(1)[0] / 4294967296;
        const other = Math.floor(random * (index + 1));
        [pool[index], pool[other]] = [pool[other], pool[index]];
      }
      session = {
        id:
          "offline:" +
          [...randomWords(4)]
            .map((value) => value.toString(16).padStart(8, "0"))
            .join(""),
        day,
        round: 0,
        started: 0,
        questions: pool.slice(0, 5),
        answers: [],
      };
    } else {
      if (!session || session.id !== body.id)
        throw new Error("Offline flight not found. Start a new flight.");
      if (
        path === "next" &&
        body.round === session.round &&
        !session.started &&
        session.round < 5
      )
        session.started = Date.now();
      if (
        path === "answer" &&
        body.round === session.round &&
        session.started &&
        session.round < 5
      ) {
        if (typeof body.answer !== "string" || body.answer.length > 100)
          throw new Error("Use an answer under 100 characters.");
        const timedOut = Date.now() > session.started + 30000;
        const question = session.questions[session.round];
        const result = evaluate(question, timedOut ? "" : body.answer.trim());
        session.answers.push({
          ...result,
          question: question.id,
          timed_out: Number(timedOut),
        });
        session.round++;
        session.started = 0;
      }
    }
    return JSON.parse(JSON.stringify(state()));
  };
}

export const offlineRequest = createOfflineClient();
