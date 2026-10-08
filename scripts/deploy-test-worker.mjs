// The only deploy target in this program is booked-af-email-test.
// Provider identifiers and credentials stay in memory; never print API responses.
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {resolveTestAccount} from './test-cloudflare-account.mjs';
const root = resolve(import.meta.dirname, '..');
const target = 'booked-af-email-test';
const marker = 'booked-af-isolated-test';
const names = ['CLOUDFLARE_API_TOKEN','CLOUDFLARE_ACCOUNT_ID','STRIPE_TEST_SECRET_KEY','RESEND_TEST_API_KEY','TEST_RECIPIENT_EMAIL'];
const missing = names.filter(name => !process.env[name]);
for (const name of names) console.log(`${name}: ${process.env[name] ? 'present' : 'missing'}`);
if (missing.length) { console.error('Add the missing encrypted GitHub Actions secrets. No provider changes made.'); process.exit(1); }
if (!/^(?:sk|rk)_test_/.test(process.env.STRIPE_TEST_SECRET_KEY)) throw Error('Refusing a non-test Stripe key.');
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.TEST_RECIPIENT_EMAIL)) throw Error('An expressly approved test recipient is required.');
const config = JSON.parse((await readFile(resolve(root,'wrangler.test.jsonc'),'utf8')).replace(/^\s*\/\/.*$/gm,''));
if (config.name !== target || config.main !== 'test-worker.mjs' || config.routes?.length || config.kv_namespaces || config.env ||
    config.assets?.directory !== './.test-website' || config.assets?.binding !== 'ASSETS' || config.assets?.run_worker_first !== true ||
    config.build?.command !== 'node scripts/build-test-worker.mjs' || config.vars?.BOOKED_AF_TEST_MARKER !== marker ||
    Object.keys(config).some(k=>!['name','main','compatibility_date','workers_dev','keep_vars','build','assets','routes','vars','previews','durable_objects','migrations'].includes(k)) ||
    Object.keys(config.vars).length !== 1 || JSON.stringify(config.durable_objects)!==JSON.stringify({bindings:[{name:'FULFILLMENT',class_name:'TestPurchaseFulfillment'}]}) || JSON.stringify(config.migrations)!==JSON.stringify([{tag:'test-fulfillment-v1',new_sqlite_classes:['TestPurchaseFulfillment']}])) throw Error('Unsafe test configuration.');
if (process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REF !== 'refs/heads/build/next30-shell-p04') throw Error('Wrong deployment branch.');

async function api(base, path, token, params, allowMissing=false) {
  const options = {headers:{Authorization:`Bearer ${token}`}, signal:AbortSignal.timeout(20000)};
  if (params) { options.method='POST'; options.body=new URLSearchParams(params); }
  const r = await fetch(base+path, options);
  if (allowMissing && r.status === 404) return null;
  if (!r.ok) throw Error(`Provider request failed (${r.status}); response withheld to protect private data.`);
  const data = await r.json();
  if (data.success === false) throw Error('Cloudflare rejected the request; response withheld.');
  return data;
}
const cfToken=process.env.CLOUDFLARE_API_TOKEN, stripeToken=process.env.STRIPE_TEST_SECRET_KEY;
const resolvedAccount=await resolveTestAccount(process.env.CLOUDFLARE_ACCOUNT_ID,
  path=>api('https://api.cloudflare.com/client/v4',path,cfToken));
process.env.CLOUDFLARE_ACCOUNT_ID=resolvedAccount.id;
console.log(resolvedAccount.recovered ? 'Cloudflare account metadata recovered and verified privately.' : 'Cloudflare account and token verified.');
if (process.argv.includes('--check')) { console.log('Credentials and isolated configuration checked using read-only Cloudflare requests; no provider changes made.'); process.exit(0); }
if (process.env.BOOKED_AF_TEST_DEPLOY_ENABLED !== 'true') throw Error('Test deployment is not enabled. No provider changes made.');
const account='/accounts/'+resolvedAccount.id;
const cf=(path,allowMissing=false)=>api('https://api.cloudflare.com/client/v4',account+path,cfToken,undefined,allowMissing);
const stripe=(path,params)=>api('https://api.stripe.com',path,stripeToken,params);
const subdomain=resolvedAccount.subdomain;
const origin=`https://${target}.${subdomain}.workers.dev`;
const settings=(await cf(`/workers/scripts/${target}/settings`,true))?.result;
if (settings && (!settings.bindings?.some(b=>b.name==='BOOKED_AF_TEST_MARKER' && b.type==='plain_text' && b.text===marker) ||
    (settings.bindings || []).some(b => !['secret_text','plain_text','assets'].includes(b.type) && !(b.type==='durable_object_namespace' && b.name==='FULFILLMENT' && b.class_name==='TestPurchaseFulfillment' && (!b.script_name || b.script_name===target)))))
  throw Error('Existing target has not been identified as our isolated test Worker. Stop for review.');
const domainResult=await cf('/workers/domains?service='+target);
const domains=domainResult.result;
if (!Array.isArray(domains) || domains.length || (domainResult.result_info?.total_count || 0)>0)
  throw Error('Cannot prove the test Worker has no custom domain. Stop for review.');

const links=await stripe('/v1/payment_links?limit=100');
if (links.has_more) throw Error('Too many test Payment Links to identify the intended offer safely.');
const matches=[];
for (const link of links.data || []) {
  if (link.livemode !== false || !link.active) continue;
  const items=await stripe('/v1/payment_links/'+encodeURIComponent(link.id)+'/line_items?limit=10&expand%5B%5D=data.price.product');
  if (items.has_more || items.data?.length !== 1) continue;
  const item=items.data[0], price=item.price, product=price?.product;
  if (item.quantity === 1 && price?.unit_amount === 4900 && price.currency === 'usd' && price.type === 'one_time' &&
      price.livemode === false && product?.livemode === false && /^BOOKED AF: Your Next 30\s*[—–-]\s*TEST$/i.test(product.name || '')) matches.push(link);
}
if (matches.length !== 1) throw Error('Expected exactly one active $49 Your Next 30 TEST Payment Link. Stop for review.');
const link=matches[0];
if (!link.allow_promotion_codes) throw Error('Test Payment Link does not allow promotion codes.');
const endpoints=await stripe('/v1/webhook_endpoints?limit=100');
if (endpoints.has_more) throw Error('Too many test webhooks to select safely.');
const matching=(endpoints.data || []).filter(e => e.url === origin+'/stripe-webhook');
if (matching.length > 1 || matching.some(e => e.livemode !== false || e.description !== marker)) throw Error('Existing webhook requires review.');
if (matching.length && (!settings?.bindings?.some(b => b.name === 'STRIPE_WEBHOOK_SECRET' && b.type === 'secret_text') ||
    matching[0].status !== 'enabled' || !['checkout.session.completed','checkout.session.async_payment_succeeded'].every(e=>matching[0].enabled_events.includes(e))))
  throw Error('Existing test webhook or signing-secret binding is incomplete. Stop for review.');

const buildEnv={...process.env, TEST_SITE_ORIGIN:origin, TEST_CHECKOUT_URL:link.url, TEST_PAYMENT_LINK_ID:link.id};
function wrangler(args,input) {
  try { execFileSync('npx',['--yes','wrangler@4.148.0',...args,'--config','wrangler.test.jsonc'],{cwd:root,env:buildEnv,input,stdio:['pipe','pipe','pipe'],timeout:240000}); }
  catch { throw Error('Isolated Wrangler command failed. Output withheld to protect secrets; no production command was run.'); }
}
// A new Worker remains closed until all required secret bindings are present.
wrangler(['deploy']);
console.log('Isolated test Worker deployed.');
const bindings={STRIPE_SECRET_KEY:stripeToken,RESEND_API_KEY:process.env.RESEND_TEST_API_KEY,TEST_RECIPIENT_EMAIL:process.env.TEST_RECIPIENT_EMAIL};
if (!matching.length) {
  const endpoint=await stripe('/v1/webhook_endpoints',{
    url:origin+'/stripe-webhook',description:marker,
    'enabled_events[0]':'checkout.session.completed','enabled_events[1]':'checkout.session.async_payment_succeeded'
  });
  if (endpoint.livemode !== false || !/^whsec_/.test(endpoint.secret || '')) throw Error('Test webhook creation did not return a valid signing secret.');
  bindings.STRIPE_WEBHOOK_SECRET=endpoint.secret;
}
wrangler(['secret','bulk'],JSON.stringify(bindings));
const updated=await stripe('/v1/payment_links/'+encodeURIComponent(link.id),{
  'after_completion[type]':'redirect',
  'after_completion[redirect][url]':origin+'/?next30=paid&session_id={CHECKOUT_SESSION_ID}'
});
if (updated.livemode !== false || updated.after_completion?.redirect?.url !== origin+'/?next30=paid&session_id={CHECKOUT_SESSION_ID}')
  throw Error('Test-only return URL update could not be verified.');
const health=await fetch(origin+'/health',{signal:AbortSignal.timeout(15000)});
const status=await health.json();
if (!health.ok || status.isolated !== true || status.ready !== true) throw Error('Isolated Worker is not ready.');
console.log('Test webhook, secret bindings and test return URL configured.');
console.log('This is deployment readiness only. Inbox receipt and paid-access E2E tests are still required.');
