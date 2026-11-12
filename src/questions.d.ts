export interface Question {id:string;category:string;prompt:string;answers:{label:string;aliases:string[];tier:number}[]}
export function normalize(s:string):string;
export function evaluate(q:Question,s:string):{correct:boolean;label:string;tier:number;points:number};
export function schedule(key:string):Question[];
export function publicQuestion(q:Question):{id:string;category:string;prompt:string};
export const questions:Question[];
