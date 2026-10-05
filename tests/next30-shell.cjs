const {JSDOM}=require('jsdom');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
(async()=>{
const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://preview.example.test/?next30=paid&session_id=cs_test_Example123',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,ctx=dom.getInternalVMContext();w.scrollTo=()=>{};w.AbortSignal=AbortSignal;
w.fetch=async url=>({ok:true,json:async()=>String(url).includes('verify-checkout')?{paid:true}:{ready:true,schemas:['short-v5']}});
for(const f of ['day-math.js','breakdown-core.js','site-content.js','next30-core.js','next30-ui.js','next30-rebooking.js','next30-buyback.js','next30-services.js','next30-shell.js','app.js','lifecycle-ui.js','site-ui.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
await new Promise(r=>setTimeout(r,25));
const run=c=>vm.runInContext(c,ctx),$=s=>w.document.querySelector(s),input=(id,v)=>{const x=$('#'+id);assert(x,id);x.value=String(v);x.dispatchEvent(new w.Event('input',{bubbles:true}))};
run(`let a={careers:['color'],goal:'money',color_pay:'commission'};for(let pass=0;pass<8;pass++){for(const q of BookedNext30.questions(a))if(a[q.id]===undefined)a[q.id]=q.multi?[q.choices[0][0]]:q.choices[0][0];a=BookedNext30.cleanAnswers(a)}state.careerData={version:BookedNext30.VERSION,answers:a,carried:{},checks:{},metrics:{},tools:{},savedPlans:[],shell:{}};state.view='deepresult';render()`);
assert(!$('#your-number'));assert(!$('#next30-month'));
input('mmm-emp-gross',5000);$('#mmm-calc').click();assert(!$('#your-number'),'Unknown tips and bonuses must not become zero');
input('mmm-emp-tips',0);input('mmm-emp-bonus',0);$('#mmm-calc').click();assert($('#your-number'),'Money Map must immediately open planner');
for(const [id,v] of Object.entries({'yn-current-days':4,'yn-current-weeks':48,'yn-desired-annual':75000,'yn-desired-days':4,'yn-desired-weeks':48}))input(id,v);
$('#yn-calc').click();
assert.equal(w.document.querySelectorAll('#next30-month details summary').length,5);assert($('#month-review'));
const task=$('[data-month-task]');task.checked=true;task.dispatchEvent(new w.Event('change'));input('month-keep','Keep <this> & that');$('#month-save-review').click();run('render()');assert($('[data-month-task]').checked);assert.equal($('#month-keep').value,'Keep <this> & that');
const metric=run('state.currentCareerPlan.metrics[0].id');input('month-base-'+metric,0);input('month-now-'+metric,10);$('#month-compare').click();assert.match($('#month-delta-'+metric).textContent,/more/);input('month-base-'+metric,'');$('#month-compare').click();assert.match($('#month-delta-'+metric).textContent,/blank/);
run('state.careerData=null;render()');assert($('[data-month-task]').checked);assert.equal($('#month-keep').value,'Keep <this> & that');
// A zero must remain visible after render, not turn into an unknown.
run(`state.careerData.metrics['color-money-base-'+state.currentCareerPlan.metrics[0].id]=0;render()`);
assert.equal($('#month-base-'+metric).value,'0');
// Follow the actual Day Value -> demand route and enter a named appointment gap.
run(`state.careerData.shell.nextPath='p03';render()`);
for(const [id,v] of Object.entries({'dv-ticket':200,'dv-clients':2,'dv-available':8,'dv-booked':3,'dv-days':4}))input(id,v);
$('#dv-calc').click();$('#dv-route-go').click();
assert($('#demand-sprint'),'The next available tool must open, not just say saved');
assert.equal($('#ds-block').type,'text');input('ds-block','Tuesday afternoon');input('ds-capacity',2);$('#ds-save').click();
assert.equal(run('state.careerData.shell.demandSprint.started'),true);
run('state.careerData=null;render()');assert.equal($('#ds-block').value,'Tuesday afternoon');
// Missing employee sales must not make mixed total sales look complete.
run(`state.careerData.shell.moneyMap={payType:'mixed',employee:{},self:{},lanes:[{label:'Salon',type:'employee',fields:{gross:'5000',tips:'0',bonus:'0'}}],result:null};render()`);
$('#mmm-calc').click();assert.equal(run('state.careerData.shell.moneyMap.result.generated'),null);
assert.match($('#mmm-result').textContent,/Total sales are not available/);
dom.window.close();console.log('PASS: money-map unlock, four weeks, saved tasks and notes, refresh recovery, zero and unknown comparison.');
})().catch(e=>{console.error(e);process.exit(1)});
