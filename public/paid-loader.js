/* The public page contains no paid recipes. Stripe authorizes each new delivery. */
let paidLoading=false;
function renderNext30Sample(){app.innerHTML=sitePages.next30sample;}
async function verifyAndLoadPaid(){
 if(paidLoading)return;
 const id=state.checkoutSessionId;
 state.next30Verified=false;
 app.innerHTML='<div class="eyebrow">YOUR NEXT 30</div><h2>Checking your purchase…</h2><p>Your saved answers will be here when your plan opens.</p>';
 if(!/^cs_(?:live|test)_[A-Za-z0-9]+$/.test(id||'')){
  app.innerHTML='<h2>Open your welcome email.</h2><p>Tap START MY NEXT 30 in the email sent to your checkout address. That private link restores your purchased access.</p>';return;
 }
 paidLoading=true;
 try{
  const response=await fetch(emailServiceUrl+'/paid-content',{method:'POST',headers:{Authorization:'Bearer '+id},credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(20000)});
  if(!response.ok){if(response.status===403)throw Error('Your purchase is not active. Use the welcome email link, or contact hello@bookedandfabulous.com for help.');throw Error('We couldn’t check your purchase right now. Your saved answers are safe. Please try again.');}
  if(!response.headers.get('Content-Type')?.startsWith('text/javascript'))throw Error('Your plan could not be loaded. Please try again.');
  const source=await response.text();
  if(!window.BookedNext30){
   const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
   try{await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=url;script.onload=()=>{script.remove();resolve()};script.onerror=()=>{script.remove();reject(Error('Your plan could not be loaded. Please try again.'))};document.head.append(script);});}finally{URL.revokeObjectURL(url);}
  }
  state.next30Verified=true;state.deepPreview=false;
  // Remove the private return credential from the address bar before any navigation.
  const address=new URL(location.href);address.searchParams.delete('session_id');history.replaceState(null,'',address);
  state.view=BookedNext30.complete(next30Ensure().answers)?'deepresult':'deepintake';
  render();
 }catch(error){
  app.innerHTML='<h2>Your plan is still saved.</h2><p id="paid-load-error"></p><button class="primary" id="retry-payment">TRY AGAIN →</button>';
  document.getElementById('paid-load-error').textContent=error.message;
  document.getElementById('retry-payment').onclick=()=>verifyAndLoadPaid();
 }finally{paidLoading=false;}
}
