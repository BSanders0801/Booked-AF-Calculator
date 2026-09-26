import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
const core=fs.readFileSync('breakdown-core.js','utf8');
const c=vm.createContext({});vm.runInContext(core+'\nglobalThis.api={shortQuestions,shortVisibleQuestions,validateShortAnswers,buildShortBreakdown,shortEmailCopy};',c);
const {shortQuestions:qs,shortVisibleQuestions:visible,validateShortAnswers:validate,buildShortBreakdown:build}=c.api;
const answer=goal=>Object.fromEntries(visible({goal}).map(q=>[q.id,q.id==='goal'?goal:q.choices[0][0]]));
const complete=input=>{const out={...input};let changed=true;while(changed){changed=false;for(const q of visible(out)){if(out[q.id]===undefined){out[q.id]=q.choices[0][0];changed=true;}}}return out;};
let cases=0;
for(const [goal,count] of Object.entries({clients:8,return:6,money:8,keep:6,time:6,stable:6})){
 const a=answer(goal);assert.equal(visible(a).length,count);
 for(const q of visible(a)){
  const missing={...a};delete missing[q.id];assert.throws(()=>validate(missing));
  for(const [value] of q.choices){const b=complete({...a,[q.id]:value});if(q.id==='goal')continue;const r=build(b);assert.equal(r.plan.steps.length,3);assert(!JSON.stringify(r).includes('undefined'));assert.equal(r.opportunity,null);cases++;}
 }
 assert.equal(build(a).schema,'short-v2');
}
assert(!('savings' in validate({...answer('clients'),savings:'solid'})));
assert.throws(()=>validate({...answer('clients'),days:'999'}));
assert.match(build({...answer('money'),paymodel:'hourly',hourlytime:'sometimes'}).plan.steps[0].body,/payslip/);
assert.equal(visible({...answer('money'),paymodel:'hourly',hourlytime:'sometimes'}).length,5);
assert(!('servicehours' in validate({...answer('money'),paymodel:'hourly',hourlytime:'sometimes'})));
assert(!('workcosts' in validate({...answer('money'),paymodel:'hourly',hourlytime:'sometimes'})));
assert(!('spend' in validate({...answer('money'),paymodel:'hourly',hourlytime:'sometimes'})));
assert(!('costs' in validate({...answer('money'),paymodel:'hourly',hourlytime:'sometimes'})));
assert.equal(build({...answer('clients'),days:'4',full:'full',spend:'150'}).stage,'BOOKED AF');
const multiClients={...answer('clients'),visibility:['social','referrals'],marketing:['social','local']};
assert.deepEqual(Array.from(validate(multiClients).visibility),['social','referrals']);
assert.match(build(multiClients).plan.steps[1].body,/posting your work online/);
assert.match(build(multiClients).plan.steps[1].body,/introducing yourself locally/);
assert.throws(()=>validate({...answer('clients'),marketing:['none','social']}));
const multiReturn={...answer('return'),followup:['personal','automatic']};
assert.match(build(multiReturn).plan.steps[1].title,/WORK TOGETHER/);
const multiMoney={...answer('money'),workcosts:['product','space','fees']};
assert.match(build(multiMoney).plan.steps[1].body,/supplies/);
assert.match(build(multiMoney).plan.steps[1].body,/rent/);
assert.match(build(multiMoney).plan.steps[1].body,/software/);
const workerSource=fs.readFileSync('email-worker.mjs','utf8');assert(workerSource.includes(core));
const calls=[];
const wc=vm.createContext({Response,Request,URL,TextEncoder,TextDecoder,AbortSignal,crypto:webcrypto,console,fetch:async(url,opts)=>{calls.push({url,opts});return Response.json(url.includes('turnstile')?{success:true,hostname:'bookedandfabulous.com',action:'booked_email'}:{id:'mock-email'});}});
vm.runInContext(workerSource.replace('export default','globalThis.worker ='),wc);
const env={RESEND_API_KEY:'mock',TURNSTILE_SECRET_KEY:'mock'};
const request=data=>new Request('https://example.test',{method:'POST',headers:{Origin:'https://bookedandfabulous.com','Content-Type':'application/json'},body:JSON.stringify({name:'Bradley',email:'test@example.com',type:'breakdown',token:'mock',...data})});
for(const goal of ['clients','money','return','keep','time','stable']){
 const a=answer(goal);const response=await wc.worker.fetch(request({schema:'short-v2',answers:a}),env);assert.equal(response.status,200);const sent=calls.filter(call=>call.url==='https://api.resend.com/emails').map(call=>JSON.parse(call.opts.body)).filter(email=>email.subject==='Your BOOKED AF Breakdown').at(-1);assert(sent);assert.equal(sent.text,c.api.shortEmailCopy(build(a),'Bradley'));assert(sent.html.includes('assets/booked-af-logo.png'));
}
assert.equal((await wc.worker.fetch(request({schema:'bogus',answers:answer('clients')}),env)).status,400);
assert.equal((await wc.worker.fetch(request({schema:'short-v2',answers:{goal:'time'}}),env)).status,400);
const legacy=vm.runInContext('Object.fromEntries(questions.filter(q=>!q.when).map(q=>[q.id,q.choices[0][0]]))',wc);
vm.runInContext('globalThis.legacyQuestions=questions',wc);
for(const q of wc.legacyQuestions)if(q.when&&q.when(legacy))legacy[q.id]=q.choices[0][0];
assert.equal((await wc.worker.fetch(request({answers:legacy}),env)).status,200);
// Exercise frontend navigation for all goal paths, including backwards across hidden branches.
for(const goal of ['clients','return','money','keep','time','stable']){
 const els=new Map();const element=id=>{if(!els.has(id))els.set(id,{style:{},classList:{remove(){},add(){}},querySelectorAll(){return[]},innerHTML:''});return els.get(id)};
 const storage={getItem(){return null},setItem(){},removeItem(){}};
 const ac=vm.createContext({console,URLSearchParams,AbortSignal,fetch:async()=>Response.json({ready:true,schemas:['short-v2']}),document:{getElementById:element},localStorage:storage,sessionStorage:storage,location:{search:'',pathname:'/',hash:''},history:{},navigator:{},setTimeout,clearTimeout});
 vm.runInContext(core+'\n'+fs.readFileSync('app.js','utf8'),ac);
 await element('start').onclick();
 vm.runInContext('state.answers='+JSON.stringify(answer(goal))+';render()',ac);
 const count=visible(answer(goal)).length;
 for(let i=1;i<count;i++)element('next').onclick();
 assert(element('app').innerHTML.includes('SEE MY BREAKDOWN'));
 element('back').onclick();assert(element('app').innerHTML.includes('Question '+(count-1)+' of '+count));
 element('next').onclick();element('next').onclick();element('skip').onclick();
 assert(element('app').innerHTML.includes('DO THESE 3 THINGS'));
 element('edit').onclick();assert(element('app').innerHTML.includes('Question 1 of '+count));
}
console.log(`Passed ${cases} answer variations, all six navigation paths, short and legacy Worker requests, email parity and logo checks. No live emails sent.`);
