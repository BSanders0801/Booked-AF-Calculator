import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createContext,runInContext} from 'node:vm';
import {buildTestWorker} from '../scripts/build-test-worker.mjs';
const origin='https://booked-af-email-test.fixture.workers.dev';
await buildTestWorker({origin,checkoutUrl:'https://buy.stripe.com/test_fixture',paymentLinkId:'plink_fixture'});
const {default:worker,TestLifecycle}=await import('../test-worker.mjs');
const core=createContext({});runInContext(await readFile(new URL('../breakdown-core.js',import.meta.url),'utf8')+';globalThis.complete=stage=>{const a={careerstage:stage};for(const q of shortQuestions){if(a[q.id]===undefined&&(!q.when||q.when(a))){const c=shortChoices(q,a);a[q.id]=q.multi?[c[0][0]]:c[0][0]}}return a}',core);
const env={BOOKED_AF_TEST_MARKER:'booked-af-isolated-test',STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_WEBHOOK_SECRET:'whsec_fixture',RESEND_API_KEY:'fixture',TEST_RECIPIENT_EMAIL:'recipient@example.invalid'};
const req=(path,data,requestOrigin=origin)=>new Request(origin+path,{method:'POST',headers:{Origin:requestOrigin,'Content-Type':'application/json'},body:JSON.stringify(data)});
function setup(){
 const entries=new Map(),pending=[];let queue=Promise.resolve();
 const ctx={storage:{get:async k=>entries.get(k),put:async(k,v)=>entries.set(k,v),delete:async k=>entries.delete(k),list:async({prefix})=>new Map([...entries].filter(([k])=>k.startsWith(prefix)))},waitUntil:p=>pending.push(p),blockConcurrencyWhile:fn=>{const next=queue.then(fn);queue=next.catch(()=>{});return next;}};
 const obj=new TestLifecycle(ctx,env);
 return {entries,pending,testEnv:{...env,TEST_LIFECYCLE:{idFromName:n=>n,get:()=>obj}},obj};
}
test('isolated profile survives reopen and stage change, restores server clarity without paid material, and expires private access',async()=>{
 const old=globalThis.fetch,{entries,pending,testEnv,obj}=setup(),sent=[];
 globalThis.fetch=async(url,options)=>{if(String(url).includes('turnstile'))return Response.json({success:true});sent.push(JSON.parse(options.body));return Response.json({id:'fixture_email'});};
 try{
  const answers=core.complete('school');
  const lead={schema:'short-v5',type:'breakdown',email:env.TEST_RECIPIENT_EMAIL,name:'Test',token:'XXXX.DUMMY.TOKEN.XXXX',answers};
  const response=await worker.fetch(req('/lead-test',lead),testEnv);assert.equal(response.status,200);const result=await response.json();
  assert(!JSON.stringify(result).includes('profile-access'));
  const token=sent[0].text.match(/#resume-profile\/([a-f0-9]{64})/)[1];
  let r=await worker.fetch(req('/profile',{action:'open',token}),testEnv);let p=(await r.json()).profile;
  assert.equal(p.careerStatus,'school');assert.deepEqual(p.breakdown,result.breakdown);
  for(const key of ['plan','steps','scripts','tools','calculations'])assert.equal(p.breakdown[key],undefined);
  const profileId=p.id;
  r=await worker.fetch(req('/profile',{action:'save',token,answers:core.complete('building'),done:{injected:true}}),testEnv);p=(await r.json()).profile;
  assert.equal(p.id,profileId);assert.equal(p.careerStatus,'building');assert.deepEqual(p.done,{});
  r=await worker.fetch(req('/profile',{action:'open',token}),testEnv);assert.equal((await r.json()).profile.careerStatus,'building');
  assert.equal((await worker.fetch(req('/profile',{action:'open',token:'0'.repeat(64)}),testEnv)).status,401);
  assert.equal((await worker.fetch(req('/profile',{action:'open',token},'https://bookedandfabulous.com'),testEnv)).status,403);
  assert.equal((await worker.fetch(req('/lead-test',{...lead,email:'other@example.invalid'}),testEnv)).status,403);
  await Promise.all(pending);
  for(const [key,value] of entries)if(key.startsWith('profile-access:'))value.expires=1;
  assert.equal((await obj.fetch(req('/profile',{action:'open',token}))).status,401);
  const bad=new TestLifecycle({storage:{}},{...env,FOLLOWUPS:{}});assert.equal((await bad.fetch(req('/profile',{}))).status,503);
 }finally{globalThis.fetch=old;}
});
test('isolated survey accepts approved test purchase only and keeps all mail inside the approved inbox',async()=>{
 const old=globalThis.fetch;let count=0;
 let session={id:'cs_test_fixture',livemode:false,status:'complete',mode:'payment',amount_subtotal:4900,amount_total:0,payment_status:'no_payment_required',currency:'usd',payment_link:'plink_fixture',customer_details:{email:env.TEST_RECIPIENT_EMAIL}};
 globalThis.fetch=async(url,options)=>{if(String(url).includes('api.stripe.com'))return Response.json(session);const email=JSON.parse(options.body);assert.deepEqual(email.to,[env.TEST_RECIPIENT_EMAIL]);count++;return Response.json({id:'survey_fixture'});};
 const data={session_id:'cs_test_fixture',rating:5,ease:'pretty easy',useful:'using it',more:['making more money'],recommend:'probably',comments:'Isolated QA'};
 try{
  assert.equal((await worker.fetch(req('/survey',data),env)).status,200);
  assert.equal((await worker.fetch(req('/survey',{...data,more:[]}),env)).status,200,'topics are optional');
  assert.equal((await worker.fetch(req('/survey',{...data,more:['unknown']}),env)).status,400,'supplied topics must remain valid');
  for(const variant of [{livemode:true},{payment_link:'plink_other'},{payment_status:'unpaid'},{customer_details:{email:'other@example.invalid'}}]){const prior=session;session={...session,...variant};assert.equal((await worker.fetch(req('/survey',data),env)).status,403);session=prior;}
  assert.equal(count,2);
 }finally{globalThis.fetch=old;}
});
