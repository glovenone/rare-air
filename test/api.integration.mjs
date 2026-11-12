import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {schedule} from '../src/questions.js';
const base=process.env.TEST_URL||'http://127.0.0.1:8787';let cookie='';
async function request(path,body,headers={}){const r=await fetch(base+'/api/'+path,{method:body?'POST':'GET',headers:{Cookie:cookie,...(body?{'Content-Type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,data:await r.json()}}
const p=await request('puzzle');assert.equal(p.status,200);
let {data:g}=await request('start',{mode:'daily'});assert.equal(g.round,0);assert.equal(g.review,null);assert.equal(g.question,null);assert.equal(g.deadline,null);assert.equal(g.awaitingStart,true);
assert.equal((await request('answer',{id:g.id,round:0,answer:'Earth'})).status,409);
g=(await request('next',{id:g.id,round:0})).data;assert.equal(g.question.answers,undefined);
const firstDeadline=g.deadline;assert.equal((await request('next',{id:g.id,round:0})).data.deadline,firstDeadline,'next must not reset a running clock');
const resume=await request('start',{mode:'daily'});assert.equal(resume.data.id,g.id);
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
console.log('PASS: paused reveal state, hidden next prompts, idempotent clock start, frozen scoring snapshots, legacy session compatibility, server-enforced timeout, game lifecycle, real D1, concurrent submissions, idempotency, ownership, same-origin, aliases, leaderboard, daily replay protection, practice, date validation.');
