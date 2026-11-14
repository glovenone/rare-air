import {schedule, evaluate, publicQuestion, bankInfo} from './questions.js';
import type {Question} from './questions.js';
interface Env {DB:D1Database;ASSETS:Fetcher;INDEXNOW_KEY?:string}
interface Session {id:string;player:string;day:string;mode:string;seed:string;round:number;started:number;created:number;name:string;questions_json:string|null}
const utc=()=>new Date().toISOString().slice(0,10);
const json=(data:unknown,status=200,headers:Record<string,string>={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});
const fail=(message:string,status=400)=>json({error:message},status);
const names=['Curious Otter','Quiet Fox','Clever Finch','Rare Panda','Cosmic Owl','Lucky Moth','Wild Kiwi','Wise Gecko'];
const sessionQuestions=(s:Session):Question[]=>s.questions_json?JSON.parse(s.questions_json):schedule(s.seed,true);
async function state(s:Session,env:Env){const qs=sessionQuestions(s);const {results}=await env.DB.prepare('SELECT round, question, label, tier, points, correct, timed_out FROM answers WHERE session=? ORDER BY round').bind(s.id).all();const done=s.round>=5;return {id:s.id,day:s.day,mode:s.mode,name:s.name,round:s.round,done,awaitingStart:!done&&s.started===0,deadline:s.started===0?null:s.started+30000,serverNow:Date.now(),question:done||s.started===0?null:publicQuestion(qs[s.round]),answers:results,review:done?qs.map(q=>({...publicQuestion(q),answers:q.answers.map(a=>({label:a.label,tier:a.tier}))})):null};}
async function api(req:Request,env:Env){const url=new URL(req.url);const path=url.pathname;const origin=req.headers.get('Origin');if(req.method==='POST'&&origin&&origin!==url.origin)return fail('Request origin not allowed.',403);
let player=req.headers.get('Cookie')?.match(/(?:^|; )rare_player=([a-f0-9-]{36})(?:;|$)/)?.[1];let cookie='';if(!player){player=crypto.randomUUID();cookie=`rare_player=${player}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000${url.protocol==='https:'?'; Secure':''}`;}
const out=(data:unknown)=>json(data,200,cookie?{'Set-Cookie':cookie}:{});
if(path==='/api/puzzle'&&req.method==='GET'){const day=utc();return out({...bankInfo,day,number:Math.floor(Date.parse(day)/86400000)-Math.floor(Date.parse('2026-11-12')/86400000)+1,categories:schedule(day).map(q=>q.category),reset:Date.parse(day)+86400000});}
if(path==='/api/leaderboard'&&req.method==='GET'){let day=url.searchParams.get('day')||utc();if(!/^\d{4}-\d{2}-\d{2}$/.test(day))return fail('Invalid date.');const {results}=await env.DB.prepare(`SELECT s.name, SUM(a.points) score FROM sessions s JOIN answers a ON a.session=s.id WHERE s.mode='daily' AND s.day=? AND s.round=5 GROUP BY s.id ORDER BY score DESC,s.created ASC LIMIT 20`).bind(day).all();return out({day,entries:results});}
if(req.method!=='POST')return fail('Not found.',404);
if(Number(req.headers.get('Content-Length')||0)>2048)return fail('Request too large.',413);
const raw=await req.text();if(raw.length>2048)return fail('Request too large.',413);let b:Record<string,unknown>;try{b=JSON.parse(raw);}catch{return fail('Invalid JSON.');}if(!b||typeof b!=='object'||Array.isArray(b))return fail('Invalid request.');
if(path==='/api/start'){
const mode=b.mode==='practice'?'practice':'daily';const day=typeof b.day==='string'?b.day:utc();if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(Date.parse(day))||new Date(day).toISOString().slice(0,10)!==day||day>utc()||day<'2026-11-12')return fail('Choose an available puzzle date.');
let s=mode==='daily'?await env.DB.prepare("SELECT * FROM sessions WHERE player=? AND day=? AND mode='daily'").bind(player,day).first<Session>():null;
if(!s){const rate=await env.DB.prepare('SELECT COUNT(*) n FROM sessions WHERE player=? AND created>?').bind(player,Date.now()-3600000).first<{n:number}>();if((rate?.n||0)>=30)return fail('You have started 30 games this hour. Come back shortly.',429);const id=crypto.randomUUID();const now=Date.now();await env.DB.prepare('INSERT OR IGNORE INTO sessions(id,player,day,mode,seed,started,created,name,questions_json) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,player,day,mode,mode==='daily'?day:id,0,now,names[crypto.getRandomValues(new Uint32Array(1))[0]%names.length]+' '+id.slice(0,4),JSON.stringify(schedule(mode==='daily'?day:id))).run();s=await env.DB.prepare(mode==='daily'?"SELECT * FROM sessions WHERE player=? AND day=? AND mode='daily'":'SELECT * FROM sessions WHERE id=? AND player=?').bind(...(mode==='daily'?[player,day]:[id,player])).first<Session>();}
return out(await state(s!,env));}
if(path==='/api/answer'||path==='/api/resume'||path==='/api/next'){
if(typeof b.id!=='string'||b.id.length>50)return fail('Invalid game.');const s=await env.DB.prepare('SELECT * FROM sessions WHERE id=? AND player=?').bind(b.id,player).first<Session>();if(!s)return fail('Game not found. Start a new game.',404);
if(path==='/api/resume'||s.round>=5)return out(await state(s,env));
if(path==='/api/next'){if(b.round!==s.round)return out(await state(s,env));await env.DB.prepare('UPDATE sessions SET started=? WHERE id=? AND round=? AND started=0').bind(Date.now(),s.id,s.round).run();const started=await env.DB.prepare('SELECT * FROM sessions WHERE id=?').bind(s.id).first<Session>();return out(await state(started!,env));}
if(!Number.isInteger(b.round)||b.round!==s.round)return out(await state(s,env));if(s.started===0)return fail('Start the next round before answering.',409);if(typeof b.answer!=='string'||b.answer.length>100)return fail('Use an answer under 100 characters.');
const now=Date.now();const timedOut=now>s.started+30000;const q=sessionQuestions(s)[s.round];const result=evaluate(q,timedOut?'':b.answer.trim());
await env.DB.batch([
env.DB.prepare(`INSERT OR IGNORE INTO answers(session,round,question,answer,label,tier,points,correct,timed_out) SELECT id,?,?,?,?,?,?,?,? FROM sessions WHERE id=? AND round=?`).bind(s.round,q.id,timedOut?'':b.answer.trim(),result.label,result.tier,result.points,Number(result.correct),Number(timedOut),s.id,s.round),
env.DB.prepare('UPDATE sessions SET round=round+1, started=? WHERE id=? AND round=? AND EXISTS(SELECT 1 FROM answers WHERE session=? AND round=?)').bind(0,s.id,s.round,s.id,s.round)
]);const next=await env.DB.prepare('SELECT * FROM sessions WHERE id=?').bind(s.id).first<Session>();return out(await state(next!,env));}
return fail('Not found.',404);
}
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    try {
      const path = new URL(req.url).pathname;
      let response: Response;
      if (path === '/indexnow-key.txt') {
        response = new Response(req.method === 'HEAD' ? null : env.INDEXNOW_KEY || null, {
          status: env.INDEXNOW_KEY ? 200 : 404,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=300',
            'X-Robots-Tag': 'noindex',
          },
        });
      } else {
        response = path.startsWith('/api/') ? await api(req, env) : await env.ASSETS.fetch(req);
      }
      const headers = new Headers(response.headers);
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      headers.set('X-Frame-Options', 'DENY');
      headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
      return new Response(response.body, { status: response.status, headers });
    } catch (error) {
      console.error('Request failed', error instanceof Error ? error.message : 'Unknown error');
      return fail('Something went wrong. Please retry.', 500);
    }
  },
};
