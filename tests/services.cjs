const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {JSDOM}=require('jsdom'),P=require('../next30-services.js');
const row=(x={})=>({id:'a',service:'Color',total:'300',booked:'2',actual:'3',materials:'60',overrun:'yes',redo:'no',strategic:'Maintenance clients',...x});
const price={service:'Color',period:'Four completed weeks',basis:'self',share:'',currentPrice:'300',proposedPrice:'350',materials:'60',feePercent:'3',feeFixed:'0.30',visits:'10',retained:'8',hours:'3',gap:'yes',demand:'yes',control:'yes',drag:'price',evidence:'Recorded demand and a personal-income gap',effective:'Next month',audience:'New appointments'};
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
let t=P.stats([row(),row({total:'100',booked:'1',actual:'',materials:'',overrun:'unknown',redo:'unknown'}),row({total:'0',actual:'2',overrun:'no',materials:'0'})]);assert.equal(t.n,3);near(t.ticket,400/3);assert.equal(t.median,100);assert.equal(t.bookedRate,80);assert.equal(t.actualRate,60);assert.equal(t.costActualRate,48);assert.equal(t.actualCount,2);assert.equal(t.costCount,2);assert.equal(t.overrunCount,1);assert.equal(t.overrunKnown,2);assert.equal(t.redoKnown,2);
assert.equal(P.stats([row({actual:'',materials:'',overrun:'unknown',redo:'unknown'})]).actualRate,null);assert.equal(P.stats([]).median,null);assert(P.validate(row({actual:'0'})));assert(P.validate(row({overrun:'no'})));assert(P.validate(row({booked:'-2'})));assert.equal(P.validate(row({actual:'',materials:'',overrun:'unknown'})),'');
assert.equal(P.groups([row(),row({service:' color '})]).length,1);assert.equal(P.stats([row({materials:'400'})]).costActualRate,-100/3);
let r=P.scenario(price);near(r.oldEach,230.7);near(r.newEach,279.2);near(r.before,2307);near(r.after,2233.6);near(r.change,-73.4);assert.equal(r.breakEven,9);assert.equal(r.retained,8);assert.equal(r.lost,2);
r=P.scenario({...price,basis:'commission',share:'50',materials:'0',feePercent:'0',feeFixed:'0'});assert.equal(r.before,1500);assert.equal(r.after,1400);assert.equal(r.oldEach,150);assert.equal(r.breakEven,9);
assert(P.scenario({...price,basis:'hourly'}).error);assert(P.scenario({...price,basis:'commission',share:''}).error);assert(P.scenario({...price,materials:''}).error);assert(P.scenario({...price,retained:'11'}).error);assert(P.scenario({...price,retained:'1.5'}).error);assert(P.scenario({...price,hours:'0'}).error);assert(P.scenario({...price,feePercent:'101'}).error);
assert.equal(P.scenario({...price,retained:'0'}).after,0);assert.equal(P.scenario({...price,proposedPrice:'0'}).breakEven,null);
const ready={rows:Array.from({length:10},(_,i)=>row({id:String(i),actual:'2',overrun:'no'})),price};assert.deepEqual(P.readiness(ready),[]);assert(P.readiness({...ready,price:{...price,gap:'unknown'}}).length);assert(P.readiness({...ready,rows:ready.rows.slice(0,9)}).length);assert(P.readiness({...ready,rows:ready.rows.map(r=>({...r,materials:''}))}).length);assert(P.readiness({...ready,price:{...price,control:'no'}}).length);assert(P.readiness({...ready,rows:ready.rows.map(r=>({...r,redo:'unknown'}))}).length);
assert.match(P.csv([row({service:'=HYPERLINK("bad")'})]),/"'=HYPERLINK/);assert.equal(P.clean({rows:Array.from({length:30},()=>row())}).rows.length,20);
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
 let b=await boot(false);assert(!b.$('#service-audit'),'Unverified checkout must not expose the audit');b.dom.window.close();
 b=await boot();let {w,run,$,input}=b;
 run(`let a={careers:['color'],goal:'money',color_pay:'commission'};for(let pass=0;pass<8;pass++){for(const q of BookedNext30.questions(a))if(a[q.id]===undefined)a[q.id]=q.multi?[q.choices[0][0]]:q.choices[0][0];a=BookedNext30.cleanAnswers(a)}state.careerData={version:BookedNext30.VERSION,answers:a,carried:{},checks:{},metrics:{},tools:{},savedPlans:[],shell:{}};state.view='deepresult';render()`);
 $('#open-service-audit').click();assert($('#service-audit'));assert($('#price-planner'));
 for(const [k,v] of Object.entries(row({id:'',actual:'2',overrun:'no',service:'Color <script>bad</script>'})))if(k!=='id')input('svc-'+k,v);
 $('#svc-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(run('state.careerData.shell.services.rows.length'),1);assert(!$('#service-audit script'));assert.match($('#svc-summary').textContent,/1\/20/);
 $('[data-svc-edit]').click();input('svc-service','Color');$('#svc-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(run('state.careerData.shell.services.rows.length'),1);
 for(const [k,v] of Object.entries(price))input('price-'+k,v);$('#price-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.match($('#price-result').textContent,/2,233.6/);assert.match($('#price-result').textContent,/at least 10/);
 input('price-retained','10');assert.match($('#price-result').textContent,/Test this price again/);$('#price-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.match($('#price-result').textContent,/2,792/);
 $('#svc-check-0').click();input('svc-review','Keep the notes <exact>');input('svc-service','Next draft');
 const saved=w.localStorage.getItem('booked-af-career-next30-v2');assert.equal(b.errors.length,0);b.dom.window.close();
 b=await boot(true,saved);({w,run,$,input}=b);run("state.view='deepresult';render()");assert.equal($('#svc-service').value,'Next draft');assert.equal($('#price-retained').value,'10');assert.equal($('#svc-review').value,'Keep the notes <exact>');assert($('#svc-check-0').checked);assert.match($('#price-result').textContent,/2,792/);
 $('[data-svc-delete]').click();assert.equal(run('state.careerData.shell.services.rows.length'),0);assert(!$('#price-result').textContent.includes('2,792'),'Deleting evidence invalidates the result');$('#svc-back').click();assert($('#money-map'));
 // A gross-sales-to-personal-pay ratio must not invent a leak or compare unlike targets.
 run(`state.careerData.shell.day0Complete=true;state.careerData.shell.nextPath='p03';state.careerData.shell.moneyMap.payType='employee';state.careerData.shell.moneyMap.result={complete:true,baseline:4000};state.careerData.shell.numberPlanner.result={complete:true,currentAnnual:48000,desiredAnnual:60000,currentDays:5,desiredDays:5,targetPerDay:260};render()`);
 for(const [k,v] of Object.entries({ticket:'300',clients:'4',available:'8',booked:'7.5',days:'5',revenue:'1200'}))input('dv-'+k,v);$('#dv-calc').click();assert.equal(run('state.careerData.shell.dayValue.route.id'),'p05');$('#dv-route-go').click();assert($('#service-audit'));
 assert.equal(b.errors.length,0);b.dom.window.close();console.log('PASS: service audit denominators, cost/time unknowns, negative contribution, price attrition, personal commission basis, readiness evidence, paid gate, routes, edit/delete, CSV escaping and reload.');
})().catch(e=>{console.error(e);process.exitCode=1});
