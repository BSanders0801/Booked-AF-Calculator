const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {JSDOM}=require('jsdom'),P=require('../next30-lanes.js');
const row=(x={})=>({id:'chair',name:'Chair work',kind:'employee',actualPay:'50000',actualCosts:'1000',actualHours:'1800',planPay:'55000',planCosts:'1000',planHours:'1600',certainty:'existing',evidence:'Pay statements',job:'Dependable income',...x});
const settings={period:'Jan 1–Dec 31, 2025',target:'65000',currentShared:'2000',plannedShared:'2500',currentSharedHours:'100',plannedSharedHours:'100',weeks:'48',days:'5',hours:'8'};
const second=row({id:'teach',name:'Teaching',kind:'self',actualPay:'15000',actualCosts:'5000',actualHours:'200',planPay:'22000',planCosts:'6000',planHours:'300',certainty:'developing'});
let r=P.calc({rows:[row(),second],settings});assert.equal(r.current,57000);assert.equal(r.planned,67500);assert.equal(r.actualGap,8000);assert.equal(r.planGap,-2500);assert.equal(r.capacity,1920);assert.equal(r.plannedHours,2000);assert.equal(r.timeGap,80);assert.deepEqual(r.developing,['Teaching']);
r=P.calc({rows:[row(),{...second,actualCosts:'',planHours:''}],settings});assert.equal(r.current,null);assert.equal(r.knownCurrentSubtotal,49000);assert.equal(r.plannedHours,null);assert.equal(r.timeGap,null);assert.deepEqual(r.currentMissing,['Teaching']);
assert.equal(P.lane(row({actualPay:'0',actualCosts:'0'})).actual,0);assert.equal(P.lane(row({actualPay:'100',actualCosts:'150'})).actual,-50);
assert(P.calc({rows:[row(),row({id:'other',name:' CHAIR WORK '})],settings}).error);assert(P.calc({rows:[row()],settings:{...settings,weeks:'53'}}).error);assert(P.calc({rows:[row()],settings:{...settings,currentShared:''}}).error);assert(P.validate(row({actualHours:'9000'})));assert(P.validate(row({actualCosts:'-1'})));assert.equal(P.clean({rows:Array.from({length:9},()=>row())}).rows.length,6);assert.match(P.csv({rows:[row({name:'=HYPERLINK("bad")'})],settings}),/"'=HYPERLINK/);
async function boot(paid=true,saved=null,url=null){
 const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:url||'https://preview.example.test/?next30=paid&session_id=cs_test_Example123',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,ctx=dom.getInternalVMContext(),errors=[];w.scrollTo=()=>{};w.AbortSignal=AbortSignal;w.addEventListener('error',e=>errors.push(e.error));
 w.fetch=async url=>({ok:true,json:async()=>String(url).includes('verify-checkout')?{paid}:{ready:true,schemas:['short-v5']}});
 if(saved)w.localStorage.setItem('booked-af-career-next30-v2',saved);
 for(const f of ['day-math.js','breakdown-core.js','site-content.js','next30-core.js','next30-ui.js','next30-rebooking.js','next30-buyback.js','next30-services.js','next30-lanes.js','next30-shell.js','app.js','lifecycle-ui.js','site-ui.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
 await new Promise(r=>setTimeout(r,25));
 const run=c=>vm.runInContext(c,ctx),$=s=>w.document.querySelector(s),input=(id,v)=>{const x=$('#'+id);assert(x,id);x.value=String(v);x.dispatchEvent(new w.Event('input',{bubbles:true}))};
 return {dom,w,run,$,input,errors};
}
(async()=>{
 let b=await boot(false);assert(!b.$('#income-lanes'));b.dom.window.close();
 b=await boot();let {w,run,$,input}=b;
 run(`let a={careers:['color','education'],goal:'money',color_pay:'commission'};for(let pass=0;pass<8;pass++){for(const q of BookedNext30.questions(a))if(a[q.id]===undefined)a[q.id]=q.multi?[q.choices[0][0]]:q.choices[0][0];a=BookedNext30.cleanAnswers(a)}state.careerData={version:BookedNext30.VERSION,answers:a,carried:{},checks:{},metrics:{},tools:{},savedPlans:[],shell:{}};state.view='deepresult';render()`);
 $('#open-income-lanes').click();assert($('#income-lanes'));
 for(const [k,v] of Object.entries(settings))input('lane-'+k,v);
 for(const item of [row(),second]){for(const [k,v] of Object.entries(item))if(k!=='id')input('lane-'+k,v);$('#lane-form').dispatchEvent(new w.Event('submit',{cancelable:true}));}
 assert.equal(run('state.careerData.shell.incomeLanes.rows.length'),2);$('#lane-calc').click();assert.match($('#lane-result').textContent,/67,500/);assert.match($('#lane-result').textContent,/80 hours/);assert.match($('#lane-result').textContent,/not secured income/);
 $('[data-lane-edit]').click();input('lane-planPay','60000');$('#lane-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(run('state.careerData.shell.incomeLanes.rows.length'),2);$('#lane-calc').click();assert.match($('#lane-result').textContent,/72,500/);
 input('lane-target','70000');assert.match($('#lane-result').textContent,/Inputs changed/);$('#lane-calc').click();$('#lane-check-0').click();input('lane-review','Confirm teaching dates <exact>');input('lane-name','Next draft');
 const saved=w.localStorage.getItem('booked-af-career-next30-v2');assert.equal(b.errors.length,0);b.dom.window.close();
 b=await boot(true,saved);({w,run,$,input}=b);run("state.view='deepresult';render()");assert.equal($('#lane-name').value,'Next draft');assert.equal($('#lane-review').value,'Confirm teaching dates <exact>');assert($('#lane-check-0').checked);assert.match($('#lane-result').textContent,/72,500/);
 $('[data-lane-delete]').click();assert.equal(run('state.careerData.shell.incomeLanes.rows.length'),1);assert(!$('#lane-result').textContent.includes('72,500'));$('#lane-back').click();assert($('#money-map'));assert($('#next30-save-file'));assert($('#next30-import'));
 let exported=null;w.next30Download=(name,text,type)=>{exported={name,text,type}};$('#next30-save-file').click();assert.equal(JSON.parse(exported.text).shell.incomeLanes.rows.length,1);assert.equal(exported.type,'application/json');
 const backup=JSON.parse(exported.text);backup.shell.services={rows:[],draft:{service:'Saved appointment draft'},review:'Audit note'};run('state.careerData.shell={};render()');
 const restore=$('#next30-import');Object.defineProperty(restore,'files',{value:[{size:exported.text.length,text:async()=>JSON.stringify(backup)}],configurable:true});await restore.onchange();assert.equal(run('state.careerData.shell.incomeLanes.rows.length'),1);assert.equal(run('state.careerData.shell.incomeLanes.review'),'Confirm teaching dates <exact>');assert.equal(run('state.careerData.shell.services.review'),'Audit note');assert($('#next30-save-file'));
 const before=run('JSON.stringify(state.careerData)');const bad=$('#next30-import');Object.defineProperty(bad,'files',{value:[{size:12,text:async()=>'{bad json'}],configurable:true});await bad.onchange();assert.equal(run('JSON.stringify(state.careerData)'),before);assert.match($('#next30-import-status').textContent,/does not look/);assert.equal(b.errors.length,0);b.dom.window.close();
 console.log('PASS: separate pay/revenue lanes, shared costs once, known/unknown/zero amounts, negative net income, duplicate protection, time capacity, CSV safety, paid gate, edit/delete and saved reload.');
})().catch(e=>{console.error(e);process.exitCode=1});
