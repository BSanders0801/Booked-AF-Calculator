import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveTestAccount} from '../scripts/test-cloudflare-account.mjs';
const id = 'abcdef0123456789abcdef0123456789';
const subdomain = 'wild-recipe-42df';
test('account formatting is normalized without exposing values or listing accounts', async () => {
  for (const raw of [` ${id.toUpperCase()}\n`, `https://dash.cloudflare.com/${id}/workers-and-pages`]) {
    const requests=[];
    const result=await resolveTestAccount(raw, async path=>{requests.push(path);return {result:{subdomain}};});
    assert.deepEqual(result,{id,subdomain,recovered:true});
    assert.deepEqual(requests,[`/accounts/${id}/workers/subdomain`]);
  }
});
test('a malformed ID recovers only the single token-visible account with the approved host', async () => {
  const requests=[];
  const result=await resolveTestAccount('incomplete',async path=>{
    requests.push(path);
    return path==='/accounts?per_page=50' ? {result:[{id}],result_info:{total_count:1,total_pages:1}} : {result:{subdomain}};
  });
  assert.equal(result.id,id);
  assert.deepEqual(requests,['/accounts?per_page=50',`/accounts/${id}/workers/subdomain`]);
});
test('ambiguous, paginated, invalid and wrong-account results stop', async () => {
  for (const result of [[],[{id},{id}], [{id:'invalid'}]])
    await assert.rejects(resolveTestAccount('incomplete',async()=>({result})),/unambiguously/);
  await assert.rejects(resolveTestAccount('incomplete',async()=>({result:[{id}],result_info:{total_pages:2}})),/unambiguously/);
  await assert.rejects(resolveTestAccount(id,async()=>({result:{subdomain:'unrelated'}})),/does not match/);
});
