import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {schedule, questions} from '../src/questions.js';
const base=process.env.TEST_URL||'http://127.0.0.1:8787';let cookie='';
async function request(path,body,headers={}){const r=await fetch(base+'/api/'+path,{method:body?'POST':'GET',headers:{Cookie:cookie,...(body?{'Content-Type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,data:await r.json()}}
const p=await request('puzzle');assert.equal(p.status,200);
let {data:g}=await request('start',{mode:'daily'});assert.equal(g.round,0);assert.equal(g.review,null);assert.equal(g.question,null);assert.equal(g.deadline,null);assert.equal(g.awaitingStart,true);
assert.equal((await request('answer',{id:g.id,round:0,answer:'Earth'})).status,409);
g=(await request('next',{id:g.id,round:0})).data;assert.equal(g.question.answers,undefined);
const firstDeadline=g.deadline;assert.equal((await request('next',{id:g.id,round:0})).data.deadline,firstDeadline,'next must not reset a running clock');
const resume=await request('start',{mode:'daily',language:'fr'});assert.equal(resume.data.id,g.id);
assert.equal(resume.data.deadline,firstDeadline,'daily language changes must keep the same attempt and deadline');
assert.equal(resume.data.question.prompt,schedule(g.day)[0].localizations.fr.prompt);
const badOrigin=await request('answer',{id:g.id,round:0,answer:'Earth'},{Origin:'https://evil.example'});assert.equal(badOrigin.status,403);
const q=schedule(g.day)[0],a=q.answers.at(-1);const payload={id:g.id,round:0,answer:a.label};await Promise.all([request('answer',payload),request('answer',payload)]);g=(await request('resume',{id:g.id})).data;assert.equal(g.round,1);assert.equal(g.answers.length,1);assert.equal(g.answers[0].tier,a.tier);
const stale=await request('answer',payload);assert.equal(stale.data.round,1);
assert.equal(g.awaitingStart,true);assert.equal(g.question,null,'next prompt must stay hidden during feedback');assert.equal(g.deadline,null);
g=(await request('next',{id:g.id,round:g.round})).data;
const invalid=await request('answer',{id:g.id,round:1,answer:'x'.repeat(101)});assert.equal(invalid.status,400);
const ownerCookie=cookie;cookie='rare_player=00000000-0000-0000-0000-000000000001';assert.equal((await request('resume',{id:g.id})).status,404);cookie=ownerCookie;
while(!g.done){if(g.awaitingStart)g=(await request('next',{id:g.id,round:g.round})).data;g=(await request('answer',{id:g.id,round:g.round,answer:schedule(g.day)[g.round].answers[0].label})).data}
assert.equal(g.answers.length,5);assert.equal(g.review.length,5);assert.equal((await request('leaderboard')).data.entries.length>0,true);
const final=await request('start',{mode:'daily'});assert.equal(final.data.done,true);assert.equal(final.data.id,g.id);
const practice=await request('start',{mode:'practice'});assert.notEqual(practice.data.id,g.id);assert.equal(practice.data.round,0);
assert.equal((await request('start',{day:'2026-02-30'})).status,400);
if(base==='http://127.0.0.1:8787'){
 const id=practice.data.id;
 const frozen=schedule(id);frozen[0]=JSON.parse(JSON.stringify(frozen[0]));frozen[0].answers[0].tier=4;
 const frozenJson=JSON.stringify(frozen).replaceAll("'","''");
 execFileSync('npx',['wrangler','d1','execute','DB','--local','--command',`UPDATE sessions SET questions_json='${frozenJson}' WHERE id='${id}'`],{stdio:'pipe'});
 await request('next',{id,round:0});
 const frozenResult=(await request('answer',{id,round:0,answer:frozen[0].answers[0].label})).data;
 assert.equal(frozenResult.answers[0].points,1000,'stored scoring snapshot must override current bank');
 execFileSync('npx',['wrangler','d1','execute','DB','--local','--command',`UPDATE sessions SET started=1 WHERE id='${id}'`],{stdio:'pipe'});
 const expired=(await request('answer',{id,round:1,answer:'Earth'})).data;
 assert.equal(expired.answers[1].timed_out,1);
 assert.equal(expired.answers[1].points,0);
 assert.equal(expired.round,2);
 const oldGame=(await request('start',{mode:'practice'})).data;
 execFileSync('npx',['wrangler','d1','execute','DB','--local','--command',`UPDATE sessions SET questions_json=NULL WHERE id='${oldGame.id}'`],{stdio:'pipe'});
 await request('next',{id:oldGame.id,round:0});
 const oldResumed=(await request('resume',{id:oldGame.id})).data;
 assert.equal(oldResumed.question.id,schedule(oldGame.id,true)[0].id,'legacy sessions retain original bank');
}
assert.equal(p.data.topics.length,9);
assert.equal((await request('start',{mode:'daily',topic:'science'})).status,400);
assert.equal((await request('start',{mode:'practice',topic:'missing'})).status,400);
assert.equal((await request('start',{mode:'practice',topic:42})).status,400);
let topicGame=(await request('start',{mode:'practice',topic:'science'})).data;
assert.equal(topicGame.topic,'science');
assert.equal(topicGame.mode,'practice');
const topicId=topicGame.id;
while(!topicGame.done){
 topicGame=(await request('next',{id:topicId,round:topicGame.round})).data;
 assert.equal(topicGame.topic,'science');
 assert.ok(['SCIENCE','SPACE','TECH','TECHNOLOGY','MATH'].includes(topicGame.question.category));
 assert.equal(topicGame.question.answers,undefined);
 topicGame=(await request('answer',{id:topicId,round:topicGame.round,answer:''})).data;
}
assert.equal(topicGame.review.length,5);
assert.equal((await request('resume',{id:topicId})).data.topic,'science');
let localized=(await request('start',{mode:'practice',language:'zh'})).data;
localized=(await request('next',{id:localized.id,round:0,language:'zh'})).data;
const localizedSource=schedule(localized.id)[0];
assert.equal(localized.question.prompt,localizedSource.localizations.zh.prompt);
assert.equal(localized.question.answers,undefined);
assert.equal(localized.review,null);
const translatedResume=(await request('resume',{id:localized.id,language:'ar'})).data;
assert.equal(translatedResume.id,localized.id);
assert.equal(translatedResume.deadline,localized.deadline,'a language change must not reset the running clock');
assert.equal(translatedResume.question.prompt,localizedSource.localizations.ar.prompt);
const localizedAnswer=(await request('answer',{id:localized.id,round:0,language:'zh',answer:localizedSource.localizations.zh.answers[0]})).data;
assert.equal(localizedAnswer.answers[0].correct,1);
assert.equal(localizedAnswer.answers[0].label,localizedSource.localizations.zh.answers[0]);
assert.equal(localizedAnswer.answers[0].points,[0,100,250,500,1000][localizedSource.answers[0].tier]);
assert.equal((await request('resume',{id:localized.id,language:'en'})).data.answers[0].label,localizedSource.answers[0].label);
if(base==='http://127.0.0.1:8787'){
 const angle=questions.find(question=>question.id==='exp-aa8508a0ebc10b');
 const german=(await request('start',{mode:'practice',language:'de'})).data;
 const snapshot=schedule(german.id);snapshot[0]=angle;
 execFileSync('npx',['wrangler','d1','execute','DB','--local','--command',`UPDATE sessions SET questions_json='${JSON.stringify(snapshot).replaceAll("'","''")}' WHERE id='${german.id}'`],{stdio:'pipe'});
 await request('next',{id:german.id,round:0,language:'de'});
 const scored=(await request('answer',{id:german.id,round:0,language:'de',answer:'Grad'})).data;
 assert.equal(scored.answers[0].points,[0,100,250,500,1000][angle.answers[0].tier]);
 assert.equal((await request('resume',{id:german.id,language:'en'})).data.answers[0].label,'Degree','German Grad must not use the English gradian abbreviation');
}
console.log('PASS: paused reveal state, hidden next prompts, idempotent clock start, frozen scoring snapshots, legacy session compatibility, server-enforced timeout, game lifecycle, real D1, concurrent submissions, idempotency, ownership, same-origin, aliases, leaderboard, daily replay protection, practice, date validation, topic metadata and validation, five topic rounds and topic recovery.');
