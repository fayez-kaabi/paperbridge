import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import ts from 'typescript';
const source=fs.readFileSync(new URL('../app/api/bridge/route.ts',import.meta.url),'utf8').replace("import {reserveRequest} from '../../../lib/quota';", 'async function reserveRequest() {}').replace('../../../lib/bridge.mjs',new URL('../lib/bridge.mjs',import.meta.url).href);
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {POST}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const request=(b,origin='http://test.local')=>new Request('http://test.local/api/bridge',{method:'POST',headers:{'Content-Type':'application/json',origin},body:JSON.stringify(b)});
const valid={task:'analyze',language:'en',text:'Please provide proof of address.'};
test('route behavior with mocked provider; no live API calls',async t=>{const originalFetch=globalThis.fetch,originalKey=process.env.OPENAI_API_KEY;try{
 delete process.env.OPENAI_API_KEY;
 await t.test('missing key returns explicit 503',async()=>assert.equal((await POST(request(valid))).status,503));
 await t.test('cross-origin request rejected',async()=>assert.equal((await POST(request(valid,'https://other.test'))).status,403));
 await t.test('empty input rejected before provider call',async()=>assert.equal((await POST(request({...valid,text:''}))).status,400));
 process.env.OPENAI_API_KEY='unit-test-placeholder';
 globalThis.fetch=async(_url,init)=>{const sent=JSON.parse(init.body);assert.equal(sent.store,false);assert.equal(sent.text.format.strict,true);return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({title:'Test result'})}]}]})};
 await t.test('successful provider output is returned',async()=>assert.equal((await (await POST(request(valid))).json()).result.title,'Test result'));
 globalThis.fetch=async()=>new Response('',{status:429});await t.test('provider rate limit handled',async()=>assert.equal((await POST(request(valid))).status,502));
 globalThis.fetch=async()=>Response.json({status:'incomplete'});await t.test('incomplete output rejected',async()=>assert.equal((await POST(request(valid))).status,400));
 globalThis.fetch=async()=>Response.json({status:'completed',output:[]});await t.test('empty output rejected',async()=>assert.equal((await POST(request(valid))).status,400));
 }finally{globalThis.fetch=originalFetch;if(originalKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=originalKey;}});
