import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../email-worker.mjs';

const env = {RESEND_API_KEY:'resend_test_only',TURNSTILE_SECRET_KEY:'turnstile_test_only'};

test('Breakdown email signs Bradley and schedules the 30-day recheck with branded CTA', async () => {
  const original = globalThis.fetch;
  const emails = [];
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).includes('challenges.cloudflare.com/turnstile')) {
      return new Response(JSON.stringify({success:true,hostname:'bookedandfabulous.com',action:'booked_email'}),{status:200});
    }
    if (String(url) === 'https://api.resend.com/emails') {
      emails.push({body:JSON.parse(options.body),headers:options.headers});
      return new Response(JSON.stringify({id:'email_'+emails.length}),{status:200});
    }
    throw new Error('Unexpected fetch: '+url);
  };
  const payload = {
    type:'breakdown',
    email:'alex@example.com',
    name:'Alex',
    schema:'short-v1',
    token:'turnstile-token',
    honey:'',
    answers:{
      goal:'clients',
      full:'under25',
      days:'3',
      spend:'150',
      returning:'some',
      costs:'rough',
      visibility:'social',
      marketing:'social',
      network:'local',
      urgency:'month'
    }
  };
  try {
    const request = new Request('https://example.workers.dev/',{
      method:'POST',
      headers:{Origin:'https://bookedandfabulous.com','Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    const response = await worker.fetch(request,env);
    assert.equal(response.status,200);
    const result = await response.json();
    assert.equal(result.success,true);
    assert.equal(result.followupScheduled,true);
    assert.equal(emails.length,2);

    const immediate = emails[0].body;
    assert.equal(immediate.subject,'Your BOOKED AF Breakdown');
    assert.match(immediate.text,/\nBradley\nBOOKED AF\n/);
    assert.match(immediate.html,/booked-af-logo\.png/);

    const followup = emails[1].body;
    assert.equal(followup.subject,'30 days later. Are we rich yet?');
    assert.equal(followup.scheduled_at,'in 30 days');
    assert.match(followup.text,/It’s been 30 days since you did your BOOKED AF Breakdown/);
    assert.match(followup.text,/\nBradley\nBOOKED AF\n/);
    assert.match(followup.html,/RECHECK MY NUMBERS →/);
    assert.match(followup.html,/booked-af-logo\.png/);
    assert.match(followup.html,/https:\/\/bookedandfabulous\.com\/#breakdown/);
    assert.match(String(emails[1].headers['Idempotency-Key']),/-recheck-30d$/);
  } finally {
    globalThis.fetch = original;
  }
});
