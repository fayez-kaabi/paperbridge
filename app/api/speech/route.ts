import {reserveRequest} from '../../../lib/quota';
export async function POST(req:Request){
 if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid origin'},{status:403});
 if(!process.env.OPENAI_API_KEY)return Response.json({error:'Connect OpenAI to enable AI audio.'},{status:503});
 try{const b:any=await req.json();if(typeof b.text!=='string'||b.text.length>2000)return Response.json({error:'Audio text is too long.'},{status:400});
 await reserveRequest(req);
 const r=await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-4o-mini-tts',voice:'coral',input:b.text,response_format:'mp3'}),signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error('Audio unavailable. Try again later.');return new Response(r.body,{headers:{'Content-Type':'audio/mpeg','Cache-Control':'no-store'}});
 }catch(e:any){return Response.json({error:e.message},{status:502});}
}
