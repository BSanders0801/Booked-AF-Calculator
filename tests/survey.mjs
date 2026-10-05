import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../email-worker.mjs';

const env={STRIPE_SECRET_KEY:'sk_test_only',RESEND_API_KEY:'resend_test_only'};

test('verified purchaser can submit the finalized six-question survey',async()=>{
  const original=globalThis.fetch; let sent;
  globalThis.fetch=async(url,options={})=>{
    if(String(url).startsWith('https://api.stripe.com/v1/checkout/sessions/')) return new Response(JSON.stringify({id:'cs_test_123',status:'complete',payment_status:'paid',currency:'usd',customer_details:{name:'Alex Stylist',email:'alex@example.com'}}),{status:200});
    if(String(url)==='https://api.resend.com/emails'){sent=JSON.parse(options.body);return new Response(JSON.stringify({id:'survey_email'}),{status:200});}
    throw Error('unexpected fetch');
  };
  try{
    const response=await worker.fetch(new Request('https://example.workers.dev/survey',{
      method:'POST',
      headers:{Origin:'https://bookedandfabulous.com','Content-Type':'application/json'},
      body:JSON.stringify({
        session_id:'cs_test_123',
        useful_rating:5,
        ease_rating:4,
        most_useful:'The money section gave me an actual next move.',
        unclear:'I wanted one more example in the schedule section.',
        more:['pricing and money','schedule and boundaries'],
        recommend:'definitely',
        comments:'Keep the voice. Add more money tools.'
      })
    }),env);
    assert.equal(response.status,200);
    assert.deepEqual(await response.json(),{success:true});
    assert.equal(sent.to[0],'hello@bookedandfabulous.com');
    assert.equal(sent.reply_to,'alex@example.com');
    assert.match(sent.subject,/BOOKED AF survey - 5\/5 useful - Alex Stylist/);
    assert.match(sent.text,/The money section gave me an actual next move\./);
    assert.match(sent.text,/Keep the voice\. Add more money tools\./);
  }finally{globalThis.fetch=original}
});

test('survey rejects an unverified purchase',async()=>{
  const original=globalThis.fetch;
  globalThis.fetch=async()=>new Response('not found',{status:404});
  try{
    const response=await worker.fetch(new Request('https://example.workers.dev/survey',{
      method:'POST',
      headers:{Origin:'https://bookedandfabulous.com','Content-Type':'application/json'},
      body:JSON.stringify({
        session_id:'cs_test_bad',
        useful_rating:5,
        ease_rating:4,
        most_useful:'Useful.',
        unclear:'Nothing major.',
        more:['getting more clients'],
        recommend:'probably',
        comments:''
      })
    }),env);
    assert.equal(response.status,403);
  }finally{globalThis.fetch=original}
});
