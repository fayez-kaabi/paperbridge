import {reserveRequest} from '../../../lib/quota';
import {validateInput,schema,instructions} from '../../../lib/bridge.mjs';
export async function POST(req:Request){
 try{
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return Response.json({error:'Request origin not allowed.'},{status:403});
 if(Number(req.headers.get('content-length')||0)>6000000)return Response.json({error:'File too large.'},{status:413});
 const raw=await req.text();if(raw.length>6000000)return Response.json({error:'File too large.'},{status:413});
 const b=validateInput(JSON.parse(raw));
 const key=process.env.OPENAI_API_KEY;
 if(!key)return Response.json({error:'Live AI is not connected yet. You can explore the labeled sample workflow. The owner needs to configure OPENAI_API_KEY securely.'},{status:503});
 await reserveRequest(req);
 const replyRules=b.task==='reply'?' REPLY RULES: No attachments exist in this app. NEVER write ci-joint, joint, annexé, attached, enclosed, sent, or submitted. Say documents are being prepared, not attached. A requirement is prepared ONLY if checks[requirement.id].status is match; absent checks mean MISSING. Explicitly acknowledge all remaining documents are still being gathered. Document readiness data: '+JSON.stringify((b.case?.requirements||[]).map((r:any)=>({title:r.title,readiness:b.checks?.[r.id]?.status==='match'?'prepared':'missing'}))):'';
 const content:any[]=[{type:'input_text',text:JSON.stringify({...b,file:undefined})}];
 if(b.file)content.push(b.file.data.startsWith('data:application/pdf')?{type:'input_file',filename:'document.pdf',file_data:b.file.data}:{type:'input_image',image_url:b.file.data,detail:'high'});
 const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1',store:false,instructions:instructions+replyRules+' REQUIRED OUTPUT LANGUAGE: '+({en:'English',fr:'French',ar:'Arabic'} as Record<string,string>)[b.language]+'. Write title, summary, requirement titles, details, explanations and warnings ONLY in this language. Keep source quotations verbatim. replyFrench must be French and replyTranslation must be the selected language. Current processing date: '+new Date().toISOString().slice(0,10)+'. Extract applicant name if stated, otherwise empty string.',input:[{role:'user',content}],max_output_tokens:3500,text:{format:{type:'json_schema',name:'paperbridge',strict:true,schema}}}),signal:AbortSignal.timeout(60000)});
 if(!r.ok)return Response.json({error:r.status===429?'OpenAI usage limit reached. Please check credits or retry later.':'The AI service could not complete this request. Please retry.'},{status:502});
 const result:any=await r.json();if(result.status!=='completed')throw Error('The analysis was incomplete. Try a shorter, clearer document.');
 const output=result.output?.flatMap((x:any)=>x.content||[]).find((x:any)=>x.type==='output_text')?.text;if(!output)throw Error('No usable answer was returned. Please retry.');
 const parsed=JSON.parse(output);
 if(b.task==='reply'&&/ci[- ]joint|pièces? jointes?|vous (?:transmets|adresse|envoie)|veuillez trouver|annexé/i.test(parsed.replyFrench||''))throw Error('The draft incorrectly described attachments. Please generate it again; nothing has been sent.');
 return Response.json({result:parsed,usage:result.usage});
 }catch(e:any){return Response.json({error:e.name==='TimeoutError'?'Analysis timed out. Please retry.':e.message||'Could not process this document.'},{status:400});}
}
