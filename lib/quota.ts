import {env} from 'cloudflare:workers';
export async function reserveRequest(req:Request){
 if(!env.DB)throw Error('Usage protection is not configured. Please try again later.');
 const now=Date.now(),day=new Date(now).toISOString().slice(0,10),hour=Math.floor(now/3600000);
 const ip=req.headers.get('cf-connecting-ip')||'unknown';
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(day+':'+ip)))).map(x=>x.toString(16).padStart(2,'0')).join('');
 const scopes=[{scope:'global:'+day,max:100},{scope:'visitor:'+hour+':'+hash,max:12}];
 const results=await env.DB.batch(scopes.map(x=>env.DB!.prepare('INSERT INTO request_quota(scope,count,expires) VALUES(?,1,?) ON CONFLICT(scope) DO UPDATE SET count=count+1 WHERE count < ? RETURNING count').bind(x.scope,now+172800000,x.max)));
 if(results.some(r=>!r.results.length))throw Error('Demo usage limit reached. Please try again later or explore the sample workflow.');
 await env.DB.prepare('DELETE FROM request_quota WHERE expires < ?').bind(now).run();
}
