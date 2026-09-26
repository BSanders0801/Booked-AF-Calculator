import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../email-worker.mjs';

const env = {RESEND_API_KEY:'resend_test_only',TURNSTILE_SECRET_KEY:'turnstile_test_only'};

test('Breakdown email signs Bradley and schedules distinct 30, 60, and 90 day rechecks', async () => {
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
    assert.equal(result.followupScheduled60,true);
    assert.equal(result.followupScheduled90,true);
    assert.equal(emails.length,4);

    const immediate = emails[0].body;
    assert.equal(immediate.subject,'Your BOOKED AF Breakdown');
    assert.match(immediate.text,/\nBradley\nBOOKED AF\n/);
    assert.match(immediate.html,/booked-af-logo\.png/);

    const day30 = emails[1].body;
    assert.equal(day30.subject,'30 days later. Are we rich yet?');
    assert.equal(day30.scheduled_at,'in 30 days');
    assert.match(day30.text,/It’s been 30 days since you did your BOOKED AF Breakdown/);
    assert.match(day30.html,/RECHECK MY NUMBERS →/);
    assert.match(String(emails[1].headers['Idempotency-Key']),/-recheck-30d$/);

    const day60 = emails[2].body;
    assert.equal(day60.subject,'60 days in. What actually stuck?');
    assert.equal(day60.scheduled_at,'in 60 days');
    assert.match(day60.text,/By now, something should be getting clearer/);
    assert.match(day60.text,/We’re looking for patterns now/);
    assert.match(day60.html,/CHECK MY 60-DAY NUMBERS →/);
    assert.match(String(emails[2].headers['Idempotency-Key']),/-recheck-60d$/);

    const day90 = emails[3].body;
    assert.equal(day90.subject,'90 days later. Apparently we do quarterly reviews now.');
    assert.equal(day90.scheduled_at,'in 90 days');
    assert.match(day90.text,/Three months is enough time to stop calling everything a fluke/);
    assert.match(day90.text,/Are you busier than you were three months ago\?/);
    assert.doesNotMatch(day90.text,/Did your stage change\?/);
    assert.match(day90.html,/SHOW ME MY 90-DAY NUMBERS →/);
    assert.match(String(emails[3].headers['Idempotency-Key']),/-recheck-90d$/);

    for (const email of [day30,day60,day90]) {
      assert.match(email.text,/\nBradley\nBOOKED AF\n/);
      assert.match(email.html,/booked-af-logo\.png/);
      assert.match(email.html,/https:\/\/bookedandfabulous\.com\/#breakdown/);
    }

    assert.notEqual(day30.subject,day60.subject);
    assert.notEqual(day60.subject,day90.subject);
    assert.notEqual(day30.text,day60.text);
    assert.notEqual(day60.text,day90.text);
  } finally {
    globalThis.fetch = original;
  }
});
