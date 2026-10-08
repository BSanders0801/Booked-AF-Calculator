// A purchase credential is checked server-side before sending any implementation asset.
export async function deliverPaidContent(request, env, ctx, worker, bundle, allowedOrigins){
 const origin=request.headers.get('Origin')||new URL(request.url).origin;
 const headers={'Cache-Control':'private, no-store, max-age=0','Vary':'Origin, Authorization','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
 if(!allowedOrigins.has(origin))return new Response('Forbidden',{status:403,headers});
 Object.assign(headers,{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Authorization'});
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(request.method!=='POST')return new Response('Method not allowed',{status:405,headers});
 const token=/^Bearer (cs_(?:test|live)_[A-Za-z0-9]+)$/.exec(request.headers.get('Authorization')||'')?.[1];
 if(!token)return new Response('Purchase required',{status:401,headers});
 const url=new URL('/verify-checkout',request.url);url.searchParams.set('session_id',token);
 const verified=await worker.fetch(new Request(url,{headers:{Origin:origin}}),env,ctx);
 const result=await verified.json().catch(()=>({}));
 if(!verified.ok||result.paid!==true)return new Response('Purchase unavailable',{status:verified.status>=500?503:403,headers});
 return new Response(bundle,{headers:{...headers,'Content-Type':'text/javascript; charset=utf-8'}});
}
