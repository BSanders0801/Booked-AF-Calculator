const {JSDOM}=require('jsdom');
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
(async()=>{
 const {buildTestWorker}=await import('../scripts/build-test-worker.mjs');
 await buildTestWorker({origin:'https://booked-af-email-test.fixture.workers.dev',checkoutUrl:'https://buy.stripe.com/test_fixture',paymentLinkId:'plink_fixture'});
 const bundle=(await import('../.test-worker/paid-bundle.mjs')).default;
 const files=['breakdown-core.js','site-content.js','paid-loader.js','app.js','lifecycle-ui.js','site-ui.js'];
 for(const paid of [false,true]){
 const dom=new JSDOM(fs.readFileSync('.test-website/index.html','utf8'),{url:'https://booked-af-email-test.fixture.workers.dev/'+(paid?'?next30=paid&session_id=cs_test_fixture':''),runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,ctx=dom.getInternalVMContext(),errors=[];w.scrollTo=()=>{};w.AbortSignal=AbortSignal;
 w.addEventListener('error',e=>errors.push(e.error));
 w.fetch=async url=>String(url).endsWith('/paid-content')?new Response(bundle,{headers:{'Content-Type':'text/javascript'}}):Response.json({ready:true,schemas:['short-v5'],success:true});
 w.URL.createObjectURL=()=> 'blob:fixture';w.URL.revokeObjectURL=()=>{};
 const append=w.document.head.append.bind(w.document.head);w.document.head.append=el=>{if(el.src==='blob:fixture'){vm.runInContext(bundle,ctx);queueMicrotask(()=>el.onload());}else append(el);};
 for(const file of files)vm.runInContext(fs.readFileSync('.test-website/'+file,'utf8'),ctx,{filename:file});
 const run=s=>vm.runInContext(s,ctx);await new Promise(r=>setTimeout(r,40));
 if(paid){
  assert.equal(run('state.next30Verified'),true);assert.equal(run('state.view'),'deepintake');
  for(let n=0;run('state.view')==='deepintake';n++){
   assert(n<40);const next=w.document.querySelector('#next30-next');if(next.disabled)(w.document.querySelector('[data-next30-choice="money"]')||w.document.querySelector('[data-next30-choice]')).click();w.document.querySelector('#next30-next').click();
  }
  assert(w.document.querySelector('#money-map'),run('state.view')+' '+w.document.querySelector('#app').textContent.slice(0,700)+' '+errors.map(e=>e.message).join(';'));
 }else{
  assert.equal(run('typeof BookedNext30'),'undefined');
  for(const view of ['intro','sample','next30sample','paid','plans','about','privacy','contact'])run(`state.view='${view}';render()`);
  run("state.next30Verified=true;state.view='deepresult';render()");assert(!w.document.querySelector('#money-map'));
  run("restoreSchema(SHORT_SCHEMA);state.answers={};for(const q of questions){if(!q.when||q.when(state.answers)){const c=shortChoices(q,state.answers);state.answers[q.id]=q.multi?[c[0][0]]:c[0][0]}}state.emailSent=true;state.view='result';render()");
  assert(w.document.querySelector('#share'));
  const copy={student:true,stage:'IN SCHOOL',title:'SERVER DIAGNOSIS ON RESTORE',body:'Sanitized diagnosis only.',offer:'No purchase required.',url:'https://booked-af-email-test.fixture.workers.dev/#first-90'};
  const school=JSON.parse(run('JSON.stringify(state.answers)'));let saves=0;
  w.fetch=async(url,options)=>{
   if(!String(url).endsWith('/profile'))return Response.json({ready:true,schemas:['short-v5']});
   const data=JSON.parse(options.body);if(data.action==='save')saves++;
   return Response.json({success:true,profile:{id:'fixture_profile',schema:'short-v5',answers:data.answers||school,done:{},breakdown:data.action==='save'?{...copy,student:false,stage:'BUILDING',title:'SERVER DIAGNOSIS AFTER UPDATE'}:copy}});
  };
  await run("BookedLifecycle.openProfile('a'.repeat(64))");
  assert.match(w.document.querySelector('#app').textContent,/SERVER DIAGNOSIS ON RESTORE/);
  w.document.querySelector('[data-career-update]').click();
  run("state.answers={careerstage:'building'};for(const q of questions){if(state.answers[q.id]===undefined&&(!q.when||q.when(state.answers))){const c=shortChoices(q,state.answers);state.answers[q.id]=q.multi?[c[0][0]]:c[0][0]}}state.view='result';render()");
  for(let n=0;n<100&&!w.document.querySelector('#profile-save-status');n++)await new Promise(r=>setTimeout(r,5));
  assert.equal(saves,1,'diagnosis refresh does not cause a save loop');
  assert.match(w.document.querySelector('#app').textContent,/SERVER DIAGNOSIS AFTER UPDATE/);
  assert.equal(w.document.querySelectorAll('.storage-note').length,1);
  assert.match(JSON.parse(w.sessionStorage.getItem('booked-free-copy')).copy.title,/AFTER UPDATE/);

 }
 assert.deepEqual(errors,[]);dom.window.close();
 }
 console.log('PASS: generated public bundle, public navigation, profile restore and career-stage diagnosis, tampering denied, server-delivered paid bundle and complete intake.');
})().catch(e=>{console.error(e);process.exitCode=1});
