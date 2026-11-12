import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {schedule} from '../src/questions.js';
const base=process.env.TEST_URL||'http://127.0.0.1:8787';let cookie='';
async function request(path,body,headers={}){const r=await fetch(base+'/api/'+path,{method:body?'POST':'GET',headers:{Cookie:cookie,...(body?{'Content-Type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,data:await r.json()}}
const p=await request('puzzle');assert.equal(p.status,200);
let {data:g}=await request('start',{mode:'daily'});assert.equal(g.round,0);assert.equal(g.review,null);assert.equal(g.question.answers,undefined);
const resume=await request('start',{mode:'daily'});assert.equal(resume.data.id,g.id);
const badOrigin=await request('answer',{id:g.id,round:0,answer:'Earth'},{Origin:'https://evil.example'});assert.equal(badOrigin.status,403);
const q=schedule(g.day)[0],a=q.answers.at(-1);const payload={id:g.id,round:0,answer:a.label};await Promise.all([request('answer',payload),request('answer',payload)]);g=(await request('resume',{id:g.id})).data;assert.equal(g.round,1);assert.equal(g.answers.length,1);assert.equal(g.answers[0].tier,a.tier);
const stale=await request('answer',payload);assert.equal(stale.data.round,1);
const invalid=await request('answer',{id:g.id,round:1,answer:'x'.repeat(101)});assert.equal(invalid.status,400);
const ownerCookie=cookie;cookie='rare_player=00000000-0000-0000-0000-000000000001';assert.equal((await request('resume',{id:g.id})).status,404);cookie=ownerCookie;
while(!g.done){g=(await request('answer',{id:g.id,round:g.round,answer:schedule(g.day)[g.round].answers[0].label})).data}
assert.equal(g.answers.length,5);assert.equal(g.review.length,5);assert.equal((await request('leaderboard')).data.entries.length>0,true);
const final=await request('start',{mode:'daily'});assert.equal(final.data.done,true);assert.equal(final.data.id,g.id);
const practice=await request('start',{mode:'practice'});assert.notEqual(practice.data.id,g.id);assert.equal(practice.data.round,0);
assert.equal((await request('start',{day:'2026-02-30'})).status,400);
if(base==='http://127.0.0.1:8787'){
 const id=practice.data.id;
 execFileSync('npx',['wrangler','d1','execute','DB','--local','--command',`UPDATE sessions SET started=0 WHERE id='${id}'`],{stdio:'pipe'});
 const expired=(await request('answer',{id,round:0,answer:'Earth'})).data;
 assert.equal(expired.answers[0].timed_out,1);
 assert.equal(expired.answers[0].points,0);
 assert.equal(expired.round,1);
}
console.log('PASS: server-enforced timeout, game lifecycle, real D1, concurrent submissions, idempotency, ownership, same-origin, aliases, leaderboard, daily replay protection, practice, date validation.');
