/* P02: approved lesson, service-specific return windows, and local-only tracking. */
(function(root){
  'use strict';
  var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
  var text=function(v,n){return typeof v==='string'?v.slice(0,n||200):''};
  var number=function(v){return v==null||String(v).trim()===''?null:Number.isFinite(Number(v))?Number(v):null};
  function day(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return null;var d=new Date(s+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s?d.getTime()/86400000:null}
  function today(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  var fields=['client','guest','service','source','visit','minWeeks','maxWeeks','recommended','eligible','rebooked','nextDate','cancelled','returned','returnDate','reason'];
  function cleanRow(input){var row={};fields.concat(['id']).forEach(function(k){row[k]=text(input&&input[k],k==='reason'?500:200)});return row}
  function clean(input){input=input&&typeof input==='object'?input:{};return {rows:Array.isArray(input.rows)?input.rows.slice(0,500).map(cleanRow):[],draft:cleanRow(input.draft),editing:text(input.editing),asOf:day(input.asOf)!==null?input.asOf:today(),unit:input.unit==='slots'?'slots':'hours',coverage:input.coverage&&typeof input.coverage==='object'?input.coverage:{},checks:input.checks&&typeof input.checks==='object'?input.checks:{}}}
  function validate(row,asOf){
    var v=day(row.visit),a=day(asOf),min=number(row.minWeeks),max=number(row.maxWeeks);
    if(!row.client.trim()||!row.service.trim()||!['new','existing'].includes(row.guest))return 'Add an anonymous client ID, guest type, and service.';
    if(v===null||a===null||v>a)return 'Use a completed visit date on or before the review date.';
    if(row.eligible==='yes'&&(min===null||max===null||min<=0||max<min))return 'Enter that service’s minimum and latest reasonable return windows in weeks. The latest window must be at least the minimum.';
    if(!['yes','no'].includes(row.eligible))return 'Confirm whether this visit is eligible for a maintenance recommendation.';
    for(var k of ['recommended','rebooked','cancelled','returned'])if(!['yes','no','unknown'].includes(row[k]))return 'Choose yes, no, or not known for each outcome.';
    if(row.rebooked==='yes'&&(day(row.nextDate)===null||day(row.nextDate)<=v))return 'For a prebooked visit, add the next appointment date after the original visit.';
    if(row.returned==='yes'&&(day(row.returnDate)===null||day(row.returnDate)<=v||day(row.returnDate)>a))return 'Add the actual return date after the original visit and on or before the review date.';
    return '';
  }
  function latest(rows,key){var out=new Map();rows.forEach(function(r){var k=key(r),old=out.get(k);if(!old||day(r.visit)>=day(old.visit))out.set(k,r)});return Array.from(out.values())}
  function ratio(n,d){return {n:n,d:d,pct:d?100*n/d:null}}
  function summarize(rows,asOf){
    var a=day(asOf),valid=rows.filter(function(r){return !validate(r,asOf)}),eligible=valid.filter(function(r){return r.eligible==='yes'});
    var booking=eligible.filter(function(r){return r.rebooked!=='unknown'});
    var clients=latest(eligible,function(r){return r.client.trim().toLowerCase()});
    var matured=latest(eligible.filter(function(r){return day(r.visit)+Math.ceil(Number(r.maxWeeks)*7)<a}),function(r){return r.client.trim().toLowerCase()});
    var known=matured.filter(function(r){return r.returned!=='unknown'});
    var returned=known.filter(function(r){var d=day(r.returnDate),v=day(r.visit);return r.returned==='yes'&&d>=v+Math.ceil(Number(r.minWeeks)*7)&&d<=v+Math.ceil(Number(r.maxWeeks)*7)});
    var due=valid.filter(function(r){return r.rebooked==='yes'&&day(r.nextDate)<=a});
    var cancelKnown=due.filter(function(r){return r.cancelled!=='unknown'});
    return {rebooking:ratio(booking.filter(function(r){return r.rebooked==='yes'}).length,booking.length),retention:ratio(returned.length,known.length),cancellations:ratio(cancelKnown.filter(function(r){return r.cancelled==='yes'}).length,cancelKnown.length),pending:clients.filter(function(r){return day(r.visit)+Math.ceil(Number(r.maxWeeks)*7)>=a}).length,unknownReturns:matured.length-known.length,unknownBookings:eligible.length-booking.length,unknownCancellations:due.length-cancelKnown.length,invalid:rows.length-valid.length};
  }
  function stats(rows,asOf){
    function groups(key){var names=Array.from(new Set(rows.map(function(r){return r[key]||'Not recorded'})));return names.map(function(name){return {name:name,result:summarize(rows.filter(function(r){return (r[key]||'Not recorded')===name}),asOf)}})}
    return {overall:summarize(rows,asOf),service:groups('service'),guest:groups('guest'),source:groups('source')};
  }
  function coverage(c){
    var total=number(c.total),blocked=number(c.blocked),returning=number(c.returning),newClients=number(c.newClients);
    if([total,blocked,returning,newClients].some(function(v){return v===null}))return {error:'Enter all four amounts. Leave an unknown blank; enter 0 only when it is zero.'};
    if([total,blocked,returning,newClients].some(function(v){return v<0})||blocked>total)return {error:'Use zero or positive amounts, with blocked time no higher than planned capacity.'};
    var available=total-blocked;
    if(returning+newClients>available)return {error:'Booked amounts are higher than realistic bookable capacity. Check the entries.'};
    if(available===0)return {error:'There is no bookable capacity in this period. A coverage percentage does not apply.'};
    return {available:available,returning:100*returning/available,total:100*(returning+newClients)/available,remaining:available-returning-newClients};
  }
  var scripts=[
    ['Standard maintenance recommendation','“To keep this looking like this, I’d see you again in about [window]. Let’s get that on the calendar while we’re here so you have a time that works for you.”'],
    ['Client not ready to choose a date','“No problem. Your ideal window is around [date/window]. I’ll make a note of it so you know when to start looking at your calendar.”'],
    ['Budget-sensitive maintenance','“If doing the full [service] every [interval] feels like too much, we can build a lower-maintenance plan instead. I’d rather adjust the service than have you feel like you need to disappear for six months.”'],
    ['First-time guest follow-up','“Hi [Name] — it was great meeting you [day]. I wanted to make sure your [result/service] is settling in the way we planned. Your ideal maintenance window is around [time]. If anything feels off before then, let me know.”'],
    ['Overdue guest reactivation','“Hey [Name] — you’re coming up past the usual maintenance window for your [service]. If you’ve been meaning to get it refreshed, I have [general availability] coming up and would be happy to get you back in.”'],
    ['Schedule migration','“I’m tightening up my schedule and moving some of my regular appointments into [day/block]. Your usual [service] timing would fit really well there. Before your next appointment, I wanted to see whether [two options] could work for you.”']
  ];
  var lesson=`You are not proposing marriage.

You are telling someone when their hair is probably going to need to be done again.

If they need six weeks, say six weeks.

If they need twelve, say twelve.

What I do not want is this weird checkout moment where you suddenly get shy and say, “Do you maybe want to book something sometime?”

You are the professional.

Recommend the timing.

The client can still say no.

There are two numbers I want you to understand here.

Rebooking means they leave with another appointment booked.

Retention means they actually come back.

Those are not always the same thing.

Somebody can rebook and cancel later.

Somebody else can refuse to prebook and still come back every ten weeks for five years.

So I care about both.

The easiest way to make rebooking feel less awkward is to stop treating it like something you suddenly sell at checkout.

Talk about maintenance while you are already talking about the hair.

If the client covers gray and you know it starts bothering them around five weeks, tell them that.

If they only need a big blonding appointment a few times a year but should gloss in between, explain that.

If they wear extensions and they need to be moved up, that is part of the service plan.

Then the end of the appointment is easy.

“To keep this looking like this, I would see you again in about eight weeks. Let’s get that on the calendar while we are here.”

That is not pushy.

It is clear.

And the timing has to be honest.

If somebody can go twelve weeks, do not tell them eight because you are trying to fill your book.

That is short-term thinking and people can feel it.

I would rather have a client trust you for years than squeeze one extra appointment out of them this year.

Budget matters too.

If the ideal maintenance plan is too expensive for the client, do not quietly discount the exact same work.

Change the plan.

Maybe you alternate a full service with a smaller one.

Maybe you change the placement so it grows out better.

Maybe you stretch the big appointment and do something simple in between.

Give them a plan they can actually live with.

Then make the next step easy.

Recommend the window.

Offer a couple of dates if you can.

Book it.

Send normal reminders.

Do not make the client remember everything by themselves and then act surprised when they disappear.

For the next 10 to 20 clients, I want you to track three things:

What service did they get?

Did you recommend when to come back?

Did they actually come back when it made sense for that service?

That is where the useful information starts.

Maybe people happily rebook but later cancel.

Then your issue may not be rebooking at all.

Maybe nobody rebooks because you never tell them when they should come back.

Maybe your new clients come from a source that does not produce very loyal clients.

Maybe the experience or price does not match what they expected.

The point is that I do not want you solving the wrong problem.

Look ahead at your calendar too.

If you are slammed this week but six weeks from now the calendar is almost empty, your current demand is not turning into future demand.

That is worth knowing.

You do not need every client to prebook forever.

You need an honest maintenance recommendation, an easy booking process, and a clear idea of whether people actually return.

Recommend the right timing.

Explain why.

Make it easy.

Then watch what actually happens.`;
  function input(id,label,value,type,help){return '<div class="n30-field"><label for="'+id+'">'+esc(label)+'</label><input class="input" id="'+id+'" type="'+(type||'text')+'" '+(type==='number'?'step="any" inputmode="decimal"':'maxlength="200"')+' value="'+esc(value==null?'':value)+'">'+(help?'<p class="fine">'+esc(help)+'</p>':'')+'</div>'}
  function select(id,label,value,choices){return '<div class="n30-field"><label for="'+id+'">'+esc(label)+'</label><select class="input" id="'+id+'"><option value="">Choose one</option>'+choices.map(function(c){return '<option value="'+c[0]+'" '+(value===c[0]?'selected':'')+'>'+esc(c[1])+'</option>'}).join('')+'</select></div>'}
  var yesno=[['yes','Yes'],['no','No'],['unknown','Not known yet']];
  function rate(r){return r.pct===null?'Not known yet':r.pct.toFixed(1)+'% ('+r.n+' of '+r.d+')'}
  function resultHTML(s){var x=s.overall;return '<div class="grid2"><div class="card"><h3>REBOOKING</h3><p>'+rate(x.rebooking)+'</p><p class="fine">Eligible completed visits with a known booking outcome.</p></div><div class="card"><h3>ACTUAL RETURN</h3><p>'+rate(x.retention)+'</p><p class="fine">Unique clients with a fully matured window and known outcome. The latest matured visit for each client is used.</p></div></div><p>'+x.pending+' clients still inside their maintenance window. '+x.unknownReturns+' matured outcomes not known. Neither is counted as a failure.</p><p>Prebook cancellation/no-show rate: '+rate(x.cancellations)+'. Only prebooked appointments already due with a known outcome are counted.</p><p class="fine">'+x.unknownBookings+' booking outcomes and '+x.unknownCancellations+' due cancellation outcomes not known. '+x.invalid+' incomplete or invalid rows excluded. Percentages describe this sample; there is no universal passing score.</p>'+['service','guest','source'].map(function(k){return '<details class="card"><summary>COMPARE BY '+({service:'SERVICE',guest:'NEW / EXISTING GUEST',source:'CLIENT SOURCE'})[k]+'</summary>'+s[k].map(function(g){return '<h3>'+esc(g.name)+'</h3><p>Rebooking: '+rate(g.result.rebooking)+'. Actual return: '+rate(g.result.retention)+'.</p>'}).join('')+'</details>'}).join('')}
  var weeks=[['Week 1 · Find the baseline','Track 10–20 completed visits. Record the service, maintenance recommendation, and booking outcome.'],['Week 2 · Make the recommendation clear','Use the service-specific window and an honest reason. Make booking easy; let clients choose.'],['Week 3 · Look ahead','Review 4, 8, and 12 weeks of returning-client coverage. Keep planned breaks out of bookable capacity.'],['Week 4 · Find the miss','Check known return outcomes, cancellations, service expectations, budget, and source. A low prebooking rate alone does not prove a problem.']];
  function html(data){
    data.shell.rebooking=clean(data.shell.rebooking);var p=data.shell.rebooking,d=p.draft;
    return '<section class="card" id="rebooking-path"><div class="number">NEXT PATH · REBOOKING WITHOUT BEGGING</div><h2>GIVE GOOD WORK A NEXT APPOINTMENT.</h2><p>Start with the next 10 clients. Recommend honest maintenance timing and record what actually happens. A booked appointment and a returned client are different things.</p><details class="card"><summary>READ THE LESSON</summary>'+lesson.split('\n\n').map(function(x){return '<p>'+esc(x)+'</p>'}).join('')+'</details><details class="card"><summary>6 CLIENT CONVERSATIONS</summary>'+scripts.map(function(s){return '<h3>'+esc(s[0])+'</h3><p>'+esc(s[1])+'</p>'}).join('')+'<p>Replace the brackets with real details. Offer a reminder only if you actually use one. Adjust the service for budget; don’t quietly discount identical work. Recommend honest timing and let clients book later if they prefer.</p></details>'+weeks.map(function(w,i){return '<label class="checkline"><input type="checkbox" data-p02-week="'+i+'" '+(p.checks[i]?'checked':'')+'><span><strong>'+w[0]+'</strong><br>'+w[1]+'</span></label>'}).join('')+'</section>'
      +'<section class="card" id="rebooking-tracker"><div class="number">YOUR TOOL</div><h2>REBOOKING & RETENTION TRACKER</h2><p>Use an anonymous ID, not client contact details. Entries stay in this browser. Reuse the same ID for the same client; percentages use known outcomes and the right service window.</p>'+input('p02-asof','Review outcomes through this date',p.asOf,'date')+'<div id="p02-summary" aria-live="polite">'+resultHTML(stats(p.rows,p.asOf))+'</div><form id="p02-form" novalidate><h3>'+(p.editing?'UPDATE A VISIT':'ADD A COMPLETED VISIT')+'</h3><div class="grid2">'
      +input('p02-client','Anonymous client ID',d.client)+select('p02-guest','Guest type',d.guest,[['new','New'],['existing','Existing']])+input('p02-service','Service category',d.service)+input('p02-source','Original client source (optional)',d.source)+input('p02-visit','Completed visit date',d.visit,'date')
      +input('p02-minWeeks','Earliest reasonable return (weeks)',d.minWeeks,'number','Use the service and client’s actual maintenance plan.')+input('p02-maxWeeks','Latest reasonable return (weeks)',d.maxWeeks,'number','A client is not included in retention until this window has fully passed.')
      +select('p02-eligible','Eligible for maintenance / return tracking?',d.eligible,[['yes','Yes'],['no','No · one-time work / not applicable']])+select('p02-recommended','Did you recommend maintenance timing?',d.recommended,yesno)+select('p02-rebooked','Booked before leaving?',d.rebooked,yesno)+input('p02-nextDate','Next appointment date, if prebooked',d.nextDate,'date')+select('p02-cancelled','Prebook cancelled or no-showed?',d.cancelled,yesno)+select('p02-returned','Has the client actually returned?',d.returned,yesno)+input('p02-returnDate','Actual return date, if returned',d.returnDate,'date')+input('p02-reason','Reason for not rebooking / notes (optional)',d.reason)
      +'</div><button type="submit" class="primary">'+(p.editing?'UPDATE VISIT':'SAVE VISIT')+'</button> <button type="button" class="secondary" id="p02-new">START A NEW ROW</button><p id="p02-status" role="status"></p></form><div id="p02-rows">'+p.rows.map(function(r){return '<details class="card"><summary>'+esc(r.client)+' · '+esc(r.service)+' · '+esc(r.visit)+'</summary><p>Rebooked: '+esc(r.rebooked)+'. Actual return: '+esc(r.returned)+(r.returnDate?' on '+esc(r.returnDate):'')+'.</p><button type="button" class="secondary" data-p02-edit="'+esc(r.id)+'">EDIT</button> <button type="button" class="secondary" data-p02-delete="'+esc(r.id)+'">REMOVE ROW</button></details>'}).join('')+'</div><button type="button" class="secondary" id="p02-export">DOWNLOAD MY TRACKER · CSV</button></section>'
      +'<section class="card" id="future-book-coverage"><div class="number">LOOK AHEAD</div><h2>FUTURE BOOK COVERAGE</h2><p>Use cumulative totals for the next 4, 8, and 12 weeks. Breaks, vacation, education, and admin time are not empty appointment space.</p>'+select('p02-unit','Measure all periods in',p.unit,[['hours','Hours'],['slots','Appointment slots']])+'<p class="fine">Changing units starts a new coverage check so hours and slots are never mixed.</p>'+[4,8,12].map(function(h){var c=p.coverage[h]||{};return '<div class="card"><h3>NEXT '+h+' WEEKS</h3><div class="grid2">'+input('p02-cov-'+h+'-total','Total planned capacity ('+p.unit+')',c.total,'number')+input('p02-cov-'+h+'-blocked','Intentionally blocked / non-bookable ('+p.unit+')',c.blocked,'number')+input('p02-cov-'+h+'-returning','Booked returning clients ('+p.unit+')',c.returning,'number')+input('p02-cov-'+h+'-newClients','Booked new clients ('+p.unit+')',c.newClients,'number')+'</div><p id="p02-cov-result-'+h+'" role="status"></p></div>'}).join('')+'<button type="button" class="primary" id="p02-cov-calc">CHECK MY FUTURE BOOK →</button><p>No universal target. Compare this with your service cadence, career stage, and the room you want for new clients. A low number alone does not prove a rebooking problem.</p></section>';
  }
  function csv(rows){return [fields].concat(rows.map(function(r){return fields.map(function(k){return r[k]})})).map(function(row){return row.map(function(v){v=String(v||'');if(/^[\s]*[=+\-@]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'}).join(',')}).join('\r\n')}
  function bind(data,render){
    var p=data.shell.rebooking,$=function(id){return document.getElementById(id)};
    function save(){var ok=root.next30Save();if(!ok&&$('p02-status'))$('p02-status').textContent='This browser couldn’t save. Download your tracker before closing.';return ok}
    function capture(){fields.forEach(function(k){p.draft[k]=$('p02-'+k).value.trim()});save()}
    fields.forEach(function(k){$('p02-'+k).oninput=capture});
    $('p02-asof').onchange=function(){if(day(this.value)===null)return;p.asOf=this.value;save();$('p02-summary').innerHTML=resultHTML(stats(p.rows,p.asOf))};
    $('p02-form').onsubmit=function(event){event.preventDefault();capture();var row=cleanRow(p.draft),error=validate(row,p.asOf);if(error){$('p02-status').textContent=error;return}
      if(!p.editing&&p.rows.length>=500){$('p02-status').textContent='Download your tracker before starting a new set. This tracker holds 500 visits.';return}
      row.id=p.editing||'visit-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);var i=p.rows.findIndex(function(r){return r.id===p.editing});if(i>=0)p.rows[i]=row;else p.rows.push(row);p.draft=cleanRow({});p.editing='';var ok=save();render();$('p02-status').textContent=ok?'Visit saved on this device.':'This browser couldn’t save. Download your tracker before closing.';
    };
    $('p02-new').onclick=function(){p.draft=cleanRow({});p.editing='';save();render()};
    document.querySelectorAll('[data-p02-edit]').forEach(function(b){b.onclick=function(){var row=p.rows.find(function(r){return r.id===b.dataset.p02Edit});p.draft=cleanRow(row);p.editing=row.id;save();render();$('p02-client').focus()}});
    document.querySelectorAll('[data-p02-delete]').forEach(function(b){b.onclick=function(){p.rows=p.rows.filter(function(r){return r.id!==b.dataset.p02Delete});if(p.editing===b.dataset.p02Delete){p.editing='';p.draft=cleanRow({})}save();render()}});
    document.querySelectorAll('[data-p02-week]').forEach(function(b){b.onchange=function(){p.checks[b.dataset.p02Week]=b.checked;save()}});
    $('p02-export').onclick=function(){root.next30Download('BOOKED-AF-Rebooking-Tracker.csv',csv(p.rows),'text/csv;charset=utf-8')};
    $('p02-unit').onchange=function(){p.unit=this.value==='slots'?'slots':'hours';p.coverage={};save();render()};
    [4,8,12].forEach(function(h){['total','blocked','returning','newClients'].forEach(function(k){$('p02-cov-'+h+'-'+k).oninput=function(){if(!p.coverage[h])p.coverage[h]={};p.coverage[h][k]=this.value.trim();save();$('p02-cov-result-'+h).textContent=''}})});
    function showCoverage(){[4,8,12].forEach(function(h){var r=coverage(p.coverage[h]||{});$('p02-cov-result-'+h).textContent=r.error||('Returning-client coverage: '+r.returning.toFixed(1)+'%. Total booked coverage: '+r.total.toFixed(1)+'%. '+r.remaining+' '+p.unit+' still bookable. Planned breaks are excluded.')})}
    $('p02-cov-calc').onclick=showCoverage;
    if(Object.keys(p.coverage).length)showCoverage();
  }
  var api={clean:clean,validate:validate,stats:stats,coverage:coverage,html:html,bind:bind,csv:csv};
  root.BookedRebooking=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
