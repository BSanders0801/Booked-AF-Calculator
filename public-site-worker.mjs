// Public asset host only. No paid source, user records or API credentials.
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.hostname==='www.bookedandfabulous.com'){url.hostname='bookedandfabulous.com';url.protocol='https:';return Response.redirect(url.toString(),301);}
 if(url.protocol==='http:'){url.protocol='https:';return Response.redirect(url.toString(),301);}
 const result=await env.ASSETS.fetch(request);
 const response=new Response(result.body,result);response.headers.set('X-Booked-AF-Host','cloudflare-public');return response;
}};
