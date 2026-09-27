import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../email-worker.mjs';
test('readiness distinguishes email from a complete launch without revealing secrets',async()=>{
 const request=new Request('https://service.test/health',{headers:{Origin:'https://bookedandfabulous.com'}});
 let r=await worker.fetch(request,{});let data=await r.json();assert.equal(data.ready,false);assert.equal(data.launchReady,false);assert.equal(r.headers.get('Access-Control-Allow-Origin'),'https://bookedandfabulous.com');
 r=await worker.fetch(request,{RESEND_API_KEY:'test-mail',TURNSTILE_SECRET_KEY:'test-challenge'});data=await r.json();assert.equal(data.ready,true);assert.equal(data.launchReady,false);assert.equal(data.capabilities.checkout,false);assert(!JSON.stringify(data).includes('test-mail'));
 r=await worker.fetch(request,{RESEND_API_KEY:'test-mail',TURNSTILE_SECRET_KEY:'test-challenge',STRIPE_SECRET_KEY:'test-payment',STRIPE_WEBHOOK_SECRET:'test-webhook',FOLLOWUPS:{}});data=await r.json();assert.equal(data.launchReady,true);
});
test('an invalid purchase identifier never grants access',async()=>{
 const r=await worker.fetch(new Request('https://service.test/verify-checkout?session_id=invalid',{headers:{Origin:'https://bookedandfabulous.com'}}),{});
 assert.equal(r.status,400);assert.equal((await r.json()).paid,false);
});
