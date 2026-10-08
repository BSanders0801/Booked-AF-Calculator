import {fulfillmentClass} from './fulfillment-store.mjs';
import worker from './.test-worker/email-worker.mjs';
import bundle from './.test-worker/paid-bundle.mjs';
import {deliverPaidContent} from './paid-content.mjs';
import {testOrigin} from './.test-worker/config.mjs';

export const TestPurchaseFulfillment=fulfillmentClass(worker);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const response = (text, status) => new Response(text, {status, headers:{'Cache-Control':'no-store'}});
    if (url.origin !== testOrigin) return response('Wrong test host', 403);
    if (env.BOOKED_AF_TEST_MARKER !== 'booked-af-isolated-test' || env.FOLLOWUPS || env.FIRST90_PAYMENT_LINK_ID || env.FIRST90_CHECKOUT_URL)
      return response('Unexpected binding; test environment disabled', 503);
    const ready = /^(?:sk|rk)_test_/.test(env.STRIPE_SECRET_KEY || '') &&
      /^whsec_/.test(env.STRIPE_WEBHOOK_SECRET || '') && !!env.RESEND_API_KEY &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.TEST_RECIPIENT_EMAIL || '');
    if (url.pathname === '/health') return Response.json({isolated:true,ready,checkout:ready,webhook:ready,schemas:['short-v5']},{headers:{'Cache-Control':'no-store'}});
    if (!ready) return response('Test environment not configured', 503);
    if (url.pathname === '/paid-content') return deliverPaidContent(request,env,ctx,this,bundle,new Set([testOrigin]));
    if (url.pathname === '/lead-test') {
      if(request.method==='OPTIONS')return worker.fetch(request,env,ctx);
      if(request.method!=='POST')return response('Method not allowed',405);
      if(request.headers.get('Origin')!==testOrigin)return response('Wrong test origin',403);
      let data;try{const body=await request.clone().text();if(body.length>30000)return response('Too large',413);data=JSON.parse(body);}catch{return response('Invalid request',400);}
      if(String(data.email||'').trim().toLowerCase()!==env.TEST_RECIPIENT_EMAIL.toLowerCase() || data.type!=='breakdown')return response('Test recipient not approved',403);
      return worker.fetch(request,{...env,TURNSTILE_SECRET_KEY:'1x0000000000000000000000000000000AA'},ctx);
    }
    if (url.pathname === '/stripe-webhook') return worker.fetch(request, env, ctx);
    if (url.pathname === '/verify-checkout') {
      if (request.method !== 'OPTIONS' && !/^cs_test_[A-Za-z0-9]+$/.test(url.searchParams.get('session_id') || ''))
        return Response.json({paid:false},{status:400,headers:{'Cache-Control':'no-store'}});
      const origin = request.headers.get('Origin');
      if (origin && origin !== testOrigin) return response('Wrong test origin', 403);
      // Same-origin GET fetches need not include Origin. Preserve explicit foreign origins.
      const headers = new Headers(request.headers);
      if (!origin) headers.set('Origin', testOrigin);
      return worker.fetch(new Request(request, {headers}), env, ctx);
    }
    if (!['GET','HEAD'].includes(request.method) || ['/profile','/events','/survey','/conversion-summary'].includes(url.pathname))
      return response('Outside isolated checkout test scope', 404);
    return env.ASSETS.fetch(request);
  }
};
