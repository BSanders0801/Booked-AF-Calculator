// Release entrypoint for review only. Existing production configuration is not changed.
// Build with scripts/build-website-preview.mjs and configure PurchaseFulfillment on release.
import worker from './email-worker.mjs';
import bundle from './.private-assets/paid-bundle.mjs';
import {deliverPaidContent} from './paid-content.mjs';
import {fulfillmentClass} from './fulfillment-store.mjs';
export const PurchaseFulfillment=fulfillmentClass(worker);
const origins=new Set(['https://bookedandfabulous.com','https://www.bookedandfabulous.com']);
export default {
 async fetch(request,env,ctx){
  const path=new URL(request.url).pathname;
  if(['/paid-content','/verify-checkout','/stripe-webhook'].includes(path)){
   if(!/^(?:sk|rk)_live_/.test(env.STRIPE_SECRET_KEY||'')||!env.FULFILLMENT)return new Response('Purchase service unavailable',{status:503,headers:{'Cache-Control':'no-store'}});
  }
  if(path==='/paid-content'){
   if(request.method!=='OPTIONS'&&!/^Bearer cs_live_[A-Za-z0-9]+$/.test(request.headers.get('Authorization')||''))return new Response('Purchase required',{status:401,headers:{'Cache-Control':'no-store'}});
   return deliverPaidContent(request,env,ctx,worker,bundle,origins);
  }
  if(path==='/verify-checkout'&&request.method!=='OPTIONS'&&!/^cs_live_[A-Za-z0-9]+$/.test(new URL(request.url).searchParams.get('session_id')||''))return Response.json({paid:false},{status:400,headers:{'Cache-Control':'no-store'}});
  return worker.fetch(request,env,ctx);
 },
 scheduled(event,env,ctx){return worker.scheduled(event,env,ctx);}
};
