export interface Question {id:string;category:string;prompt:string;answers:{label:string;aliases:string[];tier:number}[]}
export function normalize(s:string):string;
export function evaluate(q:Question,s:string):{correct:boolean;label:string;tier:number;points:number};
export function schedule(key:string,legacyOnly?:boolean,topic?:string|null):Question[];
export const practiceTopics:{id:string;label:string;description:string;questionCount:number}[];
export function publicQuestion(q:Question):{id:string;category:string;prompt:string};
export const questions:Question[];

export const bankInfo:{bankSize:number;latestBatch:string};
export const legacyQuestions:Question[];
