import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {buildTestWorker,validateTestBuild} from '../scripts/build-test-worker.mjs';
const origin='https://booked-af-email-test.fixture.workers.dev';
const config={origin,checkoutUrl:'https://buy.stripe.com/test_fixture',paymentLinkId:'plink_fixture'};
const originals=['email-worker.mjs','wrangler.jsonc','app.js','site-ui.js'];
const before=await Promise.all(originals.map(f=>readFile(new URL('../'+f,import.meta.url),'utf8')));
await buildTestWorker(config);
const {default:worker}=await import('../test-worker.mjs');
const env={BOOKED_AF_TEST_MARKER:'booked-af-isolated-test',STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_WEBHOOK_SECRET:'whsec_fixture',RESEND_API_KEY:'fixture',TEST_RECIPIENT_EMAIL:'recipient@example.invalid',ASSETS:{fetch:async()=>new Response('test assets')}};
const paid={id:'cs_test_fixture',livemode:false,status:'complete',mode:'payment',amount_subtotal:4900,amount_total:4900,currency:'usd',payment_status:'paid',payment_link:'plink_fixture',created:Math.floor(Date.now()/1000),customer_details:{email:env.TEST_RECIPIENT_EMAIL,name:'Test'}};
function webhook(session=paid, overrides={}) {
  const body=JSON.stringify({id:'evt_fixture',livemode:false,type:'checkout.session.completed',data:{object:session},...overrides});
  const t=Math.floor(Date.now()/1000),sig=createHmac('sha256',env.STRIPE_WEBHOOK_SECRET).update(t+'.'+body).digest('hex');
  return new Request(origin+'/stripe-webhook',{method:'POST',headers:{'Stripe-Signature':`t=${t},v1=${sig}`},body});
}
const verify=(id='cs_test_fixture',extra={})=>new Request(origin+'/verify-checkout?session_id='+id,extra);

test('test build rejects production destinations and preserves production sources',async()=>{
  assert.throws(()=>validateTestBuild({...config,origin:'https://bookedandfabulous.com'}));
  assert.throws(()=>validateTestBuild({...config,checkoutUrl:'https://buy.stripe.com/livefixture'}));
  assert.deepEqual(await Promise.all(originals.map(f=>readFile(new URL('../'+f,import.meta.url),'utf8'))),before);
  for (const f of ['app.js','site-ui.js','index.html']) {
    const text=await readFile(new URL('../.test-website/'+f,import.meta.url),'utf8');
    assert.doesNotMatch(text,/https:\/\/bookedandfabulous\.com|https:\/\/booked-af-email\./);
  }
  const ui=await readFile(new URL('../.test-website/site-ui.js',import.meta.url),'utf8');
  assert.match(ui,/const preview = false;/);
  assert.match(ui,/const previewHost = false;/);
});

test('test Worker fails closed for live keys, production host and unexpected bindings',async()=>{
  assert.equal((await worker.fetch(verify(),{...env,STRIPE_SECRET_KEY:'sk_live_fixture'})).status,503);
  assert.equal((await worker.fetch(verify(),{...env,FOLLOWUPS:{}})).status,503);
  assert.equal((await worker.fetch(new Request('https://booked-af-email.fixture.workers.dev/'),env)).status,403);
  assert.equal((await worker.fetch(verify('cs_live_fixture'),env)).status,400);
  assert.equal((await worker.fetch(verify('cs_test_fixture',{headers:{Origin:'https://bookedandfabulous.com'}}),env)).status,403);
  assert.equal((await worker.fetch(new Request(origin+'/profile',{method:'POST'}),env)).status,404);
});

test('full-price and zero-cost test sessions verify; live, unpaid and unrelated ones cannot',async()=>{
  const original=globalThis.fetch;
  try {
    for (const session of [paid,{...paid,amount_total:0,payment_status:'no_payment_required'}]) {
      globalThis.fetch=async(url,options)=>{
        assert.match(String(url),/^https:\/\/api\.stripe\.com\/v1\/checkout\/sessions\/cs_test_/);
        assert.match(options.headers.Authorization,/Bearer sk_test_/);
        return Response.json(session);
      };
      assert.equal((await (await worker.fetch(verify(),env)).json()).paid,true);
    }
    for(const session of [{...paid,livemode:true},{...paid,payment_link:'plink_unrelated'},{...paid,payment_status:'unpaid'},{...paid,status:'open'}]) {
      globalThis.fetch=async()=>Response.json(session);
      assert.equal((await (await worker.fetch(verify(),env)).json()).paid,false);
    }
  } finally {globalThis.fetch=original;}
});

test('signed full-price and BETA100-shaped events use isolated welcome and survey links',async()=>{
  const original=globalThis.fetch, sent=[];
  globalThis.fetch=async(url,options)=>{assert.equal(String(url),'https://api.resend.com/emails');sent.push(JSON.parse(options.body));return Response.json({id:'mail_fixture'});};
  try {
    for(const session of [paid,{...paid,id:'cs_test_zero',amount_total:0,payment_status:'no_payment_required'}])
      assert.equal((await worker.fetch(webhook(session),env)).status,200);
    assert.equal(sent.length,4);
    for(const email of sent){assert.deepEqual(email.to,[env.TEST_RECIPIENT_EMAIL]);assert.doesNotMatch(email.text+email.html,/https:\/\/bookedandfabulous\.com/);assert.match(email.text,/booked-af-email-test\.fixture\.workers\.dev/);}
    assert.equal(sent.filter(x=>x.scheduled_at==='in 14 days').length,2);
  } finally {globalThis.fetch=original;}
});

test('live events, unpaid and unrelated sessions, forged signatures and other recipients send nothing',async()=>{
  const original=globalThis.fetch;let calls=0;
  globalThis.fetch=async()=>{calls++;throw Error('unexpected outbound send');};
  try {
    for(const req of [webhook(paid,{livemode:true}),webhook({...paid,livemode:true}),webhook({...paid,payment_link:'plink_unrelated'}),webhook({...paid,payment_status:'unpaid'})])
      assert.equal((await worker.fetch(req,env)).status,200);
    assert.equal((await worker.fetch(webhook({...paid,customer_details:{email:'other@example.invalid'}}),env)).status,403);
    const forged=webhook();forged.headers.set('Stripe-Signature','bad');
    assert.equal((await worker.fetch(forged,env)).status,400);
    assert.equal(calls,0);
  } finally {globalThis.fetch=original;}
});

test('survey and welcome failures are retryable; duplicate attempts keep provider idempotency keys',async()=>{
  const original=globalThis.fetch, keys=[];let failSurvey=true,failWelcome=false;
  globalThis.fetch=async(url,options)=>{
    const body=JSON.parse(options.body);keys.push(options.headers['Idempotency-Key']);
    if ((body.scheduled_at && failSurvey)||(!body.scheduled_at && failWelcome))return new Response('failure',{status:503});
    return Response.json({id:'mail_fixture'});
  };
  try {
    assert.equal((await worker.fetch(webhook(),env)).status,502);
    failSurvey=false;failWelcome=true;
    assert.equal((await worker.fetch(webhook(),env)).status,502);
    failWelcome=false;
    assert.equal((await worker.fetch(webhook(),env)).status,200);
    assert.equal((await worker.fetch(webhook(),env)).status,200);
    assert.equal(new Set(keys).size,2);
  } finally {globalThis.fetch=original;}
});
