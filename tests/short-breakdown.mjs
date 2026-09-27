import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';

const core=fs.readFileSync('breakdown-core.js','utf8');
const c=vm.createContext({});
vm.runInContext(core+'\nglobalThis.api={SHORT_SCHEMA,shortQuestions,shortVisibleQuestions,shortChoices,shortFocusGoal,shortLane,validateShortAnswers,buildShortBreakdown,shortEmailCopy};',c);
const {SHORT_SCHEMA,shortQuestions:qs,shortVisibleQuestions:visible,shortChoices:choices,shortFocusGoal:focus,shortLane:lane,validateShortAnswers:validate,buildShortBreakdown:build}=c.api;

const byId=id=>qs.find(q=>q.id===id);
const complete=input=>{
  const out={...input};
  let changed=true, guard=0;
  while(changed && guard++<100){
    changed=false;
    for(const q of visible(out)){
      const list=Array.from(choices(q,out));
      const allowed=new Set(list.map(x=>x[0]));
      if(q.multi){
        const raw=Array.isArray(out[q.id])?out[q.id]:(out[q.id]===undefined?[]:[out[q.id]]);
        const filtered=[...new Set(raw.filter(v=>allowed.has(v)))];
        if(filtered.length){
          if(JSON.stringify(filtered)!==JSON.stringify(out[q.id])){out[q.id]=filtered;changed=true;}
        } else if(out[q.id]!==undefined){delete out[q.id];changed=true;}
      } else if(out[q.id]!==undefined&&!allowed.has(out[q.id])){
        delete out[q.id];changed=true;
      }
      if(out[q.id]===undefined){
        out[q.id]=q.multi?[list[0][0]]:list[0][0];
        changed=true;
      }
    }
    for(const q of qs){
      if(q.when && !q.when(out) && out[q.id]!==undefined){delete out[q.id];changed=true;}
    }
  }
  return out;
};

const chairAnswer=goal=>complete({
  worktype:['color','extensions','education'],
  primarywork:'chair-color',
  goal:[goal]
});

assert.equal(SHORT_SCHEMA,'short-v5');
assert.equal(qs[0].id,'worktype');
assert.equal(qs[0].multi,true);
assert.equal(qs[1].id,'leadershiprole');
assert.equal(qs[2].id,'primarywork');
assert.equal(byId('goal').multi,true);
assert.equal(byId('goalpriority').id,'goalpriority');

// Primary-income choices are derived from the lanes selected on screen one.
const primaryChoices=Array.from(choices(byId('primarywork'),{worktype:['color','extensions','education']}),x=>x[0]);
assert.deepEqual(primaryChoices,['chair-color','chair-extensions','education','mix','notearning']);

// One selected lane should not waste a question asking the user to repeat it.
const singleColorSeed={worktype:['color']};
const singleColorVisible=Array.from(visible(singleColorSeed),q=>q.id);
assert(!singleColorVisible.includes('primarywork'));
assert.equal(singleColorVisible[1],'full');
assert.equal(lane(singleColorSeed),'chair');
const singleColor=complete({worktype:['color'],goal:['clients']});
assert(!('primarywork' in validate(singleColor)));
assert.match(build(singleColor).snapshot,/color clients/i);


// Owner and manager are intentionally different paths.
const owner=complete({worktype:['owner'],leadershiprole:'owner',goal:['money']});
const manager=complete({worktype:['owner'],leadershiprole:'manager',goal:['money']});
assert.equal(lane(owner),'owner');
assert.equal(lane(manager),'manager');
assert(!('primarywork' in owner));
assert(!('primarywork' in manager));
assert.match(Array.from(choices(byId('goal'),owner),x=>x[1]).join(' '),/business to make more/i);
assert.match(Array.from(choices(byId('goal'),manager),x=>x[1]).join(' '),/role to pay better/i);
assert.equal(build(owner).plan.steps.length,3);
assert.equal(build(manager).plan.steps.length,3);

// Multi-select concerns require one explicit priority before the tailored branch continues.
const multiGoal=complete({
  worktype:['color','extensions'],
  primarywork:'chair-color',
  goal:['clients','money','time'],
  goalpriority:'money'
});
assert.deepEqual(Array.from(validate(multiGoal).goal),['clients','money','time']);
assert.equal(focus(multiGoal),'money');
assert.equal(build(multiGoal).plan.steps.length,3);
assert.equal(build(multiGoal).schema,'short-v5');

// Exercise every single-priority chair path and every visible answer variation.
let cases=0;
for(const goal of ['clients','return','money','keep','time','stable']){
  const a=chairAnswer(goal);
  assert(visible(a).length>=6);
  const r=build(a);
  assert.equal(r.schema,'short-v5');
  assert(r.snapshot);
  assert.equal(r.plan.steps.length,3);
  for(const q of visible(a)){
    const missing={...a}; delete missing[q.id];
    assert.throws(()=>validate(missing));
    if(['worktype','primarywork','goal'].includes(q.id)) continue;
    for(const [value] of choices(q,a)){
      const b=complete({...a,[q.id]:q.multi?[value]:value});
      const result=build(b);
      assert.equal(result.plan.steps.length,3);
      assert(!JSON.stringify(result).includes('undefined'));
      assert.equal(result.opportunity,null);
      cases++;
    }
  }
}

assert(!('savings' in validate({...chairAnswer('clients'),savings:'solid'})));
assert.throws(()=>validate({...chairAnswer('clients'),days:'999'}));
assert.match(build({...chairAnswer('money'),paymodel:'hourly',hourlytime:'sometimes'}).plan.steps[0].body,/payslip/);
assert(!('servicehours' in validate({...chairAnswer('money'),paymodel:'hourly',hourlytime:'sometimes'})));
assert(!('workcosts' in validate({...chairAnswer('money'),paymodel:'hourly',hourlytime:'sometimes'})));
assert(!('spend' in validate({...chairAnswer('money'),paymodel:'hourly',hourlytime:'sometimes'})));
assert(!('costs' in validate({...chairAnswer('money'),paymodel:'hourly',hourlytime:'sometimes'})));
assert.equal(build({...chairAnswer('clients'),days:'4',full:'full'}).stage,'BOOKED AF');

const multiClients={...chairAnswer('clients'),visibility:['social','referrals'],marketing:['social','local']};
assert.deepEqual(Array.from(validate(multiClients).visibility),['social','referrals']);
assert.match(build(multiClients).plan.steps[1].body,/posting your work online/);
assert.match(build(multiClients).plan.steps[1].body,/introducing yourself locally/);
assert.throws(()=>validate({...chairAnswer('clients'),marketing:['none','social']}));

const multiReturn={...chairAnswer('return'),followup:['personal','automatic']};
assert.match(build(multiReturn).plan.steps[1].title,/WORK TOGETHER/);

const multiMoney={...chairAnswer('money'),workcosts:['product','space','fees']};
assert.match(build(multiMoney).plan.steps[1].body,/supplies/);
assert.match(build(multiMoney).plan.steps[1].body,/rent/);
assert.match(build(multiMoney).plan.steps[1].body,/software/);

const sessionMoney=complete({
  worktype:['session','extensions'],
  primarywork:'session',
  goal:['money'],
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
  goal:['clients'],
  workload:'half',
  workdays:'4',
  jobsource:['agency','repeat'],
  outreach:['agency','past']
});
assert.match(build(sessionClients).top.title,/WORK COMING IN/);

const moveChoices=Array.from(choices(byId('network'),{...chairAnswer('clients'),visibility:['referrals'],marketing:['social','paid'],full:'under25',returning:'notyet'}));
assert(moveChoices.some(x=>x[0]==='past'));
assert(moveChoices.some(x=>x[0]==='local'));
assert(moveChoices.some(x=>x[0]==='none'));
assert.match(build(chairAnswer('clients')).snapshot,/color clients/i);

// Worker source must contain the exact shared core.
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
  const a=chairAnswer(goal);
  const response=await wc.worker.fetch(request({schema:'short-v5',answers:a}),env);
  assert.equal(response.status,200);
  const sent=calls.filter(call=>call.url==='https://api.resend.com/emails')
    .map(call=>JSON.parse(call.opts.body))
    .filter(email=>email.subject==='Your BOOKED AF Breakdown').at(-1);
  assert(sent);
  assert.equal(sent.text,c.api.shortEmailCopy(build(a),'Bradley'));
  assert(sent.html.includes('assets/booked-af-logo.png'));
}
assert.equal((await wc.worker.fetch(request({schema:'short-v5',answers:sessionMoney}),env)).status,200);
assert.equal((await wc.worker.fetch(request({schema:'short-v5',answers:multiGoal}),env)).status,200);
assert.equal((await wc.worker.fetch(request({schema:'bogus',answers:chairAnswer('clients')}),env)).status,400);
assert.equal((await wc.worker.fetch(request({schema:'short-v4',answers:chairAnswer('clients')}),env)).status,400);
assert.equal((await wc.worker.fetch(request({schema:'short-v5',answers:{goal:['time']}}),env)).status,400);

// Legacy still works.
const legacy=vm.runInContext('Object.fromEntries(questions.filter(q=>!q.when).map(q=>[q.id,q.choices[0][0]]))',wc);
vm.runInContext('globalThis.legacyQuestions=questions',wc);
for(const q of wc.legacyQuestions)if(q.when&&q.when(legacy))legacy[q.id]=q.choices[0][0];
assert.equal((await wc.worker.fetch(request({answers:legacy}),env)).status,200);

// Frontend navigation for every chair priority.
for(const goal of ['clients','return','money','keep','time','stable']){
  const els=new Map();
  const element=id=>{
    if(!els.has(id))els.set(id,{style:{},classList:{remove(){},add(){}},querySelectorAll(){return[]},innerHTML:''});
    return els.get(id);
  };
  const storage={getItem(){return null},setItem(){},removeItem(){}};
  const ac=vm.createContext({
    console,URLSearchParams,AbortSignal,
    fetch:async()=>Response.json({ready:true,schemas:['short-v5']}),
    document:{getElementById:element},
    localStorage:storage,sessionStorage:storage,
    location:{search:'',pathname:'/',hash:''},history:{},navigator:{},setTimeout,clearTimeout
  });
  vm.runInContext(core+'\n'+fs.readFileSync('app.js','utf8'),ac);
  await element('start').onclick();
  const navAnswers=chairAnswer(goal);
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

console.log(`Passed ${cases} adaptive answer variations, owner/manager, multi-goal priority, chair/session paths, Worker requests, email parity and navigation checks. No live emails sent.`);
