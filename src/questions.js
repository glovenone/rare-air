import {questions as legacyQuestions} from './legacy-questions.js';
import {bank, batches} from './bank.js';
export {legacyQuestions};
export const questions = [...legacyQuestions, ...bank];
export const bankInfo = {bankSize:questions.length, latestBatch:batches.at(-1)?.batch || 'legacy'};
export const normalize=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function evaluate(question,input){const n=normalize(input);const a=question.answers.find(a=>[a.label,...a.aliases].some(x=>normalize(x)===n));return a?{correct:true,label:a.label,tier:a.tier,points:[0,100,250,500,1000][a.tier]}:{correct:false,label:input,tier:0,points:0};}
export function schedule(key, legacyOnly=false){
 let seed=2166136261;for(const c of 'rare-v1:'+key)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
 const daily=/^\d{4}-\d{2}-\d{2}$/.test(key);
 const pool=legacyOnly?[...legacyQuestions]:[...legacyQuestions,...bank.filter(q=>!daily||q.releasedOn<=key)];
 for(let i=pool.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}
 return pool.slice(0,5);
}
export const publicQuestion=q=>({id:q.id,category:q.category,prompt:q.prompt});
