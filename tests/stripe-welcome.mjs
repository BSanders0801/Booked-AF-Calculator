import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import worker from '../email-worker.mjs';

const env = {STRIPE_WEBHOOK_SECRET:'whsec_test_only', STRIPE_PAYMENT_LINK_ID:'plink_1UJsjEK8mAQwUniDH9v9XShT', RESEND_API_KEY:'resend_test_only'};
function request(session, type='checkout.session.completed', signature=true) {
  const body = JSON.stringify({id:'evt_test',type,data:{object:session}});
  const t = Math.floor(Date.now()/1000);
  const digest = createHmac('sha256',env.STRIPE_WEBHOOK_SECRET).update(`${t}.${body}`).digest('hex');
  return new Request('https://example.workers.dev/stripe-webhook',{method:'POST',headers:{'Stripe-Signature':`t=${t},v1=${signature?digest:'0'.repeat(64)}`},body});
}
const paid = {id:'cs_test_123',status:'complete',mode:'payment',amount_subtotal:4900,payment_status:'paid',payment_link:'plink_1UJsjEK8mAQwUniDH9v9XShT',currency:'usd',amount_total:4900,customer_details:{name:'Alex Stylist',email:'alex@example.com'}};

test('verified Your Next 30 checkout sends welcome and schedules Day 14 survey',async()=>{
  const original=globalThis.fetch; const sent=[];
  globalThis.fetch=async(url,options)=>{
    if(String(url)==='https://api.resend.com/emails'){sent.push({body:JSON.parse(options.body),headers:options.headers});return new Response(JSON.stringify({id:'email_'+sent.length}),{status:200});}
    throw Error('unexpected fetch');
  };
  try {
    const response=await worker.fetch(request(paid),env);
    assert.equal(response.status,200);
    assert.equal(sent.length,2);
    const survey=sent.find(x=>x.body.subject==='You paid us. Did we earn it?').body;
    assert.equal(survey.scheduled_at,'in 14 days');
    assert.match(survey.text,/Six questions. About two minutes/);
    assert.match(survey.html,/TELL US WHAT YOU THINK →/);
    assert.match(survey.html,/session_id=cs_test_123/);
    const welcome=sent.find(x=>x.body.subject==='You’re in. Let’s make some moves.').body;
    assert.equal(welcome.to[0],'alex@example.com');
    assert.match(welcome.text,/START MY NEXT 30: https:\/\/bookedandfabulous.com\/\?next30=paid&session_id=cs_test_123/);
  } finally {globalThis.fetch=original}
});

test('grandfathers the old Your Next 30 payment link during checkout migration',async()=>{
  const original=globalThis.fetch; const sent=[];
  globalThis.fetch=async(url,options)=>{if(String(url)==='https://api.resend.com/emails'){sent.push(JSON.parse(options.body));return new Response(JSON.stringify({id:'email_'+sent.length}),{status:200});}throw Error('unexpected fetch');};
  try {
    const legacy={...paid,id:'cs_test_legacy',payment_link:'plink_1UJbGMK8mAQwUniDbDofJPiQ'};
    const response=await worker.fetch(request(legacy),env);
    assert.equal(response.status,200);
    assert(sent.some(x=>x.subject==='You’re in. Let’s make some moves.'));
  } finally {globalThis.fetch=original}
});

test('other paid Stripe checkouts still get the Day 14 survey',async()=>{
  const original=globalThis.fetch; const sent=[];
  globalThis.fetch=async(url,options)=>{sent.push(JSON.parse(options.body));return new Response(JSON.stringify({id:'email_1'}),{status:200})};
  try {
    const response=await worker.fetch(request({...paid,id:'cs_test_other',payment_link:'plink_other',amount_total:9900}),env);
    assert.equal(response.status,200);
    assert.equal(sent.length,1);
    assert.equal(sent[0].subject,'You paid us. Did we earn it?');
    assert.equal(sent[0].scheduled_at,'in 14 days');
  } finally {globalThis.fetch=original}
});

test('rejects forged requests and ignores unpaid checkouts',async()=>{
  const original=globalThis.fetch; let calls=0;
  globalThis.fetch=async()=>{calls++;throw Error('should not send')};
  try {
    assert.equal((await worker.fetch(request(paid,'checkout.session.completed',false),env)).status,400);
    assert.equal((await worker.fetch(request({...paid,payment_status:'unpaid'}),env)).status,200);
    assert.equal(calls,0);
  } finally {globalThis.fetch=original}
});

test('only unlocks the paid product after Stripe confirms the exact checkout',async()=>{
  const original=globalThis.fetch;
  const authorized={...paid,status:'complete'};
  globalThis.fetch=async()=>new Response(JSON.stringify(authorized),{status:200});
  const visit=(id,origin='https://bookedandfabulous.com')=>worker.fetch(new Request('https://example.workers.dev/verify-checkout?session_id='+id,{headers:{Origin:origin}}),{...env,STRIPE_SECRET_KEY:'sk_test_only'});
  try {
    assert.deepEqual(await (await visit('cs_test_123')).json(),{paid:true});
    authorized.payment_link='plink_other';
    assert.deepEqual(await (await visit('cs_test_123')).json(),{paid:false});
    assert.equal((await visit('cs_test_123','https://other.example')).status,403);
    assert.equal((await visit('not-a-session')).status,400);
  } finally {globalThis.fetch=original}
});

test('FIRST 90 conversion hook records only the configured signed $29 purchase',async()=>{
 const events=[];const e={...env,FIRST90_PAYMENT_LINK_ID:'plink_future_first90',FOLLOWUPS:{async put(k,v){events.push({k,v:JSON.parse(v)});}}};
 const session={...paid,id:'cs_test_future90',payment_link:e.FIRST90_PAYMENT_LINK_ID,amount_total:2900};
 const r=await worker.fetch(request(session),e);assert.equal(r.status,200);assert.equal(events.length,1);assert.equal(events[0].v.event,'first90_conversion');
 assert.equal((await worker.fetch(request(session,'checkout.session.completed',false),e)).status,400);assert.equal(events.length,1);
});


test('discounted and no-cost approved checkouts unlock and receive welcome; incomplete and unrelated sessions do not',async()=>{
 const original=globalThis.fetch;let current,sent=[];
 globalThis.fetch=async(url,options={})=>{
  if(String(url).startsWith('https://api.stripe.com/v1/checkout/sessions/'))return new Response(JSON.stringify(current),{status:200});
  if(String(url)==='https://api.resend.com/emails'){sent.push({body:JSON.parse(options.body),headers:options.headers});return new Response(JSON.stringify({id:'email_'+sent.length}),{status:200})}
  throw Error('unexpected fetch');
 };
 const check=()=>worker.fetch(new Request('https://service.test/verify-checkout?session_id=cs_test_discount',{headers:{Origin:'https://bookedandfabulous.com'}}),{...env,STRIPE_SECRET_KEY:'sk_test_only'});
 try{
  for(const variant of [{amount_total:2450},{amount_total:0,payment_status:'no_payment_required'},{amount_total:5300}]){
   current={...paid,id:'cs_test_discount',...variant};sent=[];assert.equal((await(await check()).json()).paid,true);
   assert.equal((await worker.fetch(request(current),env)).status,200);assert(sent.some(x=>x.body.subject==='You’re in. Let’s make some moves.'));assert(sent.some(x=>x.body.scheduled_at==='in 14 days'));assert(sent.some(x=>x.headers['Idempotency-Key']==='booked-next30-cs_test_discount'));
  }
  for(const variant of [{payment_status:'unpaid'},{status:'open'},{mode:'subscription'},{currency:'eur'},{amount_subtotal:3900},{amount_subtotal:undefined},{payment_link:'plink_other'},{payment_status:'no_payment_required',amount_total:100},{amount_total:-1}]){
   current={...paid,...variant};sent=[];assert.equal((await(await check()).json()).paid,false);await worker.fetch(request(current),env);assert(!sent.some(x=>x.body.subject==='You’re in. Let’s make some moves.'));
  }
  current={...paid,amount_total:0,payment_status:'no_payment_required'};sent=[];assert.equal((await worker.fetch(request(current,'checkout.session.completed',false),env)).status,400);assert.equal(sent.length,0);
  sent=[];assert.equal((await worker.fetch(request(paid,'checkout.session.async_payment_succeeded'),env)).status,200);assert(sent.some(x=>x.body.subject==='You’re in. Let’s make some moves.'));
 }finally{globalThis.fetch=original}
});

test('welcome delivery failure stays retryable instead of acknowledging fulfillment',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async(url,options)=>JSON.parse(options.body).subject==='You’re in. Let’s make some moves.'?new Response('delivery failed',{status:503}):new Response(JSON.stringify({id:'survey_scheduled'}));
 try{assert.equal((await worker.fetch(request(paid),env)).status,502)}finally{globalThis.fetch=original}
});
