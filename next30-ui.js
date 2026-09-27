/* Paid UI. Entry remains behind app.js's verified checkout route. */
function renderNext30Sample(role='color'){
 if(!BookedNext30.roles[role])role='color';
 let answers={careers:[role],goal:'money',load:'busy',available:'hour'};
 for(let pass=0;pass<8;pass++){
  for(const q of BookedNext30.questions(answers))if(answers[q.id]===undefined)answers[q.id]=q.multi?[q.choices[0][0]]:q.choices[0][0];
  answers=BookedNext30.cleanAnswers(answers);
 }
 const plan=BookedNext30.build(answers),escape=next30Escape;
 app.innerHTML=`<section class="baf-section"><p class="baf-kicker">EXAMPLE ONLY · MADE-UP ANSWERS</p><h1>YOUR CAREER.<br><span>YOUR KIND OF PLAN.</span></h1><p class="baf-subhead">Pick your career. This sample uses a busy workload, a better-pay goal, and an hour a week. Your answers change your plan.</p><div class="baf-sample-tabs" role="group" aria-label="Choose a paid career example">${Object.entries(BookedNext30.roles).map(([id,r])=>`<button type="button" class="baf-sample-tab" data-next30-sample="${id}" aria-pressed="${id===role}">${escape(r.label)}</button>`).join('')}</div><div class="baf-card"><p class="baf-kicker">${escape(plan.roleLabel)}</p><h2>DO THIS FIRST</h2><p>${escape(plan.doNow)}</p><h3>STOP THIS</h3><p>${escape(plan.stop)}</p><p>${escape(plan.instead)}</p><h3>WATCH THIS</h3><p>${escape(plan.watch)}</p></div><div class="baf-card"><h3>WEEK 1: ${escape(plan.missions[0].title)}</h3><ul>${plan.missions[0].tasks.map(x=>`<li>${escape(x)}</li>`).join('')}</ul></div><div class="baf-card"><h3>ONE SCRIPT TO STEAL</h3><p><strong>${escape(plan.scripts[0][0])}</strong></p><p>${escape(plan.scripts[0][1])}</p></div><details><summary>THE EXAMPLE ANSWERS BEHIND THIS</summary><ul>${plan.answers.map(x=>`<li>${escape(x.title)} ${escape(x.answer)}</li>`).join('')}</ul></details><p>Your full plan includes four weeks, three scripts, a work checklist, ${escape(plan.tool.title.toLowerCase())}, a before-and-after scorecard, and a purchase-value check. Save it and come back as the work changes.</p><div class="baf-actions"><button type="button" data-nav="paid">See Your Next 30 · $49 →</button><button type="button" class="baf-outline" data-nav="intro">Back home</button></div></section>`;
 app.querySelectorAll('[data-next30-sample]').forEach(el=>el.onclick=()=>{const selected=el.dataset.next30Sample;renderNext30Sample(selected);app.querySelector(`[data-next30-sample="${selected}"]`).focus()});
}
function next30Ensure(){
 if(state.careerData)return state.careerData;
 let saved=null;
 try{saved=JSON.parse(sessionStorage.getItem('booked-af-career-next30-v1')||'null')}catch(e){}
 const carried=BookedNext30.seed(state.schema===SHORT_SCHEMA?state.answers:{},state.deepAnswers);
 const answers=BookedNext30.cleanAnswers(saved&&saved.version===BookedNext30.VERSION?saved.answers:carried);
 state.careerData={version:BookedNext30.VERSION,answers,carried:saved?.version===BookedNext30.VERSION?BookedNext30.cleanAnswers(saved.carried):carried,currentId:typeof saved?.currentId==='string'?saved.currentId:null,checks:next30NumericMap(saved?.checks,true),metrics:next30NumericMap(saved?.metrics),tools:next30NumericMap(saved?.tools),savedPlans:next30SavedPlans(saved?.savedPlans)};
 return state.careerData;
}
function next30Save(){
 try{sessionStorage.setItem('booked-af-career-next30-v1',JSON.stringify(state.careerData));return true}catch(e){return false}
}
function next30Escape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function next30Visible(){
 const data=next30Ensure();
 return BookedNext30.questions(data.answers).filter(q=>data.editAll||JSON.stringify(data.answers[q.id])!==JSON.stringify(data.carried[q.id])||data.answers[q.id]===undefined);
}
function next30ImportControl(){return '<details class="card"><summary>Already saved a BOOKED AF plan file?</summary><p>Open it here to restore your answers and scorecard. It stays in this browser.</p><label for="next30-import">Choose your saved .json plan file</label><input id="next30-import" type="file" accept="application/json,.json"><p id="next30-import-status" role="status"></p></details>'}
function next30BindImport(){
 const input=document.getElementById('next30-import');
 if(!input)return;
 input.onchange=async()=>{
  const file=input.files?.[0],status=document.getElementById('next30-import-status');
  if(!file)return;
  if(file.size>250000){status.textContent='That file is too large. Use the plan file saved from BOOKED AF.';return}
  try{
   const parsed=JSON.parse(await file.text());
   if(parsed.version!==BookedNext30.VERSION||!parsed.answers||typeof parsed.answers!=='object')throw Error('format');
   const answers=BookedNext30.cleanAnswers(parsed.answers);
   if(!Object.keys(answers).length)throw Error('answers');
   state.careerData={version:BookedNext30.VERSION,answers,carried:{},currentId:null,checks:next30NumericMap(parsed.checks,true),metrics:next30NumericMap(parsed.metrics),tools:next30NumericMap(parsed.tools),savedPlans:next30SavedPlans(parsed.savedPlans)};
   next30Save();state.view=BookedNext30.complete(answers)?'deepresult':'deepintake';render();
  }catch(e){status.textContent='That does not look like a BOOKED AF plan file. Your current answers are still here.'}
 };
}
function next30NumericMap(input,boolean=false){
 if(!input||typeof input!=='object'||Array.isArray(input))return {};
 return Object.fromEntries(Object.entries(input).slice(0,200).filter(([k,v])=>/^[a-zA-Z0-9_-]{1,100}$/.test(k)&&(boolean?typeof v==='boolean':typeof v==='string'&&v.length<=30&&/^-?\d*(\.\d*)?$/.test(v))));
}
function next30SavedPlans(input){
 if(!Array.isArray(input))return [];
 const records=[];
 for(const item of input.slice(0,10)){
  const answers=BookedNext30.cleanAnswers(item?.answers);if(!BookedNext30.complete(answers))continue;
  const role=BookedNext30.primary(answers),goal=BookedNext30.goalFor(answers),id=role+'-'+goal;
  if(!records.some(x=>x.id===id))records.push({id,role,goal,answers});
 }
 return records;
}
function next30TaskKey(key,week,index,task){
 let hash=2166136261;for(const char of task)hash=Math.imul(hash^char.charCodeAt(0),16777619);
 return key+'-w'+week+'-'+index+'-'+(hash>>>0).toString(36);
}
function renderCareerIntake(){
 const data=next30Ensure(),escape=next30Escape;
 data.answers=BookedNext30.cleanAnswers(data.answers);
 if(BookedNext30.complete(data.answers)&&!data.editAll&&!data.currentId){state.view='deepresult';render();return}
 const all=BookedNext30.questions(data.answers),visible=next30Visible();
 let q=visible.find(q=>q.id===data.currentId)||visible.find(q=>data.answers[q.id]===undefined)||visible[0];
 if(!q){state.view='deepresult';render();return}
 data.currentId=q.id;
 const index=visible.findIndex(x=>x.id===q.id),selected=data.answers[q.id],values=Array.isArray(selected)?selected:selected===undefined?[]:[selected];
 const carried=all.filter(q=>data.answers[q.id]!==undefined&&JSON.stringify(data.answers[q.id])===JSON.stringify(data.carried[q.id]));
 const answered=all.filter(q=>data.answers[q.id]!==undefined).length;
 const carryHTML=carried.length&&!data.editAll?`<details class="card"><summary>We kept ${carried.length} answers from your Breakdown.</summary><p>No need to tell us twice. You can change any of these.</p><ul>${carried.map(q=>`<li>${escape(q.title)} <strong>${escape((Array.isArray(data.answers[q.id])?data.answers[q.id]:[data.answers[q.id]]).map(v=>q.choices.find(x=>x[0]===v)?.[1]).join(' / '))}</strong></li>`).join('')}</ul><button class="secondary" type="button" id="next30-edit-carried">CHANGE THESE ANSWERS →</button></details>`:'';
 app.innerHTML=`<div class="eyebrow">YOUR NEXT 30 · ${BookedNext30.roles[BookedNext30.primary(data.answers)]?.label||'YOUR CAREER'}</div><p class="fine">${answered} of ${all.length} current questions answered. The path adjusts to your work.</p>${carryHTML}<h2>${escape(q.title)}</h2>${q.note?`<p>${escape(q.note)}</p>`:''}<p>${q.multi?'Pick all that apply.':'Pick one.'}</p><div class="choices">${q.choices.map(([value,label])=>`<button type="button" class="choice ${values.includes(value)?'selected':''}" data-next30-choice="${escape(value)}" aria-pressed="${values.includes(value)}">${escape(label)}</button>`).join('')}</div><div class="actions"><button type="button" class="secondary" id="next30-back">← BACK</button><button type="button" class="primary" id="next30-next" ${values.length?'':'disabled'}>${index===visible.length-1?'BUILD MY NEXT 30 →':'NEXT →'}</button></div><p class="fine" id="next30-save-status">Your answers stay in this browser session. Save your finished plan so you can bring it back later.</p>${next30ImportControl()}`;
 app.querySelectorAll('[data-next30-choice]').forEach(el=>el.onclick=()=>{
  const value=el.dataset.next30Choice;
  if(q.multi){
   const exclusive=q.exclusive||[];let next=[...values];
   if(exclusive.includes(value))next=next.includes(value)?[]:[value];
   else {next=next.filter(v=>!exclusive.includes(v));next=next.includes(value)?next.filter(v=>v!==value):[...next,value]}
   if(next.length)data.answers[q.id]=next;else delete data.answers[q.id];
  }else data.answers[q.id]=value;
  data.answers=BookedNext30.cleanAnswers(data.answers);next30Save();render();
 });
 document.getElementById('next30-back').onclick=()=>{
  if(index===0){data.editAll=true;data.currentId='careers'}else data.currentId=visible[index-1].id;
  next30Save();render();
 };
 document.getElementById('next30-next').onclick=()=>{
  if(data.answers[q.id]===undefined)return;
  const current=next30Visible(),at=current.findIndex(x=>x.id===q.id);
  if(at>=0&&at<current.length-1)data.currentId=current[at+1].id;
  else {
   const missing=BookedNext30.questions(data.answers).find(x=>data.answers[x.id]===undefined);
   if(missing){data.editAll=true;data.currentId=missing.id}
   else {data.currentId=null;state.view='deepresult'}
  }
  next30Save();render();
 };
 const edit=document.getElementById('next30-edit-carried');if(edit)edit.onclick=()=>{data.editAll=true;data.currentId=carried[0]?.id||'careers';render()};
 if(!next30Save())document.getElementById('next30-save-status').textContent='This browser cannot save your progress right now. Keep this tab open and save a plan file when you finish.';
 next30BindImport();
}
function next30Field(id,label,value='',extra=''){
 return `<div class="n30-field"><label for="${id}">${next30Escape(label)}</label><input class="input" type="number" inputmode="decimal" ${extra.includes('data-negative')?'':'min="0"'} step="any" id="${id}" value="${next30Escape(value)}" ${extra}></div>`;
}
function next30Download(name,content,type){
 const url=URL.createObjectURL(new Blob([content],{type}));
 const anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function next30PlanText(plan){
 const lines=['BOOKED AF: YOUR NEXT 30',plan.roleLabel,plan.headline,plan.intro,'','DO THIS',plan.doNow,'','STOP THIS',plan.stop,plan.instead,'','WATCH THIS',plan.watch,''];
 for(const week of plan.missions)lines.push('WEEK '+week.week+': '+week.title,...week.tasks.map(x=>'[ ] '+x),'Watch: '+week.watch,'');
 lines.push('YOUR WORK CHECKLIST',...plan.checklist.map(x=>'[ ] '+x),'','STEAL THESE WORDS');
 for(const [title,copy] of plan.scripts)lines.push(title,copy,'');
 lines.push('WHAT YOUR ANSWERS TELL US');
 for(const signal of plan.supporting)lines.push(signal.title,signal.answer,signal.action,'');
 lines.push('WHEN IT GETS STUCK');for(const item of plan.rescue)lines.push(item.title,item.body,'');
 lines.push('YOUR LIMITS',...plan.constraints,'','Use the original purchase email to return to Your Next 30. Import your saved BOOKED AF .json plan file to restore answers and tools. This text file is your readable plan.','BOOKED AF does not promise an income result. Measure what happened using comparable work and time periods.');
 return lines.join('\n');
}
function renderCareerPlan(){
 const data=next30Ensure(),escape=next30Escape;
 if(!BookedNext30.complete(data.answers)){state.view='deepintake';render();return}
 const plan=BookedNext30.build(data.answers),key=plan.role+'-'+plan.goal;
 next30Remember();
 if(data.tools[key+'-price']===undefined)data.tools[key+'-price']=String(BookedNext30.PRICE);
 if(data.answers[plan.role+'_pay']==='self'&&data.tools[key+'-share']===undefined)data.tools[key+'-share']='100';
 app.classList.add('next30-panel');
 state.currentCareerPlan=plan;
 const number=(id,label,extra='')=>next30Field('n30-'+id,label,data.tools[key+'-'+id]||'',extra);
 const metricRows=plan.metrics.map(m=>`<div class="card"><h3>${escape(m.label)}</h3><div class="grid2">${next30Field('n30-base-'+m.id,'Before ('+m.unit+')',data.metrics[key+'-base-'+m.id]||'')}${next30Field('n30-now-'+m.id,'After ('+m.unit+')',data.metrics[key+'-now-'+m.id]||'')}</div><p id="n30-delta-${m.id}" role="status"></p></div>`).join('');
 app.innerHTML=`<div class="eyebrow">YOUR NEXT 30 · ${escape(plan.roleLabel)}</div><h2>${escape(plan.headline)}</h2><p class="lead">${escape(plan.intro)}</p><div class="card"><div class="number">DO THIS FIRST</div><p>${escape(plan.doNow)}</p></div><div class="grid2"><div class="card"><div class="number">STOP THIS</div><h3>${escape(plan.stop)}</h3><p>${escape(plan.instead)}</p></div><div class="card"><div class="number">WATCH THIS</div><h3>${escape(plan.watch)}</h3><p>Record a starting point. Compare like with like at the end of the month.</p></div></div><details><summary>WHY THIS IS YOUR PLAN</summary>${plan.evidence.map(x=>`<div class="card"><p><strong>You said:</strong> ${escape(x.answer)}</p><p>${escape(x.action)}</p></div>`).join('')}${plan.constraints.map(x=>`<p>${escape(x)}</p>`).join('')}</details><div class="eyebrow">FOUR WEEKS. ONE PRIORITY.</div><p id="next30-progress" role="status"></p>${plan.missions.map(week=>`<section class="card"><div class="number">WEEK ${week.week}</div><h3>${escape(week.title)}</h3>${week.tasks.map((task,i)=>{const id=next30TaskKey(key,week.week,i,task);return `<label class="checkline"><input type="checkbox" data-next30-task="${id}" ${data.checks[id]?'checked':''}><span>${escape(task)}</span></label>`}).join('')}<p class="fine"><strong>WATCH:</strong> ${escape(week.watch)}</p></section>`).join('')}
 <details><summary>STEAL THESE WORDS</summary><p>Replace the brackets with what is true. Keep the part that sounds like you.</p>${plan.scripts.map(([title,copy],i)=>`<section class="card"><h3>${escape(title)}</h3><p id="next30-script-${i}">${escape(copy)}</p><button class="secondary" type="button" data-next30-copy="${i}">COPY THIS →</button></section>`).join('')}<p id="next30-copy-status" role="status"></p></details>
 <details><summary>YOUR ${escape(plan.roleLabel.toUpperCase())} CHECKLIST</summary><p>Use this on the work, not as another 30-day homework list.</p><ul>${plan.checklist.map(x=>`<li>${escape(x)}</li>`).join('')}</ul></details>
 <details><summary>${escape(plan.tool.title)}</summary><p>Use one real appointment, assignment, workday, or pay period. Keep every number about that same piece of work.</p><form id="next30-workmath">${number('earned',plan.tool.earnedLabel,'required')}${plan.tool.share?number('share','What percentage of the service money do you receive? Enter 100 if you keep it before costs.','required max="100"'):''}${number('costs',plan.tool.costLabel,'required')}${number('hours',plan.tool.hoursLabel,'required min="0.01"')}<button type="submit" class="primary">SHOW ME WHAT THE WORK LEFT →</button></form><div id="next30-work-result" role="status"></div><p class="fine">${escape(plan.tool.warning)} Use 0 only when the cost really is zero. Leave the form unfinished if you need to check a number.</p></details>
 <details><summary>YOUR 30-DAY SCORECARD</summary><p>Compare the same length of time and similar work. Leave a blank if you do not know yet. A change is evidence to investigate, not proof that the plan caused it.</p>${metricRows}<button class="primary" type="button" id="next30-score">SHOW ME WHAT CHANGED →</button><p id="next30-score-status" role="status"></p></details>
 <details><summary>DID THIS EARN BACK WHAT YOU PAID?</summary><p>Compare money actually kept before and after the change you tried. Use similar work and equal time periods. Leave out money that was only invoiced, reimbursed, or passed to someone else. This is your estimate of the change, not a promise or proof of cause.</p><form id="next30-value">${number('extra','Change in money kept before the extra costs below. Use a negative number if it fell.','required data-negative')}${number('implementation','Extra costs of trying the change, not already deducted above','required')}${number('price','What you paid for this plan','required min="0.01"')}<button class="primary" type="submit">CHECK THE VALUE →</button></form><p id="next30-value-result" role="status"></p><h3>WHAT WOULD BREAK EVEN?</h3><p>Use an extra amount you could realistically keep per additional booking, assignment, or pay increase. This is a scenario, not a forecast.</p><form id="next30-break-even">${number('perwin','Extra money kept per additional booking or other paid improvement','required min="0.01"')}<button class="secondary" type="submit">SHOW THE BREAK-EVEN COUNT →</button></form><p id="next30-break-result" role="status"></p></details>
 <details><summary>WHAT ELSE YOUR ANSWERS TELL US</summary><p>Keep these nearby. Work the main plan first.</p>${plan.supporting.map(x=>`<section class="card"><h3>${escape(x.title)}</h3><p><strong>You said:</strong> ${escape(x.answer)}</p><p>${escape(x.action)}</p></section>`).join('')}</details>
 <details><summary>IF IT GETS STUCK</summary>${plan.rescue.map(x=>`<div class="card"><h3>${escape(x.title)}</h3><p>${escape(x.body)}</p></div>`).join('')}</details>
 ${plan.secondary.length?`<details><summary>THE OTHER PARTS OF YOUR CAREER</summary><p>This plan focuses on ${escape(plan.roleLabel.toLowerCase())}. Save it, then build a separate plan for another lane without buying again.</p>${plan.secondary.map(x=>`<div class="card"><h3>${escape(x.label)}</h3><p>${escape(x.first)}</p><button class="secondary" type="button" data-next30-lane="${x.role}">BUILD THIS PLAN →</button></div>`).join('')}</details>`:''}
 <div class="card"><h3>KEEP THIS. COME BACK WITH RECEIPTS.</h3><p>Your answers, checklist, and tools stay in this browser session. Download a plan file to bring them back later or on another device after opening your purchase link.</p><div class="actions"><button type="button" class="primary" id="next30-save-file">SAVE MY PLAN FILE →</button><button type="button" class="secondary" id="next30-save-text">SAVE A READABLE COPY →</button><button type="button" class="secondary" id="next30-print">PRINT MY PLAN</button><button type="button" class="secondary" id="next30-edit">EDIT MY ANSWERS</button></div><p id="next30-storage-status" role="status"></p></div>${next30ImportControl()}`;
 next30BindPlan(plan,key);
}
function next30Remember(){
 const data=next30Ensure();if(!BookedNext30.complete(data.answers))return;
 const role=BookedNext30.primary(data.answers),goal=BookedNext30.goalFor(data.answers),id=role+'-'+goal;
 const record={id,role,goal,answers:JSON.parse(JSON.stringify(data.answers)),date:new Date().toISOString()};
 data.savedPlans=[record,...data.savedPlans.filter(x=>x.id!==id)].slice(0,10);
}
function next30BindPlan(plan,key){
 const data=next30Ensure(),$=id=>document.getElementById(id),money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
 const progress=()=>{const all=[...app.querySelectorAll('[data-next30-task]')];$('next30-progress').textContent=all.filter(x=>x.checked).length+' of '+all.length+' weekly tasks complete.'};
 app.querySelectorAll('[data-next30-task]').forEach(el=>el.onchange=()=>{data.checks[el.dataset.next30Task]=el.checked;next30Save();progress()});progress();
 app.querySelectorAll('[data-next30-copy]').forEach(el=>el.onclick=async()=>{
  const copy=plan.scripts[Number(el.dataset.next30Copy)][1];
  try{await navigator.clipboard.writeText(copy);$('next30-copy-status').textContent='Copied. Make it yours.'}catch(e){$('next30-copy-status').textContent='Select the script above and copy it. Your browser did not allow automatic copying.'}
 });
 const toolIds=['earned','share','costs','hours','extra','implementation','price','perwin'];
 for(const id of toolIds){const el=$('n30-'+id);if(el)el.oninput=()=>{data.tools[key+'-'+id]=el.value;next30Save()}}
 const numeric=id=>{const el=$('n30-'+id);return el&&el.value.trim()!==''?Number(el.value):NaN};
 $('next30-workmath').onsubmit=e=>{
  e.preventDefault();if(!e.currentTarget.reportValidity())return;
  const result=BookedNext30.workMath({earned:numeric('earned'),costs:numeric('costs'),hours:numeric('hours'),share:plan.tool.share?numeric('share'):100});
  if(!result){$('next30-work-result').textContent='Check the pay, costs, and hours. We need real numbers before we do the math.';return}
  const noun=plan.role==='owner'?'The entered salon income leaves':'The entered work leaves';
  $('next30-work-result').innerHTML='<h3>'+noun+' '+money(result.left)+'.</h3><p>That is '+money(result.perHour)+' per required work hour, using the pay split and costs entered.</p><p class="fine">'+next30Escape(plan.tool.warning)+'</p>';
  next30Save();
 };
 for(const metric of plan.metrics)for(const phase of ['base','now'])$('n30-'+phase+'-'+metric.id).oninput=e=>{data.metrics[key+'-'+phase+'-'+metric.id]=e.target.value;next30Save()};
 $('next30-score').onclick=()=>{
  let compared=0;
  for(const metric of plan.metrics){
   const before=$('n30-base-'+metric.id).value,after=$('n30-now-'+metric.id).value,out=$('n30-delta-'+metric.id);
   if(before===''||after===''){out.textContent='Add both numbers when you have them. We are not turning a blank into zero.';continue}
   const b=Number(before),a=Number(after);if(!Number.isFinite(b)||!Number.isFinite(a)||a<0||b<0){out.textContent='Use zero or a positive number.';continue}
   const delta=a-b,formatted=metric.unit==='money'?money(Math.abs(delta)):String(Number(Math.abs(delta).toFixed(2)));
   out.textContent=delta===0?'No change in the numbers entered.':formatted+' '+(delta>0?'more':'less')+(metric.unit==='hours'?' hours':'')+' than the starting point.';
   if(metric.better==='context')out.textContent+=' Read this alongside the results, not on its own.';
   if(metric.id==='hours')out.textContent+=' Check pay alongside hours before calling this a win.';
   compared++;
  }
  $('next30-score-status').textContent=compared?'Use comparable time periods. Keep a useful change; investigate a result that moved the wrong way.':'Add a before and after number when you have them.';
  next30Save();
 };
 $('next30-value').onsubmit=e=>{
  e.preventDefault();if(!e.currentTarget.reportValidity())return;
  const value=BookedNext30.valueMath({additionalKept:numeric('extra'),extraCosts:numeric('implementation'),price:numeric('price')});
  if(!value){$('next30-value-result').textContent='Enter the extra money, extra costs, and what you paid. Use zero only when it really is zero.';return}
  $('next30-value-result').textContent='Your entered change leaves '+money(value.benefit)+' after the extra costs. After the plan purchase, that is '+money(value.afterPurchase)+'. '+(value.breakEven?'On these inputs, the purchase cost has been covered.':'On these inputs, the purchase cost has not been covered yet.')+' This uses your estimate; it does not establish what caused the change.';
  next30Save();
 };
 $('next30-break-even').onsubmit=e=>{
  e.preventDefault();if(!e.currentTarget.reportValidity())return;
  const price=numeric('price'),amount=numeric('perwin'),count=BookedNext30.breakEven(amount,price);
  $('next30-break-result').textContent=count===null?'Enter a positive amount and the price you paid above.':count+' additional paid improvement'+(count===1?'':'s')+' at '+money(amount)+' kept each would cover '+money(price)+'. This is a break-even scenario, not an income forecast.';
  next30Save();
 };
 $('next30-save-file').onclick=()=>{next30Remember();next30Download('BOOKED-AF-'+plan.role+'-plan.json',JSON.stringify(data,null,2),'application/json')};
 $('next30-save-text').onclick=()=>next30Download('BOOKED-AF-'+plan.role+'-plan.txt',next30PlanText(plan),'text/plain;charset=utf-8');
 $('next30-print').onclick=()=>{
  const closed=[...app.querySelectorAll('details:not([open])')];closed.forEach(el=>el.open=true);
  const restore=()=>{closed.forEach(el=>el.open=false);window.removeEventListener('afterprint',restore)};
  window.addEventListener('afterprint',restore);window.print();
 };
 $('next30-edit').onclick=()=>{data.editAll=true;data.currentId='careers';state.view='deepintake';render()};
 app.querySelectorAll('[data-next30-lane]').forEach(el=>el.onclick=()=>{
  next30Remember();data.answers.primary=el.dataset.next30Lane;data.answers=BookedNext30.cleanAnswers(data.answers);data.currentId=null;data.editAll=false;next30Save();state.view='deepintake';render();
 });
 if(data.savedPlans.length>1){
  const section=document.createElement('details');
  section.innerHTML='<summary>YOUR SAVED PLANS IN THIS SESSION</summary><p>Keep separate plans for different parts of your career.</p>'+data.savedPlans.filter(x=>x.id!==key).map(x=>'<button type="button" class="secondary" data-next30-restore="'+next30Escape(x.id)+'">'+next30Escape(BookedNext30.roles[x.role]?.label||'Saved plan')+' →</button>').join('');
  app.append(section);section.querySelectorAll('[data-next30-restore]').forEach(el=>el.onclick=()=>{const record=data.savedPlans.find(x=>x.id===el.dataset.next30Restore);if(!record)return;next30Remember();data.answers=BookedNext30.cleanAnswers(record.answers);data.carried={};data.currentId=null;data.editAll=false;next30Save();render()});
 }
 next30BindImport();
 if(!next30Save())$('next30-storage-status').textContent='This browser cannot save the session. Download your plan file now to keep your work.';
}
