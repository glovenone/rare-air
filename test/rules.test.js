import {test} from 'node:test';
import assert from 'node:assert/strict';
import {questions,normalize,evaluate,schedule,publicQuestion,legacyQuestions,bankInfo} from '../src/questions.js';
test('normalizes punctuation accents and case',()=>{assert.equal(normalize('  Émily Brontë! '),'emilybronte');assert.equal(evaluate(questions.find(q=>q.id==='g7'),'U.S.A.').points,100)});
test('all curated aliases resolve to exactly their intended tier',()=>{for(const q of questions)for(const a of q.answers)for(const name of [a.label,...a.aliases]){assert.equal(evaluate(q,name).label,a.label);assert.equal(evaluate(q,name).tier,a.tier)}});
test('rarer valid answers earn more, invalid and blank earn zero',()=>{const q=questions[0];assert.ok(evaluate(q,'Uranus').points>evaluate(q,'Earth').points);assert.equal(evaluate(q,'Pluto').points,0);assert.equal(evaluate(q,'').points,0)});
test('daily scheduling is deterministic and has five distinct prompts',()=>{for(let i=0;i<100;i++){const key='day-'+i;assert.deepEqual(schedule(key),schedule(key));assert.equal(new Set(schedule(key).map(q=>q.id)).size,5)}assert.notDeepEqual(schedule('2026-11-12'),schedule('2026-11-13'))});
test('public questions contain no answer keys',()=>{for(const q of questions){assert.deepEqual(Object.keys(publicQuestion(q)).sort(),['category','id','prompt']);}});

test('bank contains at least 300 unique question IDs with validated answer sets',()=>{assert.ok(questions.length>=300);assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);assert.equal(bankInfo.bankSize,questions.length)});
test('launch daily puzzles are unchanged after the expansion',()=>{assert.deepEqual(schedule('2026-11-12'),schedule('2026-11-12',true));assert.equal(legacyQuestions.length,30)});
test('new packs enter daily selection only from their release date',()=>{for(let n=0;n<20;n++){const date=new Date(Date.UTC(2026,10,13+n)).toISOString().slice(0,10);for(const q of schedule(date))assert.ok(!q.releasedOn||q.releasedOn<=date);}assert.ok(Array.from({length:30},(_,i)=>schedule('practice-test-'+i)).flat().some(q=>q.id.startsWith('exp-')))});
