/* Shared career profile; private email links establish access across devices. */
(() => {
 'use strict';
 const profileKey='booked-af-career-profile-v1';
 let access='',profile=null,saving=false,lastSaved='';
 let first90Offer=null;
 const offerReady=fetch(emailServiceUrl,{credentials:'omit',signal:AbortSignal.timeout(5000)}).then(r=>r.json()).then(data=>{first90Offer=data.features?.first90||null;}).catch(()=>{});
 let session='';
 try{session=sessionStorage.getItem('booked-af-funnel-session')||'';if(!/^[-a-zA-Z0-9]{16,80}$/.test(session)){session=crypto.randomUUID();sessionStorage.setItem('booked-af-funnel-session',session);}}catch{session=crypto.randomUUID();}
 let source='direct';
 try{
  const params=new URLSearchParams(location.search);
  const incoming=String(params.get('src')||params.get('utm_source')||params.get('source')||'').trim().toLowerCase();
  if(/^[a-z0-9_-]{1,40}$/.test(incoming)&&incoming!=='student-share')sessionStorage.setItem('booked-af-acquisition-source',incoming);
  const saved=String(sessionStorage.getItem('booked-af-acquisition-source')||'').trim().toLowerCase();
  if(/^[a-z0-9_-]{1,40}$/.test(saved))source=saved;
 }catch{}
 try{const saved=JSON.parse(localStorage.getItem(profileKey)||'null');if(/^[a-f0-9]{64}$/.test(saved?.token||'')){access=saved.token;profile=saved.profile;}}catch{}
 const emitted=new Set();
 function track(event,category){
  const id=event+':'+(category||'')+':'+source;if(emitted.has(id))return;emitted.add(id);
  fetch(emailServiceUrl+'/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,session,source,...(category?{category}:{})}),credentials:'omit',keepalive:true}).then(r=>{if(!r.ok)emitted.delete(id);}).catch(()=>emitted.delete(id));
 }
 function persist(){try{localStorage.setItem(profileKey,JSON.stringify({token:access,profile}));}catch{}}
 async function profileRequest(action,extra={}){
  const r=await fetch(emailServiceUrl+'/profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,token:access,...extra}),credentials:'omit',signal:AbortSignal.timeout(15000)});
  const data=await r.json();if(!r.ok||data.success!==true)throw new Error(data.error||'We couldn’t connect to your saved profile. Try again.');
  profile=data.profile;persist();return profile;
 }
 async function openProfile(token){
  access=token;
  app.classList.remove('marketing-screen');
  app.innerHTML='<h2>OPENING YOUR SAVED PROFILE…</h2><p>Your career changes. Your profile comes with you.</p>';
  try{
   const p=await profileRequest('open');
   restoreSchema(p.schema);state.answers=validateShortAnswers(p.answers);state.done=p.done||{};state.emailSent=true;state.index=0;
   lastSaved=JSON.stringify({answers:state.answers,done:state.done});
   try{sessionStorage.setItem(deliveryKey,JSON.stringify({schema:state.schema,answers:state.answers,emailSent:true,name:state.name||''}));}catch{}
   history.replaceState(null,'',location.pathname+location.search+'#my-breakdown');state.view='result';render();
  }catch(error){
   app.innerHTML='<h2>LET’S RECONNECT.</h2><p role="alert">'+esc(error.message)+'</p><button class="primary" id="profile-retry">TRY AGAIN →</button><div class="actions"><button class="secondary" data-nav="question">Send myself a new Breakdown →</button></div>';
   document.getElementById('profile-retry').onclick=()=>openProfile(token);
  }
 }
 async function saveProfile(){
  if(!access||saving||state.schema!==SHORT_SCHEMA)return;
  let answers;try{answers=validateShortAnswers(state.answers);}catch{return;}
  const value=JSON.stringify({answers,done:state.done});if(value===lastSaved)return;
  saving=true;
  let saved=false;
  try{await profileRequest('save',{answers,done:state.done});lastSaved=value;saved=true;showSaveStatus('Saved to your career profile.');}
  catch(error){showSaveStatus(error.message+' Your browser copy is still available.',true);}
  finally{saving=false;if(saved)saveProfile();}
 }
 function showSaveStatus(message,error=false){
  if(!['result','plan','plans'].includes(state.view))return;
  let notice=document.getElementById('profile-save-status');
  if(!notice){notice=document.createElement('p');notice.id='profile-save-status';notice.role='status';notice.className='profile-status';app.append(notice);}
  notice.textContent=message;
  if(error){const retry=document.createElement('button');retry.className='secondary';retry.textContent='Retry saving';retry.onclick=saveProfile;notice.append(document.createElement('br'),retry);}
 }
 function studentResultHTML(r){return shortResultHTML(r);}
 sitePages.first90=`<section class="first90-panel"><p class="eyebrow">BOOKED AF: FIRST 90</p><h1>THE FIRST 90.<br><span class="pink">COMING NEXT.</span></h1><p class="lead">The first salon. The first clients. The first paycheck. A plan for the part that gets real fast.</p><p>We’re testing what students actually need before building the full product. There’s nothing to buy yet.</p><div class="card" id="first90-interest-panel"></div><div class="actions"><button class="secondary" id="first90-back">Back to my free Breakdown →</button></div></section>`;
 function enhance(){
  const student=isStudent(state.answers);
  const productNav=document.querySelector('[data-product-nav]');
  if(productNav){productNav.dataset.nav=student?'first90':'paid';productNav.href=student?'#first-90':'#deep-dive';productNav.textContent=student?'FIRST 90 · Coming soon':'Your Next 30 · $49';}
  if(state.view==='question'&&student)track('student_start');
  if(['email','result','plan'].includes(state.view)&&student){try{track('student_complete',buildShortBreakdown(state.answers).category);}catch{}}
  if(state.view==='email'&&student){
   const form=document.getElementById('form');
   if(form&&!document.getElementById('first90-optin')){
    const label=document.createElement('label');label.className='checkline';label.style.letterSpacing='normal';label.innerHTML='<input type="checkbox" id="first90-optin" name="first90Interest"> Email me when BOOKED AF: FIRST 90 is available. Optional.';
    form.querySelector('button[type="submit"]').before(label);
   }
   const note=app.querySelector('.capture-note');if(note)note.innerHTML='Your email unlocks your free Breakdown and sends a private link to save and resume your profile. FIRST 90 updates are optional. We don’t send you working-professional check-ins while you’re in school. <a href="#privacy" data-nav="privacy">Privacy Policy</a>.';
  }
  if(['result','plan'].includes(state.view)){
   if(access)saveProfile();
   else {const note=document.createElement('p');note.className='profile-status';note.textContent='To save this career profile across devices, open the private link in your Breakdown email.'+(student?' Use the same email after graduation.':'');app.append(note);}
  }
  if(state.view==='plans'){
   const wrap=document.createElement('div');wrap.className='card';
   wrap.innerHTML=profile?'<h2>My career profile</h2><p>Continue with the same profile when your work changes.</p><button class="secondary" id="profile-open">Open my saved profile →</button><button class="subtle" data-career-update>Update my career stage</button><button class="subtle" id="profile-signout">Sign out on this device</button>':'<h2>Across devices</h2><p>Open the private link in your Breakdown email to restore your career profile. A new Breakdown with the same email reconnects to that profile once you open the new link.</p>';
   app.append(wrap);
   document.getElementById('profile-open')?.addEventListener('click',()=>openProfile(access));
   document.getElementById('profile-signout')?.addEventListener('click',()=>{clear();state.emailSent=false;state.answers={};state.done={};state.name='';try{localStorage.removeItem('booked-af-free-progress-v1');sessionStorage.removeItem(deliveryKey);}catch{}state.view='plans';render();});
  }
  if(state.view==='first90'){
   const panel=document.getElementById('first90-interest-panel');
   if(!student){panel.innerHTML='<h2>Start with your free Breakdown.</h2><p>We’ll use your school and clinic experience to find what to fix first.</p><a class="primary" href="#student-breakdown">START MY STUDENT BREAKDOWN →</a>';}
   else if(profile?.first90Interest||state.first90Interest){panel.innerHTML='<h2>YOU’RE ON THE LIST.</h2><p>We’ve saved your FIRST 90 interest. No payment has been taken. Your free Breakdown is saved in your career profile.</p>';}
   else{panel.innerHTML='<h2>Want to hear when it’s ready?</h2><p>Send yourself your free Breakdown and tick the optional FIRST 90 box.</p><button class="primary" id="first90-email">GET FIRST 90 UPDATES →</button>';document.getElementById('first90-email').onclick=()=>{state.view='email';render();document.getElementById('first90-optin').checked=true;};}
   offerReady.then(()=>{
    if(state.view!=='first90'||!first90Offer||first90Offer.status!=='live'||first90Offer.price!==29)return;
    let safe=false;try{const u=new URL(first90Offer.checkoutUrl);safe=u.protocol==='https:'&&u.hostname==='buy.stripe.com';}catch{}
    if(!safe)return;
    app.querySelector('h1').innerHTML='YOUR FIRST 90.<br><span class="pink">START HERE.</span>';
    app.querySelector('.first90-panel>p:not(.eyebrow):not(.lead)')?.remove();
    panel.innerHTML='<h2>BOOKED AF: FIRST 90 · $29</h2><p>One payment for your first-90-days plan.</p><a class="primary checkout-link" href="'+esc(first90Offer.checkoutUrl)+'">GET MY FIRST 90 →</a>';
   });
   document.getElementById('first90-back').onclick=()=>{state.view=student?'result':'intro';render();};
  }
 }
 function clear(){access='';profile=null;lastSaved='';try{localStorage.removeItem(profileKey);}catch{}}
 document.addEventListener('click',async event=>{
  if(event.target.closest('[data-career-update]')){
   event.preventDefault();state.answers={};state.done={};state.emailSent=!!access;state.index=0;restoreSchema(SHORT_SCHEMA);state.view='question';render();
  }
  if(event.target.closest('[data-student-share]')){
   event.preventDefault();const url='https://bookedandfabulous.com/?source=student-share#student-breakdown';
   try{if(navigator.share)await navigator.share({title:'BOOKED AF',text:'Still in school for hair? Start before the expensive lessons.',url});else await navigator.clipboard.writeText(url);track('student_share');event.target.textContent='Ready to share.';}catch{}
  }
 });
 app.addEventListener('change',event=>{if(event.target.matches('[data-task]')){saveProfile();if(isStudent(state.answers)){const r=buildShortBreakdown(state.answers);if(r.plan.steps.every(s=>state.done[s.id]))track('student_plan_complete',r.category);}}});
 window.BookedLifecycle={session,source,track,enhance,clear,openProfile,saveProfile,studentResultHTML,hasAccess:()=>!!access};
 track('site_visit');
 if(new URLSearchParams(location.search).get('source')==='student-share')track('student_referral');
})();
