// Approved behavior, real public build, persistence and money units. All network requests are mocked.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
(async()=>{
 const {secureSources}=await import('../scripts/build-secure-site.mjs');
 const c=vm.createContext({});vm.runInContext(fs.readFileSync('breakdown-core.js','utf8')+';globalThis.free={shortQuestions,shortChoices,shortQuestionCopy,shortVisibleQuestions,validateShortAnswers,buildShortBreakdown,cleanServiceTime,shortStage};',c);
 const f=c.free;
 const valid={service:'Root touch-up',hours:1,minutes:45};
 assert.equal(f.cleanServiceTime(valid).minutes,45);
 for(const value of ['long',{...valid,service:''},{...valid,hours:NaN},{...valid,minutes:60},{...valid,hours:24,minutes:1},{...valid,hours:0,minutes:0},{...valid,hours:'1'}])assert.equal(f.cleanServiceTime(value),null);
 const complete=input=>{const a={...input};for(const q of f.shortQuestions){if(q.when&&!q.when(a))continue;if(a[q.id]!==undefined)continue;a[q.id]=q.type==='service-time'?valid:q.multi?[f.shortChoices(q,a)[0][0]]:f.shortChoices(q,a)[0][0];}return f.validateShortAnswers(a)};
 const exploring=complete({careerstage:'considering'});assert(!('graduation' in exploring));assert(!('practice' in exploring));assert.equal(f.shortStage(exploring).label,'EXPLORING A HAIR CAREER');assert(!JSON.stringify(f.buildShortBreakdown(exploring)).includes('undefined'));
 const chair=complete({careerstage:'working',worktype:['color'],goal:['money']});assert.equal(chair.servicehours.service,valid.service);assert.throws(()=>f.validateShortAnswers({...chair,servicehours:'long'}));
 vm.runInContext(fs.readFileSync('next30-core.js','utf8'),c);const paid=c.BookedNext30;
 assert(!paid.questions({careers:['education']}).some(q=>q.id==='education_followup'));
 assert(paid.questions({careers:['color']}).find(q=>q.id==='color_signature').multi);
 assert.deepEqual(Array.from(paid.cleanAnswers({careers:['color'],color_consult:'clear'}).color_consult),['goal','price','time','upkeep']);
 assert.deepEqual(Array.from(paid.cleanAnswers({careers:['color'],color_consult:['goal','history','price']}).color_consult),['goal','history','price']);
 assert.deepEqual(Array.from(paid.cleanAnswers({careers:['color'],color_consult:['goal','varies']}).color_consult),['varies']);
 const generated=await secureSources();
 // Both helper and form must survive public-source extraction.
 assert(generated['app.js'].includes('function renderServiceTimeQuestion'));
 assert(generated['breakdown-core.js'].includes('function cleanServiceTime'));
 const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://preview.example.test/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,ctx=dom.getInternalVMContext(),errors=[];w.scrollTo=()=>{};w.AbortSignal=AbortSignal;w.fetch=async()=>({ok:true,json:async()=>({ready:true,schemas:['short-v5']})});w.addEventListener('error',e=>errors.push(e.error));
 try{
 for(const file of ['day-math.js','breakdown-core.js','site-content.js','next30-core.js','next30-ui.js','next30-shell.js','app.js','lifecycle-ui.js','site-ui.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
 const run=s=>vm.runInContext(s,ctx),$=s=>w.document.querySelector(s),input=(id,v)=>{const x=$('#'+id);assert(x,id);x.value=String(v);x.dispatchEvent(new w.Event('input',{bubbles:true}))};
 run(`restoreSchema(SHORT_SCHEMA);state.answers=${JSON.stringify(chair)};state.index=questions.findIndex(q=>q.id==='servicehours');state.view='question';render()`);
 assert.equal($('#service-name').value,'Root touch-up');input('service-name','<Color & cut>');input('service-hours',2);input('service-minutes',15);$('#service-time-form').dispatchEvent(new w.Event('submit',{cancelable:true}));
 assert.equal(run('state.answers.servicehours.hours'),2);
 const saved=JSON.parse(w.localStorage.getItem('booked-af-free-progress-v1'));assert.equal(saved.answers.servicehours.service,'<Color & cut>');
 run(`state.index=questions.findIndex(q=>q.id==='servicehours');state.view='question';render()`);assert.equal($('#service-name').value,'<Color & cut>');assert(!$('#app color'));$('#back').click();assert.equal(run('questions[state.index].id'),'costs');
 run(`state.view='email';render()`);assert($('#name').required);assert.equal($('#name').checkValidity(),false);
 run(`let a={careers:['color'],goal:'money',color_pay:'commission'};for(let pass=0;pass<8;pass++){for(const q of BookedNext30.questions(a))if(a[q.id]===undefined)a[q.id]=q.multi?[q.choices[0][0]]:q.choices[0][0];a=BookedNext30.cleanAnswers(a)}state.next30Verified=true;state.careerData={version:BookedNext30.VERSION,answers:a,carried:{},checks:{},metrics:{},tools:{},savedPlans:[],shell:{}};state.view='deepresult';render()`);
 input('mmm-emp-retail',200);input('mmm-emp-gross',5000);input('mmm-emp-tips',0);input('mmm-emp-bonus',0);$('#mmm-calc').click();assert.equal(run('state.careerData.shell.moneyMap.result.baseline'),5000,'Retail already in gross must not be double-counted');
 input('yn-desired-month',6000);assert.equal($('#yn-desired-annual').value,'72000');assert.equal($('#yn-current-month').value,'5000');
 input('yn-desired-annual',84000);assert.equal($('#yn-desired-month').value,'7000');
 run(`state.careerData.shell.nextPath='p03';render()`);
 for(const [id,value] of Object.entries({'dv-ticket':100,'dv-clients':4,'dv-available':8,'dv-booked':5,'dv-days':4,'dv-revenue':90}))input(id,value);
 $('#dv-calc').click();assert.equal(run('state.careerData.shell.dayValue.result.dayRevenue'),450,'Hourly sales must be multiplied by booked hours');
 run(`state.careerData.shell.dayValue={ticket:'100',clients:'4',available:'8',booked:'5',days:'4',revenue:'450'};render()`);
 assert.equal($('#dv-revenue').value,'90','Saved daily sales must be visibly converted to hourly sales');
 input('dv-revenue','');$('#dv-calc').click();assert.equal(run('state.careerData.shell.dayValue.result.dayRevenue'),400,'Clearing hourly sales must not reuse a hidden legacy daily amount');
 assert.equal(errors.length,0,errors.map(e=>e.stack).join('\n'));
 }finally{w.close()}
 const rebook=require('../next30-rebooking.js');assert.equal(rebook.coverage({available:'80',blocked:'20',returning:'40',newClients:'10'}).returning,50);assert.equal(rebook.coverage({available:'80',blocked:'',returning:'40',newClients:'10'}).returning,50);
 console.log('PASS: approved copy behavior, named service time, required name, exploring path, multi-select migration, retail, monthly targets, hourly sales and available capacity.');
})().catch(e=>{console.error(e);process.exitCode=1});
