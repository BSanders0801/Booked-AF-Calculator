const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({});vm.runInContext(fs.readFileSync('next30-core.js','utf8'),c);const api=c.BookedNext30;
const fill=input=>{let a=api.cleanAnswers(input);for(let n=0;n<8;n++){for(const q of api.questions(a))if(a[q.id]===undefined)a[q.id]=q.multi?[q.choices[0][0]]:q.choices[0][0];a=api.cleanAnswers(a)}assert(api.complete(a));return a};
let variants=0;
const roles=Object.keys(api.roles),goals=api.goals.map(x=>x[0]);
assert.equal(roles.length,10);
for(const role of roles)for(const goal of goals){
 const answers=fill({careers:[role],goal,load:'busy',available:'hour'}),plan=api.build(answers);
 assert.equal(plan.role,role);assert.equal(plan.missions.length,4);assert(plan.scripts.length>=3);assert(plan.checklist.length>=6);
 assert.equal(plan.supporting.length,7);assert(plan.metrics.length>=3);assert(plan.tool.title);
 assert(!JSON.stringify(plan).includes('undefined'));assert(!JSON.stringify(plan).includes('[object Object]'));
 assert(api.questions(answers).length>=11&&api.questions(answers).length<=14);
 for(const q of api.questions(answers)){
  assert(q.purpose);assert(new Set(q.choices.map(x=>x[0])).size===q.choices.length);
  const missing={...answers};delete missing[q.id];assert(!api.complete(missing));
  if(['careers','primary','goal'].includes(q.id))continue;
  for(const [v] of q.choices){const a=fill({...answers,[q.id]:q.multi?[v]:v});const p=api.build(a);assert(!JSON.stringify(p).includes('undefined'));assert(p.missions.every(w=>w.tasks.every(Boolean)));variants++}
 }
 const tiny=api.build(fill({...answers,available:'tiny'}));assert(tiny.missions.every(w=>w.tasks.length===1));
 assert.equal(tiny.missions[1].tasks[0],tiny.doNow,'Small plans must include the actual change in week two');
 assert.notEqual(plan.missions[0].tasks[1],plan.missions[1].tasks[0],'Baseline and action weeks must not repeat the same task');
 if(goal==='stable')assert.match(tiny.missions[2].tasks[0],/payday or bill/);
 if(goal==='keep')assert.match(tiny.missions[2].tasks[0],/same costs/);
 const restricted=api.build(fill({...answers,[role+'_control']:'salon'}));
 if(['color','cut'].includes(role))assert(restricted.constraints.some(x=>x.includes('agreement')));
}
// Mixed careers preserve a clear focus and give a useful path for the other roles.
const mixed=fill({careers:['color','session','bridal'],primary:'session',goal:'clients',load:'busy',available:'hour'});
assert.equal(api.primary(mixed),'session');assert.equal(api.build(mixed).secondary.length,2);
const switched=fill({...mixed,primary:'bridal'});assert(!Object.keys(switched).some(x=>x.startsWith('session_')));assert.equal(api.build(switched).role,'bridal');
assert.deepEqual(Array.from(api.cleanAnswers({careers:['other'],other_sources:['referrals','unknown']}).other_sources),['unknown']);
const bridal=fill({careers:['bridal'],goal:'clients',bridal_inquiry:['vendors','search']});assert(api.build(bridal).supporting.find(x=>x.id==='bridal_inquiry').action.includes('vendors'));assert(api.build(bridal).supporting.find(x=>x.id==='bridal_inquiry').action.includes('service area'));
const manager=api.build(fill({careers:['manager'],goal:'money'}));assert(!manager.tool.share);assert.match(manager.tool.earnedLabel,/Actual pay/);assert.doesNotMatch(manager.doNow,/salon.*sales.*your.*income/i);
const hourly=api.build(fill({careers:['color'],goal:'money',color_pay:'hourly'}));assert(!hourly.tool.share);assert.match(hourly.tool.earnedLabel,/Actual pay/);
assert(hourly.scripts.some(x=>x[0]==='PAY CONVERSATION'));assert.match(hourly.missions[2].tasks[0],/PAY CONVERSATION/);
assert.deepEqual(Object.keys(api.cleanAnswers(null)),[]);
assert.equal(api.valueMath({additionalKept:-10,extraCosts:5,price:49}).afterPurchase,-64);
const owner=api.build(fill({careers:['owner'],goal:'keep'}));assert.match(owner.tool.warning,/not automatically.*take-home/);
assert.equal(api.seed({worktype:['owner'],leadershiprole:'manager'}).careers[0],'manager');
assert.equal(api.seed({worktype:['session','events'],primarywork:'events'}).primary,'bridal');
assert.equal(api.workMath({earned:1000,costs:200,hours:8,share:50}).left,300);
assert.equal(api.workMath({earned:0,costs:50,hours:2,share:100}).left,-50);
assert.equal(api.workMath({earned:100,costs:0,hours:0}),null);
assert.equal(api.workMath({earned:100,costs:0,hours:2,share:101}),null);
assert.equal(api.valueMath({additionalKept:100,extraCosts:20,price:49}).afterPurchase,31);
assert.equal(api.valueMath({additionalKept:0,extraCosts:0,price:49}).afterPurchase,-49);
assert.deepEqual(JSON.parse(JSON.stringify(api.valueMath({additionalKept:20,extraCosts:0,price:0}))),{benefit:20,afterPurchase:20,returnPercent:null,breakEven:true});
assert.equal(api.valueMath({additionalKept:20,extraCosts:0,price:-1}),null);
assert.equal(api.breakEven(10,0),0);
assert.equal(api.breakEven(20,49),3);assert.equal(api.breakEven(0,49),null);
for(const [role,example] of Object.entries(api.examples)){
 const plan=api.build(fill({careers:[role],goal:'money',load:'busy',available:'hour',...example.answers}));
 const math=api.workMath(example);assert(math);assert.equal(math.left,example.earned-example.costs);
 assert(!plan.evidence[0].answer.includes('Usually, yes.'));
}
const colorIssue=api.build(fill({careers:['color'],goal:'money',color_pay:'self',color_product:'no',color_time:'yes'}));
assert.equal(colorIssue.evidence[0].id,'color_product','An unknown cost should outrank a routine pay-model answer');
for(const bad of [null,[],{}, {careers:['fake'],goal:'money'},{careers:['color'],color_pay:'<script>'}]){
 const clean=api.cleanAnswers(bad||{});assert(!JSON.stringify(clean).includes('<script>'));assert(!api.complete(clean));
}
console.log(`PASS: 10 careers × 7 goals, ${variants} answer variations, mixed roles, employee/owner math, saved-answer sanitization and break-even calculations.`);
