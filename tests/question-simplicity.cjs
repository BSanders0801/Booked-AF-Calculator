// All network calls are mocked. These tests never purchase, email, or submit a survey.
const {JSDOM}=require('jsdom');
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://preview.example.test/',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,ctx=dom.getInternalVMContext(),errors=[];
w.addEventListener('error',e=>errors.push(e.error));w.scrollTo=()=>{};w.AbortSignal=AbortSignal;
w.fetch=async()=>({ok:true,json:async()=>({ready:true,schemas:['short-v5']})});
for(const file of ['day-math.js','breakdown-core.js','site-content.js','app.js','lifecycle-ui.js','site-ui.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const run=code=>vm.runInContext(code,ctx);
const json=code=>JSON.parse(JSON.stringify(run(code)));
const $=selector=>w.document.querySelector(selector);
const click=selector=>{assert($(selector),'Missing '+selector);$(selector).click();assert.equal(errors.length,0,errors.map(e=>e.stack).join('\n'))};
run(`function completeShort(input){const a={...input};for(const q of shortQuestions){if(q.when&&!q.when(a))continue;if(a[q.id]===undefined){const value=shortChoices(q,a)[0][0];a[q.id]=q.multi?[value]:value}}return validateShortAnswers(a)}`);
try {
 run(`restoreSchema(SHORT_SCHEMA);state.answers=completeShort({worktype:['owner'],leadershiprole:'manager',goal:['money','time'],goalpriority:'money'})`);
 const delivered=json('answersForDelivery()');
 assert.equal(delivered.leadershiprole,'manager');
 assert.deepEqual(delivered.goal,['money','time']);
 assert.equal(delivered.goalpriority,'money');
 assert.equal(run('shortLane(validateShortAnswers(answersForDelivery()))'),'manager');
 assert(!json('shortQuestions.map(q=>q.id)').includes('paystyle'));
 assert(!json('deepQuestions.map(q=>q.id)').includes('pain'));
 assert(!json("shortVisibleQuestions(completeShort({worktype:['inactive'],goal:['clients']})).map(q=>q.id)").includes('primarywork'));
 assert(!json("shortVisibleQuestions(completeShort({worktype:['session'],primarywork:'session',goal:['money']})).map(q=>q.id)").includes('workdays'));
 assert(json("shortVisibleQuestions(completeShort({worktype:['session'],primarywork:'session',goal:['time']})).map(q=>q.id)").includes('workdays'));
 // Reuse only matching answers; don't ask a new customer to repeat pay, days, or specialty.
 run(`state.answers=completeShort({worktype:['color'],primarywork:'chair-color',goal:['money'],paymodel:'commission',days:'4'});state.next30Verified=true;state.deepAnswers={};state.deepIndex=0;state.view='deepintake';render()`);
 assert.match($('#app').textContent,/kept 3 answers/);
 assert.deepEqual(json('carriedDeepAnswers()'),{model:'commission',weekly:'four',service:'color'});
 assert(!json('deepQuestions.filter(q=>deepQuestionVisible(q,carriedDeepAnswers())).map(q=>q.id)').includes('model'));
 click('#edit-carried');
 assert.equal(run('deepQuestions[state.deepIndex].id'),'model');
 click('[data-value="hourly"]');click('#dnext');
 assert.equal(run('state.deepAnswers.model'),'hourly');
 // Existing paid answers win over a copied free answer.
 assert(!Object.hasOwn(json('prepareDeepAnswers()'),'model'));
 // Back skips conditional questions instead of bouncing forward to the same question.
 run(`state.editCarriedAnswers=true;state.deepAnswers={tenure:'new',futurefeel:'thrilled',model:'hourly',futuregoal:'home',cushion:'solid',target:'time'};state.deepIndex=deepQuestions.findIndex(q=>q.id==='rebook');render()`);
 click('#dback');assert.equal(run('deepQuestions[state.deepIndex].id'),'service');
 // Multiple marketing choices persist; "help" is exclusive; deselecting disables Next.
 run(`state.deepAnswers={target:'clients',monthlymarketing:'0',marketingcomfort:'social'};state.deepIndex=deepQuestions.findIndex(q=>q.id==='marketingcomfort');render()`);
 assert.deepEqual(json('state.deepAnswers.marketingcomfort'),['social']);
 click('[data-value="people"]');assert.deepEqual(json('state.deepAnswers.marketingcomfort'),['social','people']);
 assert.equal($('[data-value="people"]').getAttribute('aria-pressed'),'true');
 assert.deepEqual(JSON.parse(w.sessionStorage.getItem('booked-af-deep-answers')).marketingcomfort,['social','people']);
 const result=json('deepRead()');assert.match(JSON.stringify(result),/Share one service/);assert.match(JSON.stringify(result),/Ask happy clients/);
 click('[data-value="help"]');assert.deepEqual(json('state.deepAnswers.marketingcomfort'),['help']);
 click('[data-value="help"]');assert($('#dnext').disabled);
 // The last visible step is identified after conditional questions, not by raw array length.
 run(`state.deepAnswers={tenure:'new',futurefeel:'thrilled',model:'hourly',futuregoal:'home',cushion:'solid',target:'time',risk:'steady'};state.deepIndex=deepQuestions.findIndex(q=>q.id==='risk');render()`);
 assert.match($('#dnext').textContent,/BUILD MY 30-DAY PLAN/);
 // Check each paid answer branch still produces a plan without undefined copy.
 for(const target of ['clients','rebook','money','time','control','help']){
  run(`state.deepAnswers={target:${JSON.stringify(target)}};for(const q of deepQuestions){if(q.when&&!q.when(state.deepAnswers))continue;if(state.deepAnswers[q.id]===undefined)state.deepAnswers[q.id]=q.multi?[q.choices[0][0]]:q.choices[0][0]}`);
  const plan=JSON.stringify(json('deepRead()'));assert(!plan.includes('undefined'));
 }
 assert.equal(errors.length,0);
 console.log('Question simplicity: carried answers, editing, conditional navigation, multi-select, paid paths and delivery identity passed.');
} finally {dom.window.close()}
