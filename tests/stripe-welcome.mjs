import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import worker from '../email-worker.mjs';

const env = {STRIPE_WEBHOOK_SECRET:'whsec_test_only', STRIPE_PAYMENT_LINK_ID:'plink_1UJbGMK8mAQwUniDbDofJPiQ', RESEND_API_KEY:'resend_test_only'};
function request(session, type='checkout.session.completed', signature=true) {
  const body = JSON.stringify({id:'evt_test',type,data:{object:session}});
  const t = Math.floor(Date.now()/1000);
  const digest = createHmac('sha256',env.STRIPE_WEBHOOK_SECRET).update(`${t}.${body}`).digest('hex');
  return new Request('https://example.workers.dev/stripe-webhook',{method:'POST',headers:{'Stripe-Signature':`t=${t},v1=${signature?digest:'0'.repeat(64)}`},body});
}
const paid = {id:'cs_test_123',payment_status:'paid',payment_link:env.STRIPE_PAYMENT_LINK_ID,currency:'usd',amount_total:4900,customer_details:{name:'Alex Stylist',email:'alex@example.com'}};

test('sends one welcome for a verified paid Deep Dive checkout',async()=>{
  const original=globalThis.fetch; let sent;
  globalThis.fetch=async(_url,options)=>{sent=options;return new Response(JSON.stringify({id:'email_123'}),{status:200})};
  try {
    const response=await worker.fetch(request(paid),env);
    assert.equal(response.status,200);
    const body=JSON.parse(sent.body);
    assert.equal(body.to[0],'alex@example.com');
    assert.equal(body.subject,'Welcome to BOOKED AF. Your Deep Dive starts now.');
    assert.match(body.text,/START MY DEEP DIVE: https:\/\/bookedandfabulous.com\/\?deepdive=paid&session_id=cs_test_123/);
    assert.equal(sent.headers['Idempotency-Key'],'booked-deep-dive-cs_test_123');
  } finally {globalThis.fetch=original}
});

test('rejects forged requests and ignores unrelated or unpaid checkouts',async()=>{
  const original=globalThis.fetch; let calls=0;
  globalThis.fetch=async()=>{calls++;throw Error('should not send')};
  try {
    assert.equal((await worker.fetch(request(paid,'checkout.session.completed',false),env)).status,400);
    assert.equal((await worker.fetch(request({...paid,payment_link:'plink_other'}),env)).status,200);
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
