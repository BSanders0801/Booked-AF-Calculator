import worker from './.test-worker/email-worker.mjs';
import {testOrigin} from './.test-worker/config.mjs';

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
    if (url.pathname === '/health') return Response.json({isolated:true,ready,checkout:ready,webhook:ready},{headers:{'Cache-Control':'no-store'}});
    if (!ready) return response('Test environment not configured', 503);
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
