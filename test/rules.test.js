import {test} from 'node:test';
import assert from 'node:assert/strict';
import {questions,normalize,evaluate,schedule,publicQuestion} from '../src/questions.js';
test('normalizes punctuation accents and case',()=>{assert.equal(normalize('  Émily Brontë! '),'emilybronte');assert.equal(evaluate(questions.find(q=>q.id==='g7'),'U.S.A.').points,100)});
test('all curated aliases resolve to exactly their intended tier',()=>{for(const q of questions)for(const a of q.answers)for(const name of [a.label,...a.aliases]){assert.equal(evaluate(q,name).label,a.label);assert.equal(evaluate(q,name).tier,a.tier)}});
test('rarer valid answers earn more, invalid and blank earn zero',()=>{const q=questions[0];assert.ok(evaluate(q,'Uranus').points>evaluate(q,'Earth').points);assert.equal(evaluate(q,'Pluto').points,0);assert.equal(evaluate(q,'').points,0)});
test('daily scheduling is deterministic and has five distinct prompts',()=>{for(let i=0;i<100;i++){const key='day-'+i;assert.deepEqual(schedule(key),schedule(key));assert.equal(new Set(schedule(key).map(q=>q.id)).size,5)}assert.notDeepEqual(schedule('2026-11-12'),schedule('2026-11-13'))});
test('public questions contain no answer keys',()=>{for(const q of questions){assert.deepEqual(Object.keys(publicQuestion(q)).sort(),['category','id','prompt']);}});
