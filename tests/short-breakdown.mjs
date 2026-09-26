import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';

const core=fs.readFileSync('breakdown-core.js','utf8');
const c=vm.createContext({});
vm.runInContext(core+'\nglobalThis.api={shortQuestions,shortVisibleQuestions,shortChoices,validateShortAnswers,buildShortBreakdown,shortEmailCopy};',c);
const {shortQuestions:qs,shortVisibleQuestions:visible,shortChoices:choices,validateShortAnswers:validate,buildShortBreakdown:build}=c.api;

const complete=input=>{
  const out={...input};
  let changed=true;
  while(changed){
    changed=false;
    for(const q of visible(out)){
      if(out[q.id]===undefined){
        const list=choices(q,out); out[q.id]=q.multi?[list[0][0]]:list[0][0];
        changed=true;
      }
    }
  }
  return out;
};
const answer=goal=>complete({worktype:['color','extensions','education'],primarywork:'chair-color',goal});

assert.equal(qs[0].id,'worktype');
assert.equal(qs[0].multi,true);
assert.equal(qs[1].id,'primarywork');

let cases=0;
for(const goal of ['clients','return','money','keep','time','stable']){
  const a=answer(goal);
  assert(visible(a).length>=6);
  for(const q of visible(a)){
    const missing={...a};
    delete missing[q.id];
    assert.throws(()=>validate(missing));
    for(const [value] of choices(q,a)){
      if(q.id==='goal') continue;
      const b=complete({...a,[q.id]:q.multi?[value]:value});
      const r=build(b);
      assert.equal(r.plan.steps.length,3);
      assert(!JSON.stringify(r).includes('undefined'));
      assert.equal(r.opportunity,null);
      cases++;
    }
  }
  assert.equal(build(a).schema,'short-v4');assert(build(a).snapshot);
}

assert(!('savings' in validate({...answer('clients'),savings:'solid'})));
assert.throws(()=>validate({...answer('clients'),days:'999'}));
assert.match(build({...answer('money'),paymodel:'hourly',hourlytime:'sometimes'}).plan.steps[0].body,/payslip/);
assert(!('servicehours' in validate({...answer('money'),paymodel:'hourly',hourlytime:'sometimes'})));
assert(!('workcosts' in validate({...answer('money'),paymodel:'hourly',hourlytime:'sometimes'})));
assert(!('spend' in validate({...answer('money'),paymodel:'hourly',hourlytime:'sometimes'})));
assert(!('costs' in validate({...answer('money'),paymodel:'hourly',hourlytime:'sometimes'})));
assert.equal(build({...answer('clients'),days:'4',full:'full'}).stage,'BOOKED AF');

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

const sessionMoney=complete({
  worktype:['session','extensions'],
  primarywork:'session',
  goal:'money',
  workload:'busy',
  workdays:'5',
  paystyle:['day','half'],
  paywait:'90',
  workexpenses:['products','hair','travel','team','fees'],
  sessionagency:'yes',
  sessionfront:'often'
});
const sessionResult=build(sessionMoney);
assert.equal(sessionResult.stage,'IN DEMAND');
assert.match(sessionResult.top.title,/PAY BETTER/);
assert.match(sessionResult.intro,/agency takes a cut/i);
assert.match(sessionResult.intro,/cash-flow/i);
assert.match(sessionResult.plan.steps[1].body,/reimbursed money|fronted/i);

const sessionClients=complete({
  worktype:['session'],
  primarywork:'session',
  goal:'clients',
  workload:'half',
  workdays:'4',
  jobsource:['agency','repeat'],
  outreach:['agency','past']
});
assert.match(build(sessionClients).top.title,/WORK COMING IN/);

const primaryChoices=choices(qs.find(q=>q.id==='primarywork'),{worktype:['color','extensions','education']});
assert.deepEqual(primaryChoices.map(x=>x[0]),['chair-color','chair-extensions','education','mix','notearning']);
assert.match(primaryChoices[0][1],/Color clients/);
const moveChoices=choices(qs.find(q=>q.id==='network'),{...answer('clients'),visibility:['referrals'],marketing:['social','paid'],full:'under25',returning:'notyet'});
assert(moveChoices.some(x=>x[0]==='past'));
assert(moveChoices.some(x=>x[0]==='local'));
assert(moveChoices.some(x=>x[0]==='none'));
assert.match(build(answer('clients')).snapshot,/color clients/i);

const workerSource=fs.readFileSync('email-worker.mjs','utf8');
assert(workerSource.includes(core));

const calls=[];
const wc=vm.createContext({
  Response,Request,URL,TextEncoder,TextDecoder,AbortSignal,crypto:webcrypto,console,
  fetch:async(url,opts)=>{
    calls.push({url,opts});
    return Response.json(url.includes('turnstile')?{success:true,hostname:'bookedandfabulous.com',action:'booked_email'}:{id:'mock-email'});
  }
});
vm.runInContext(workerSource.replace('export default','globalThis.worker ='),wc);
const env={RESEND_API_KEY:'mock',TURNSTILE_SECRET_KEY:'mock',FOLLOWUPS:{async put(){},async list(){return {keys:[],list_complete:true}},async delete(){}}};
const request=data=>new Request('https://example.test',{
  method:'POST',
  headers:{Origin:'https://bookedandfabulous.com','Content-Type':'application/json'},
  body:JSON.stringify({name:'Bradley',email:'test@example.com',type:'breakdown',token:'mock',...data})
});

for(const goal of ['clients','money','return','keep','time','stable']){
  const a=answer(goal);
  const response=await wc.worker.fetch(request({schema:'short-v4',answers:a}),env);
  assert.equal(response.status,200);
  const sent=calls.filter(call=>call.url==='https://api.resend.com/emails')
    .map(call=>JSON.parse(call.opts.body))
    .filter(email=>email.subject==='Your BOOKED AF Breakdown').at(-1);
  assert(sent);
  assert.equal(sent.text,c.api.shortEmailCopy(build(a),'Bradley'));
  assert(sent.html.includes('assets/booked-af-logo.png'));
}
const sessionResponse=await wc.worker.fetch(request({schema:'short-v4',answers:sessionMoney}),env);
assert.equal(sessionResponse.status,200);

assert.equal((await wc.worker.fetch(request({schema:'bogus',answers:answer('clients')}),env)).status,400);
assert.equal((await wc.worker.fetch(request({schema:'short-v2',answers:answer('clients')}),env)).status,400);
assert.equal((await wc.worker.fetch(request({schema:'short-v4',answers:{goal:'time'}}),env)).status,400);

const legacy=vm.runInContext('Object.fromEntries(questions.filter(q=>!q.when).map(q=>[q.id,q.choices[0][0]]))',wc);
vm.runInContext('globalThis.legacyQuestions=questions',wc);
for(const q of wc.legacyQuestions)if(q.when&&q.when(legacy))legacy[q.id]=q.choices[0][0];
assert.equal((await wc.worker.fetch(request({answers:legacy}),env)).status,200);

// Exercise frontend navigation for all six chair-based goal paths.
for(const goal of ['clients','return','money','keep','time','stable']){
  const els=new Map();
  const element=id=>{
    if(!els.has(id))els.set(id,{style:{},classList:{remove(){},add(){}},querySelectorAll(){return[]},innerHTML:''});
    return els.get(id);
  };
  const storage={getItem(){return null},setItem(){},removeItem(){}};
  const ac=vm.createContext({
    console,URLSearchParams,AbortSignal,
    fetch:async()=>Response.json({ready:true,schemas:['short-v4']}),
    document:{getElementById:element},
    localStorage:storage,sessionStorage:storage,
    location:{search:'',pathname:'/',hash:''},history:{},navigator:{},setTimeout,clearTimeout
  });
  vm.runInContext(core+'\n'+fs.readFileSync('app.js','utf8'),ac);
  await element('start').onclick();
  const navAnswers=answer(goal);
  vm.runInContext('state.answers='+JSON.stringify(navAnswers)+';render()',ac);
  const count=visible(navAnswers).length;
  for(let i=1;i<count;i++)element('next').onclick();
  assert(element('app').innerHTML.includes('SEE MY BREAKDOWN'));
  element('back').onclick();
  assert(element('app').innerHTML.includes('Question '+(count-1)+' of '+count));
  element('next').onclick();
  vm.runInContext('state.emailSent=true;state.view="result";render()',ac);
  assert(element('app').innerHTML.includes('DO THESE 3 THINGS'));
  element('edit').onclick();
  assert(element('app').innerHTML.includes('Question 1 of '+count));
}

console.log(`Passed ${cases} answer variations, chair and session paths, Worker requests, email parity and navigation checks. No live emails sent.`);
