import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
const core=fs.readFileSync('breakdown-core.js','utf8');
const c=vm.createContext({});vm.runInContext(core+'\nglobalThis.api={shortQuestions,shortVisibleQuestions,validateShortAnswers,buildShortBreakdown,shortEmailCopy};',c);
const {shortQuestions:qs,shortVisibleQuestions:visible,validateShortAnswers:validate,buildShortBreakdown:build}=c.api;
const answer=goal=>Object.fromEntries(visible({goal}).map(q=>[q.id,q.id==='goal'?goal:q.choices[0][0]]));
let cases=0;
for(const [goal,count] of Object.entries({clients:10,return:8,money:9,keep:8,time:9,stable:9})){
 const a=answer(goal);assert.equal(visible(a).length,count);
 for(const q of visible(a)){
  const missing={...a};delete missing[q.id];assert.throws(()=>validate(missing));
  for(const [value] of q.choices){const b={...a,[q.id]:value};if(q.id==='goal')continue;const r=build(b);assert.equal(r.plan.steps.length,3);assert(!JSON.stringify(r).includes('undefined'));assert.equal(r.opportunity,null);cases++;}
 }
 assert.equal(build(a).schema,'short-v1');
}
assert(!('savings' in validate({...answer('clients'),savings:'solid'})));
assert.throws(()=>validate({...answer('clients'),days:'999'}));
assert.match(build({...answer('money'),paymodel:'hourly'}).plan.steps[0].body,/payslip/);
assert.equal(build({...answer('clients'),days:'4',full:'full',spend:'150'}).stage,'BOOKED AF');
const workerSource=fs.readFileSync('email-worker.mjs','utf8');assert(workerSource.includes(core));
const calls=[];
const wc=vm.createContext({Response,Request,URL,TextEncoder,TextDecoder,AbortSignal,crypto:webcrypto,console,fetch:async(url,opts)=>{calls.push({url,opts});return Response.json(url.includes('turnstile')?{success:true,hostname:'bookedandfabulous.com',action:'booked_email'}:{id:'mock-email'});}});
vm.runInContext(workerSource.replace('export default','globalThis.worker ='),wc);
const env={RESEND_API_KEY:'mock',TURNSTILE_SECRET_KEY:'mock'};
const request=data=>new Request('https://example.test',{method:'POST',headers:{Origin:'https://bookedandfabulous.com','Content-Type':'application/json'},body:JSON.stringify({name:'Bradley',email:'test@example.com',type:'breakdown',token:'mock',...data})});
for(const goal of ['clients','money','return','keep','time','stable']){
 const a=answer(goal);const response=await wc.worker.fetch(request({schema:'short-v1',answers:a}),env);assert.equal(response.status,200);const sent=JSON.parse(calls.at(-1).opts.body);assert.equal(sent.text,c.api.shortEmailCopy(build(a),'Bradley'));assert(sent.html.includes('assets/booked-af-logo.png'));
}
assert.equal((await wc.worker.fetch(request({schema:'bogus',answers:answer('clients')}),env)).status,400);
assert.equal((await wc.worker.fetch(request({schema:'short-v1',answers:{goal:'time'}}),env)).status,400);
const legacy=vm.runInContext('Object.fromEntries(questions.filter(q=>!q.when).map(q=>[q.id,q.choices[0][0]]))',wc);
vm.runInContext('globalThis.legacyQuestions=questions',wc);
for(const q of wc.legacyQuestions)if(q.when&&q.when(legacy))legacy[q.id]=q.choices[0][0];
assert.equal((await wc.worker.fetch(request({answers:legacy}),env)).status,200);
// Exercise frontend navigation for all goal paths, including backwards across hidden branches.
for(const goal of ['clients','return','money','keep','time','stable']){
 const els=new Map();const element=id=>{if(!els.has(id))els.set(id,{style:{},classList:{remove(){},add(){}},querySelectorAll(){return[]},innerHTML:''});return els.get(id)};
 const storage={getItem(){return null},setItem(){},removeItem(){}};
 const ac=vm.createContext({console,URLSearchParams,AbortSignal,fetch:async()=>Response.json({ready:true,schemas:['short-v1']}),document:{getElementById:element},localStorage:storage,sessionStorage:storage,location:{search:'',pathname:'/',hash:''},history:{},navigator:{},setTimeout,clearTimeout});
 vm.runInContext(core+'\n'+fs.readFileSync('app.js','utf8'),ac);
 await element('start').onclick();
 vm.runInContext('state.answers='+JSON.stringify(answer(goal))+';render()',ac);
 const count=visible(answer(goal)).length;
 for(let i=1;i<count;i++)element('next').onclick();
 assert(element('app').innerHTML.includes('SEE MY BREAKDOWN'));
 element('back').onclick();assert(element('app').innerHTML.includes('Question '+(count-1)+' of '+count));
 element('next').onclick();element('next').onclick();element('skip').onclick();
 assert(element('app').innerHTML.includes('YOUR THREE MOVES THIS WEEK'));
 element('edit').onclick();assert(element('app').innerHTML.includes('Question 1 of '+count));
}
console.log(`Passed ${cases} answer variations, all six navigation paths, short and legacy Worker requests, email parity and logo checks. No live emails sent.`);
