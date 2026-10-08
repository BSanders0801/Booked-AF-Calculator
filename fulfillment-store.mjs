// One durable object per checkout serializes webhook retries across events and isolates storage.
export function fulfillmentClass(worker){
 return class PurchaseFulfillment {
  constructor(ctx,env){this.ctx=ctx;this.env=env;}
  fetch(request){
   return this.ctx.blockConcurrencyWhile(()=>worker.fetch(request,{...this.env,FULFILLMENT:undefined,DELIVERY_STATE:this.ctx.storage},this.ctx));
  }
 };
}
