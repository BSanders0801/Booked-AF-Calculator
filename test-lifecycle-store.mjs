// TEST ONLY: durable storage for the single approved test inbox. Never bound to production.
export function testLifecycleClass(worker) {
  return class TestLifecycle {
    constructor(ctx, env) { this.ctx = ctx; this.env = env; }
    async fetch(request) {
      if (this.env.BOOKED_AF_TEST_MARKER !== 'booked-af-isolated-test' || this.env.FOLLOWUPS ||
          !/^(?:sk|rk)_test_/.test(this.env.STRIPE_SECRET_KEY || '')) return new Response('Test storage unavailable', {status:503});
      const storage = this.ctx.storage;
      const kv = {
        async get(key) {
          const item = await storage.get(key);
          if (!item || (item.expires && item.expires <= Date.now())) return null;
          return item.value;
        },
        async put(key, value, options = {}) {
          await storage.put(key, {value, expires:options.expirationTtl ? Date.now() + options.expirationTtl * 1000 : 0});
        },
        async delete(key) { await storage.delete(key); },
        async list({prefix = ''} = {}) {
          const entries = await storage.list({prefix});
          return {keys:[...entries].filter(([,v])=>!v.expires || v.expires > Date.now()).map(([name])=>({name})), list_complete:true};
        }
      };
      return this.ctx.blockConcurrencyWhile(() => worker.fetch(request, {...this.env, FOLLOWUPS:kv, TURNSTILE_SECRET_KEY:'1x0000000000000000000000000000000AA'}, this.ctx));
    }
  };
}
