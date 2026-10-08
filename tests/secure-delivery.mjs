import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHmac} from 'node:crypto';
import {buildTestWorker} from '../scripts/build-test-worker.mjs';
const origin='https://booked-af-email-test.fixture.workers.dev';
await buildTestWorker({origin,checkoutUrl:'https://buy.stripe.com/test_fixture',paymentLinkId:'plink_fixture'});
const {default:worker,TestPurchaseFulfillment}=await import('../test-worker.mjs');
const env={BOOKED_AF_TEST_MARKER:'booked-af-isolated-test',STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_WEBHOOK_SECRET:'whsec_fixture',RESEND_API_KEY:'fixture',TEST_RECIPIENT_EMAIL:'recipient@example.invalid',ASSETS:{fetch:async()=>new Response('missing',{status:404})}};
const paid={id:'cs_test_fixture',livemode:false,status:'complete',mode:'payment',amount_subtotal:4900,amount_total:4900,currency:'usd',payment_status:'paid',payment_link:'plink_fixture',created:Math.floor(Date.now()/1000),customer_details:{email:env.TEST_RECIPIENT_EMAIL,name:'Test'}};
const request=(id='cs_test_fixture',extra={})=>new Request(origin+'/paid-content',{method:'POST',headers:{Authorization:'Bearer '+id,Origin:origin},...extra});

test('public package contains no paid modules, hidden recipe data or implementation source',async()=>{
 const files=await readdir(new URL('../.test-website/',import.meta.url));
 assert(!files.some(f=>/next30-|day-math|email-worker|review|private/.test(f)));
 const all=(await Promise.all(files.filter(f=>/\.(js|html)$/.test(f)).map(f=>readFile(new URL('../.test-website/'+f,import.meta.url),'utf8')))).join('\n');
 for(const marker of ['STEAL THESE WORDS','function empResult','function selfResult','const recipes=','const planMap=','MAKE ONE SPECIFIC INVITATION','services.map(','id="mmm-pay-type"','function deepRead','const formsLibrary=','const deepQuestions='])assert(!all.includes(marker),marker);
 const privateBundle=await readFile(new URL('../.test-worker/paid-bundle.mjs',import.meta.url),'utf8');
 assert(privateBundle.includes('function empResult'));
});
test('server denies missing, forged, foreign, unpaid, unrelated, expired and live access; authorized deliveries are private',async()=>{
 const old=globalThis.fetch;let session=paid;
 globalThis.fetch=async()=>Response.json(session);
 try{
  assert.equal((await worker.fetch(request('',{headers:{}}),env)).status,401);
  assert.equal((await worker.fetch(request('cs_live_fake'),env)).status,403);
  assert.equal((await worker.fetch(request('cs_test_fixture',{headers:{Origin:'https://evil.test',Authorization:'Bearer cs_test_fixture'}}),env)).status,403);
  for(const variant of [{payment_status:'unpaid'},{status:'open'},{payment_link:'plink_other'},{livemode:true},{created:1791097200}]){
   session={...paid,...variant};
   const clock=Date.now; if(variant.created)Date.now=()=>1791097200000+366*86400000;
   try{assert.equal((await worker.fetch(request(),env)).status,403);}finally{Date.now=clock;}
  }
  for(const variant of [{},{amount_total:2450},{amount_total:0,payment_status:'no_payment_required'}]){
   session={...paid,...variant};const r=await worker.fetch(request(),env);assert.equal(r.status,200);assert.match(r.headers.get('Cache-Control'),/private, no-store/);assert.match(await r.text(),/function empResult/);
  }
  globalThis.fetch=async()=>new Response('failure',{status:503});assert.equal((await worker.fetch(request(),env)).status,503);
  for(const path of ['/next30-core.js','/next30-shell.js','/.test-worker/paid-bundle.mjs','/preview/app.js','/email-worker.mjs','/review/BOOKED_AF_Redesign_Preview.html'])assert.equal((await worker.fetch(new Request(origin+path),env)).status,404);
 }finally{globalThis.fetch=old;}
});
test('durable fulfillment serializes concurrent events and preserves successful stages through retry and late replay',async()=>{
 const old=globalThis.fetch,store=new Map();let tail=Promise.resolve(),surveyCalls=0,welcomeCalls=0,fail=true;
 const ctx={storage:{get:async k=>store.get(k),put:async(k,v)=>{store.set(k,v)}},blockConcurrencyWhile:fn=>{const p=tail.then(fn);tail=p.catch(()=>{});return p}};
 const obj=new TestPurchaseFulfillment(ctx,env);
 const hook=()=>{const body=JSON.stringify({id:'evt_fixture',livemode:false,type:'checkout.session.completed',data:{object:paid}}),t=Math.floor(Date.now()/1000),sig=createHmac('sha256',env.STRIPE_WEBHOOK_SECRET).update(t+'.'+body).digest('hex');return new Request(origin+'/stripe-webhook',{method:'POST',headers:{'Stripe-Signature':`t=${t},v1=${sig}`},body});};
 globalThis.fetch=async(url,opts)=>{const b=JSON.parse(opts.body);if(b.scheduled_at)surveyCalls++;else{welcomeCalls++;if(fail)return new Response('failure',{status:503})}return Response.json({id:'mail_fixture'});};
 try{
  assert.equal((await obj.fetch(hook())).status,502);assert.equal(surveyCalls,1);
  fail=false;for(const r of await Promise.all([obj.fetch(hook()),obj.fetch(hook())]))assert.equal(r.status,200);
  assert.equal(surveyCalls,1);assert.equal(welcomeCalls,2);
  const now=Date.now;Date.now=()=>now()+3*86400000;
  try{assert.equal((await obj.fetch(hook())).status,200);}finally{Date.now=now;}
  assert.equal(welcomeCalls,2);assert.equal(surveyCalls,1);
 }finally{globalThis.fetch=old;}
});

test('isolated free form uses test verification and only the approved recipient; returns clarity only',async()=>{
 const {createContext,runInContext}=await import('node:vm');
 const context=createContext({});runInContext(await readFile(new URL('../breakdown-core.js',import.meta.url),'utf8')+';globalThis.fill=()=>{const a={careerstage:"building"};for(const q of shortQuestions){if(a[q.id]===undefined&&(!q.when||q.when(a))){const c=shortChoices(q,a);a[q.id]=q.multi?[c[0][0]]:c[0][0]}}return a}',context);
 const data={schema:'short-v5',type:'breakdown',email:env.TEST_RECIPIENT_EMAIL,name:'Test',token:'XXXX.DUMMY.TOKEN.XXXX',answers:context.fill()};
 const req=body=>new Request(origin+'/lead-test',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
 const old=globalThis.fetch,sent=[];
 globalThis.fetch=async(url,opts)=>{if(String(url).includes('turnstile')){assert.equal(JSON.parse(opts.body).secret,'1x0000000000000000000000000000000AA');return Response.json({success:true,hostname:'example.com',metadata:{result_with_testing_key:true}});}sent.push(JSON.parse(opts.body));return Response.json({id:'mail_fixture'});};
 try{
  assert.equal((await worker.fetch(req({...data,email:'not-approved@example.invalid'}),env)).status,403);
  assert.equal((await worker.fetch(req({...data,token:'not-a-dummy-token'}),env)).status,403);
  const r=await worker.fetch(req(data),env);assert.equal(r.status,200);const body=await r.json();assert.equal(body.success,true);assert(body.breakdown.title);assert(!body.breakdown.plan);
  assert(sent.length>0);for(const email of sent){assert.deepEqual(email.to,[env.TEST_RECIPIENT_EMAIL]);assert.equal(email.bcc,undefined);assert.doesNotMatch(email.text,/DO THESE 3 THINGS|MONTHLY MONEY MAP|STEAL THESE WORDS/);}
 }finally{globalThis.fetch=old;}
});
