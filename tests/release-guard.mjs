import test from 'node:test';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {buildSecureSite} from '../scripts/build-secure-site.mjs';
await buildSecureSite(resolve('.website-preview'),resolve('.private-assets'));
const {default:worker}=await import('../secure-api-worker.mjs');
test('release entrypoint fails closed without a live key and durable fulfillment, rejects test credentials',async()=>{
 for(const path of ['/paid-content','/verify-checkout','/stripe-webhook'])for(const env of [{},{STRIPE_SECRET_KEY:'sk_test_fixture',FULFILLMENT:{}},{STRIPE_SECRET_KEY:'sk_live_fixture'}])
  assert.equal((await worker.fetch(new Request('https://service.invalid'+path),env)).status,503);
 const env={STRIPE_SECRET_KEY:'sk_live_fixture',FULFILLMENT:{}};
 assert.equal((await worker.fetch(new Request('https://service.invalid/paid-content',{method:'POST',headers:{Authorization:'Bearer cs_test_fixture'}}),env)).status,401);
 assert.equal((await worker.fetch(new Request('https://service.invalid/verify-checkout?session_id=cs_test_fixture'),env)).status,400);
});
