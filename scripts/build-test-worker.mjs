// Produce an isolated test bundle without modifying any production source.
import {mkdir, readFile, writeFile, readdir, copyFile, rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {buildSecureSite} from './build-secure-site.mjs';
const root = resolve(import.meta.dirname, '..');

export function validateTestBuild({origin, checkoutUrl, paymentLinkId}) {
  const u = new URL(origin);
  if (u.protocol !== 'https:' || !/^booked-af-email-test\.[a-z0-9-]+\.workers\.dev$/.test(u.hostname) || u.origin !== origin)
    throw Error('An isolated booked-af-email-test workers.dev origin is required.');
  const checkout = new URL(checkoutUrl);
  if (checkout.origin !== 'https://buy.stripe.com' || !/^\/test_[A-Za-z0-9]+$/.test(checkout.pathname) || checkout.search || checkout.hash)
    throw Error('A Stripe test Payment Link URL is required.');
  if (!/^plink_[A-Za-z0-9]+$/.test(paymentLinkId)) throw Error('A verified test Payment Link is required.');
}

function replaceOne(text, pattern, value) {
  const matches = [...text.matchAll(new RegExp(pattern.source, 'g'))];
  if (matches.length !== 1) throw Error('Test build source changed; review the isolation transformation before deploying.');
  return text.replace(pattern, value);
}

export async function buildTestWorker(config) {
  validateTestBuild(config);
  const {origin, checkoutUrl, paymentLinkId} = config;
  const revision=process.env.GITHUB_SHA || 'local';
  if(!/^(?:[a-f0-9]{40}|local)$/.test(revision))throw Error('Invalid build revision');
  const out = resolve(root, '.test-website'), generated = resolve(root, '.test-worker');
  await rm(out, {recursive:true, force:true});
  await rm(generated, {recursive:true, force:true});
  await mkdir(resolve(out, 'assets'), {recursive:true});
  await mkdir(generated, {recursive:true});
  await buildSecureSite(out,generated,(content,file)=>{
    if (file === 'app.js') {
      content = replaceOne(content, /const emailServiceUrl = '[^']+';/, `const emailServiceUrl = ${JSON.stringify(origin)};`);
      content = replaceOne(content, /const next30CheckoutUrl = '[^']+';/, `const next30CheckoutUrl = ${JSON.stringify(checkoutUrl)};`);
      content = content.replace("const emailSiteKey = '0x4AAAAAAFDEaTJ_ybTjAuWb';","const emailSiteKey = '1x00000000000000000000AA';");
      content = content.replace('await fetch(emailServiceUrl, {',"await fetch(emailServiceUrl+'/lead-test', {");
      content = content.replace('fetch(emailServiceUrl,{', "fetch(emailServiceUrl+'/health',{");
    }
    if(file==='lifecycle-ui.js')content=content.replace('fetch(emailServiceUrl,{',"fetch(emailServiceUrl+'/health',{");
    content = content.replace(/https:\/\/(?:www\.)?bookedandfabulous\.com/g, origin);
    content = content.replace(/https:\/\/buy\.stripe\.com\/[A-Za-z0-9_]+/g, checkoutUrl);
    if (/https:\/\/booked-af-email\./.test(content) || /https:\/\/buy\.stripe\.com\/(?!test_)/.test(content))
      throw Error('Production payment routing remains in test assets.');
    return content;
  });
  let worker = await readFile(resolve(root, 'email-worker.mjs'), 'utf8');
  worker = replaceOne(worker, /const ORIGINS = new Set\([^\n]+\);/, `const ORIGINS = new Set([${JSON.stringify(origin)}]);`);
  worker = replaceOne(worker, /const next30PaymentLinkIds = new Set\([^\n]+\);/, `const next30PaymentLinkIds = new Set([${JSON.stringify(paymentLinkId)}]);`);
  worker = replaceOne(worker, /function isNext30Checkout\(session\) \{/, `function isNext30Checkout(session) {
  if (session?.livemode !== false || !/^cs_test_[A-Za-z0-9]+$/.test(session?.id || '')) return false;`);
  worker = replaceOne(worker, /const session = event\.data\?\.object;/, `const session = event.data?.object;
  if (event.livemode !== false || !isNext30Checkout(session)) return new Response('Ignored');
  const recipient = session.customer_details?.email || session.customer_email;
  if (String(recipient || '').toLowerCase() !== String(env.TEST_RECIPIENT_EMAIL || '').toLowerCase()) return new Response('Test recipient not approved', {status:403});`);
  worker = replaceOne(worker, /const surveyScheduled = await schedulePurchaseSurvey\(env, session, email, firstName\);/, `const surveyScheduled = await schedulePurchaseSurvey(env, session, email, firstName);
  if (!surveyScheduled) return new Response('Survey scheduling failed', {status:502});`);
  worker = worker.replace('(env.FOLLOWUPS||isStudent(answers))','env.FOLLOWUPS');
  worker = worker.replace('const customerEmail = session.customer_details?.email || session.customer_email || \'\';',
    `if(!isNext30Checkout(session))return reply({success:false},403);
    const customerEmail = session.customer_details?.email || session.customer_email || '';
    if(customerEmail.toLowerCase()!==env.TEST_RECIPIENT_EMAIL.toLowerCase())return reply({success:false},403);`);
  worker = worker.replaceAll("to:['hello@bookedandfabulous.com']",'to:[env.TEST_RECIPIENT_EMAIL]');
  worker = worker.replaceAll("bcc:email === 'hello@bookedandfabulous.com' ? undefined : ['hello@bookedandfabulous.com'],",'');
  worker = worker.replace("if (!verified.success || verified.hostname !== new URL(origin).hostname || verified.action !== 'booked_email')","if (!verified.success || data.token !== 'XXXX.DUMMY.TOKEN.XXXX')");
  worker = worker.replace(/https:\/\/(?:www\.)?bookedandfabulous\.com/g, origin);
  await writeFile(resolve(generated, 'email-worker.mjs'), worker);
  await writeFile(resolve(generated, 'config.mjs'), `export const testOrigin = ${JSON.stringify(origin)};\nexport const testRevision=${JSON.stringify(revision)};\n`);
  console.log('Built isolated test website and Worker; no production source modified.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await buildTestWorker({origin:process.env.TEST_SITE_ORIGIN, checkoutUrl:process.env.TEST_CHECKOUT_URL, paymentLinkId:process.env.TEST_PAYMENT_LINK_ID});
}
