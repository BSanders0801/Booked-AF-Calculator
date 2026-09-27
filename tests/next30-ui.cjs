// Production scripts; network mocked. No payments, emails, or survey submissions.
const {JSDOM}=require('jsdom');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const files=['day-math.js','breakdown-core.js','site-content.js','next30-core.js','next30-ui.js','app.js','lifecycle-ui.js','site-ui.js'];
async function boot(paid=true,saved=null){
 const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://preview.example.test/?next30=paid&session_id=cs_test_Example123',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,ctx=dom.getInternalVMContext(),errors=[];w.scrollTo=()=>{};w.AbortSignal=AbortSignal;
 w.addEventListener('error',e=>errors.push(e.error));
 w.fetch=async url=>({ok:true,json:async()=>String(url).includes('verify-checkout')?{paid}:{ready:true,schemas:['short-v5']}});
 if(saved)w.sessionStorage.setItem('booked-af-career-next30-v1',JSON.stringify(saved));
 for(const file of files)vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
 await new Promise(r=>setTimeout(r,20));
 const run=code=>vm.runInContext(code,ctx),$=s=>w.document.querySelector(s),json=c=>JSON.parse(JSON.stringify(run(c)));
 const click=s=>{assert($(s),'Missing '+s);$(s).click();assert.equal(errors.length,0,errors.map(e=>e.stack).join('\n'))};
 run(`function fillCareer(input){let a=BookedNext30.cleanAnswers(input);for(let pass=0;pass<8;pass++){for(const q of BookedNext30.questions(a))if(a[q.id]===undefined)a[q.id]=q.multi?[q.choices[0][0]]:q.choices[0][0];a=BookedNext30.cleanAnswers(a)}return a}`);
 return {dom,w,run,$,json,click,errors};
}
(async()=>{
 let b=await boot(false);assert.equal(b.run('state.view'),'deepverify');assert(!b.$('#next30-import'));b.dom.window.close();
 b=await boot();const {run,$,click,json,w}=b;
 try{
  assert.equal(run('state.view'),'deepintake');assert($('#next30-next').disabled);
  click('[data-next30-choice="color"]');click('[data-next30-choice="bridal"]');click('#next30-next');
  assert.equal(run('state.careerData.currentId'),'primary');click('[data-next30-choice="bridal"]');click('#next30-next');click('#next30-back');
  assert.equal(run('state.careerData.currentId'),'primary');
  for(const role of json('Object.keys(BookedNext30.roles)')){
   run(`state.careerData={version:BookedNext30.VERSION,answers:{careers:[${JSON.stringify(role)}]},carried:{},currentId:null,checks:{},metrics:{},tools:{},savedPlans:[]};state.view='deepintake';render()`);
   let steps=0;
   while(run('state.view')==='deepintake'){
    assert(++steps<25);if($('#next30-next').disabled)click('[data-next30-choice]');click('#next30-next');
   }
   assert.equal(run('state.currentCareerPlan.role'),role);assert($('#next30-workmath'));assert.equal(w.document.querySelectorAll('[data-next30-copy]').length,3);
   assert(!$('#app').textContent.includes('undefined'));assert.equal(run('state.currentCareerPlan.supporting.length'),7);
  }
  run(`state.careerData.answers=fillCareer({careers:['color','bridal'],primary:'color',goal:'money',color_pay:'self'});state.careerData.currentId=null;state.view='deepresult';render()`);
  const input=(id,v)=>{const el=$('#n30-'+id);assert(el);el.value=String(v);el.dispatchEvent(new w.Event('input',{bubbles:true}))};
  input('earned',200);input('share',100);input('costs',40);input('hours',2);$('#next30-workmath').dispatchEvent(new w.Event('submit',{cancelable:true}));
  assert.match($('#next30-work-result').textContent,/\$160\.00/);assert.match($('#next30-work-result').textContent,/\$80\.00/);
  click('#next30-score');assert.match($('#next30-score-status').textContent,/Add a before and after/);
  input('extra',-10);input('implementation',5);input('price',49);$('#next30-value').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.match($('#next30-value-result').textContent,/-\$64\.00/);
  input('perwin',25);$('#next30-break-even').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.match($('#next30-break-result').textContent,/2 additional/);
  click('[data-next30-task]');assert.match($('#next30-progress').textContent,/1 of/);run('render()');assert($('[data-next30-task]').checked);
  assert.notEqual(run("next30TaskKey('color-money',1,0,'old task')"),run("next30TaskKey('color-money',1,0,'new task')"));
  click('[data-next30-lane="bridal"]');assert.equal(run('state.view'),'deepintake');
  while(run('state.view')==='deepintake'){if($('#next30-next').disabled)click('[data-next30-choice]');click('#next30-next')}
  assert.equal(run('state.currentCareerPlan.role'),'bridal');assert($('[data-next30-restore="color-money"]'));click('[data-next30-restore="color-money"]');assert.equal(run('state.currentCareerPlan.role'),'color');
  assert.equal($('#n30-extra').value,'-10');
  run("globalThis.downloads=[];next30Download=(name,content,type)=>downloads.push({name,content,type})");click('#next30-save-file');click('#next30-save-text');
  const downloads=json('downloads');assert.equal(downloads.length,2);assert(downloads[1].content.includes('STEAL THESE WORDS'));
  const exported=JSON.parse(downloads[0].content);assert(exported.savedPlans.length>=2);
  async function importFile(content){Object.defineProperty($('#next30-import'),'files',{configurable:true,value:[{size:content.length,text:async()=>content}]});await $('#next30-import').onchange()}
  await importFile('{broken');assert.match($('#next30-import-status').textContent,/current answers are still here/);
  await importFile(JSON.stringify(exported));assert($('[data-next30-restore="bridal-money"]'));assert.equal($('#n30-extra').value,'-10');
  assert.equal(json("next30SavedPlans([{answers:{careers:['evil']}}])").length,0);
  run("state.view='next30sample';render()");assert.equal(w.document.querySelectorAll('[data-next30-sample]').length,10);
  click('[data-next30-sample="session"]');assert.match($('#app').textContent,/WHOLE-JOB MATH|whole-job math/);assert.match($('#app').textContent,/EXAMPLE ONLY/);assert(!$('#next30-import'));
  assert.match($('.example-math').textContent,/48.57/);
  for(const [role,rate] of [['color','61.25'],['bridal','50.00'],['session','48.57']]){
   run("state.view='intro';render()");click(`[data-example-role="${role}"]`);
   assert.equal(run('state.view'),'next30sample');assert.match($('.example-math').textContent,new RegExp(rate.replace('.','\\.')));
   assert.equal($(`[data-next30-sample="${role}"]`).getAttribute('aria-pressed'),'true');
  }
  assert.equal(b.errors.length,0);
 }finally{b.dom.window.close()}
 b=await boot(true,{version:'career-v1',answers:{careers:['color']},carried:[],checks:'bad',tools:42,metrics:[],savedPlans:[null,{},'bad']});
 assert.equal(b.run('state.view'),'deepintake');assert.equal(b.errors.length,0);b.dom.window.close();
 console.log('PASS: verified payment entry, 10 complete career flows, mixed careers, calculators, changed tasks, save/import, malformed files and 10 public examples.');
})().catch(e=>{console.error(e);process.exitCode=1});
