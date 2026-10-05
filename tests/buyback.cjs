const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {JSDOM}=require('jsdom'),P=require('../next30-buyback.js');
const scenario={basis:'self',period:'Last four completed normal weeks',days:'5',desiredDays:'4',weeks:'46',weeklyIncome:'2000',targetAnnual:'80000',dayName:'Tuesday',removedIncome:'400',removedHours:'8',freeHours:'4',moveHours:'2',moveIncome:'200'};
let r=P.calc(scenario);assert.equal(r.annual,82800);assert.equal(r.currentAnnual,92000);assert.equal(r.noMoveAnnual,73600);assert.equal(r.gap,0);assert.equal(r.hoursBack,6);assert.equal(r.remainingHours,2);
assert.equal(P.calc({...scenario,moveHours:'0',moveIncome:'0'}).gap,6400);
assert.equal(P.calc({...scenario,basis:'employee'}).annual,82800,'Never multiply personal pay by a guessed commission');
assert(P.calc({...scenario,freeHours:''}).error);assert(P.calc({...scenario,weeks:'53'}).error);assert(P.calc({...scenario,moveHours:'5'}).error);assert(P.calc({...scenario,moveIncome:'401'}).error);assert(P.calc({...scenario,moveHours:'0'}).error);assert(P.calc({...scenario,desiredDays:'5'}).error);
assert.equal(P.calc({...scenario,weeklyIncome:'0',removedIncome:'0',moveIncome:'0',moveHours:'0',targetAnnual:'0'}).annual,0);
assert.equal(P.calc({...scenario,removedIncome:'-100',moveIncome:'0',moveHours:'0'}).annual,96600,'Removing a day losing money can improve income without assumed cost savings');
assert(P.calc({...scenario,removedHours:'30'}).error);
assert.equal(P.clean({review:'<hello>',checks:{0:true}}).review,'<hello>');
async function boot(paid=true,saved=null,url=null){
 const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:url||'https://preview.example.test/?next30=paid&session_id=cs_test_Example123',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,ctx=dom.getInternalVMContext(),errors=[];w.scrollTo=()=>{};w.AbortSignal=AbortSignal;w.addEventListener('error',e=>errors.push(e.error));
 w.fetch=async url=>({ok:true,json:async()=>String(url).includes('verify-checkout')?{paid}:{ready:true,schemas:['short-v5']}});
 if(saved)w.localStorage.setItem('booked-af-career-next30-v2',saved);
 for(const f of ['day-math.js','breakdown-core.js','site-content.js','next30-core.js','next30-ui.js','next30-rebooking.js','next30-buyback.js','next30-shell.js','app.js','lifecycle-ui.js','site-ui.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
 await new Promise(r=>setTimeout(r,25));
 const run=c=>vm.runInContext(c,ctx),$=s=>w.document.querySelector(s),input=(id,v)=>{const x=$('#'+id);assert(x,id);x.value=String(v);x.dispatchEvent(new w.Event('input',{bubbles:true}))};
 return {dom,w,run,$,input,errors};
}
(async()=>{
 let b=await boot(false);assert(!b.$('#buyback-tool'),'Unverified checkout must not expose P07');b.dom.window.close();
 b=await boot();let {w,run,$,input}=b;
 run(`let a={careers:['color'],goal:'time',color_pay:'commission'};for(let pass=0;pass<8;pass++){for(const q of BookedNext30.questions(a))if(a[q.id]===undefined)a[q.id]=q.multi?[q.choices[0][0]]:q.choices[0][0];a=BookedNext30.cleanAnswers(a)}state.careerData={version:BookedNext30.VERSION,answers:a,carried:{},checks:{},metrics:{},tools:{},savedPlans:[],shell:{}};state.view='deepresult';render()`);
 assert($('#buyback-tool'),'Salon time goal opens P07');
 for(const [k,v] of Object.entries(scenario))input('p07-'+k,v);
 $('#p07-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.match($('#p07-result').textContent,/82,800/);
 input('p07-moveIncome','0');assert.match($('#p07-result').textContent,/Test the shorter week again/);input('p07-moveHours','0');$('#p07-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.match($('#p07-result').textContent,/6,400/);
 input('p07-review','Trial notes <safe>');$('#p07-check-0').click();
 const saved=w.localStorage.getItem('booked-af-career-next30-v2');assert.equal(b.errors.length,0);b.dom.window.close();
 b=await boot(true,saved);({w,run,$,input}=b);run("state.view='deepresult';render()");assert.equal($('#p07-moveIncome').value,'0');assert.equal($('#p07-review').value,'Trial notes <safe>');assert($('#p07-check-0').checked);assert.match($('#p07-result').textContent,/6,400/);
 run("state.careerData.answers.goal='money';state.careerData.shell.nextPath='p07';render()");assert($('#buyback-tool'));$('#p07-back').click();assert(!$('#buyback-tool'));assert($('#money-map'));
 assert.equal(b.errors.length,0);b.dom.window.close();console.log('PASS: P07 personal-income basis, measured contribution, capacity limits, unknown/zero, realistic weeks, route, changed inputs, paid gate and saved progress.');
})().catch(e=>{console.error(e);process.exitCode=1});
