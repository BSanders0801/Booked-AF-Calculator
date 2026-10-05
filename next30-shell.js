/* BOOKED AF — YOUR NEXT 30 Day 0 shell + P04 Money Map */
(function(){
  var KEY='booked-af-career-next30-v2';
  var LEGACY='booked-af-career-next30-v1';
  var oldPlan=window.renderCareerPlan;

  function e(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function cash(v){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(v)}
  function num(obj,k){var v=obj&&obj[k];if(v===undefined||v===null||String(v).trim()==='')return null;v=Number(v);return Number.isFinite(v)?v:null}
  function clean(o){var out={};if(!o||typeof o!=='object')return out;Object.keys(o).slice(0,60).forEach(function(k){var v=o[k];if(typeof v==='string'&&v.length<=40)out[k]=v});return out}
  function shell(input){
    input=input&&typeof input==='object'?input:{};
    var m=input.moneyMap&&typeof input.moneyMap==='object'?input.moneyMap:{};
    return {
      startedAt:typeof input.startedAt==='string'?input.startedAt:null,
      phase:typeof input.phase==='string'?input.phase:'day0',
      day0Complete:!!input.day0Complete,
      numberPlanner:input.numberPlanner&&typeof input.numberPlanner==='object'?input.numberPlanner:{},
      dayValue:input.dayValue&&typeof input.dayValue==='object'?input.dayValue:{},
      demandSprint:input.demandSprint&&typeof input.demandSprint==='object'?input.demandSprint:{},
      nextPath:typeof input.nextPath==='string'?input.nextPath:'',
      review:input.review&&typeof input.review==='object'?input.review:{},
      rebooking:window.BookedRebooking?BookedRebooking.clean(input.rebooking):{},
      moneyMap:{
        payType:['employee','self','mixed'].indexOf(m.payType)>=0?m.payType:'',
        employee:clean(m.employee),
        self:clean(m.self),
        lanes:Array.isArray(m.lanes)?m.lanes.slice(0,6):[],
        result:m.result&&typeof m.result==='object'?m.result:null
      }
    };
  }
  function infer(data,plan){
    var a=data.answers&&data.answers[plan.role+'_pay'];
    if(a==='self')return 'self';
    if(a==='mixed')return 'mixed';
    if(a==='commission'||a==='hourly')return 'employee';
    return '';
  }
  window.next30Ensure=function(){
    if(state.careerData){
      state.careerData.shell=shell(state.careerData.shell);
      return state.careerData;
    }
    var saved=null;
    try{saved=JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){}
    if(!saved){try{saved=JSON.parse(sessionStorage.getItem(LEGACY)||'null')}catch(_){}}
    var carried=BookedNext30.seed(state.schema===SHORT_SCHEMA?state.answers:{},state.deepAnswers);
    var answers=BookedNext30.cleanAnswers(saved&&saved.version===BookedNext30.VERSION?saved.answers:carried);
    state.careerData={
      version:BookedNext30.VERSION,
      answers:answers,
      carried:saved&&saved.version===BookedNext30.VERSION?BookedNext30.cleanAnswers(saved.carried):carried,
      currentId:saved&&typeof saved.currentId==='string'?saved.currentId:null,
      checks:next30NumericMap(saved&&saved.checks,true),
      metrics:next30NumericMap(saved&&saved.metrics),
      tools:next30NumericMap(saved&&saved.tools),
      savedPlans:next30SavedPlans(saved&&saved.savedPlans),
      shell:shell(saved&&saved.shell)
    };
    return state.careerData;
  };
  window.next30Save=function(){
    if(!state.careerData)return false;
    try{
      localStorage.setItem(KEY,JSON.stringify(state.careerData));
      sessionStorage.setItem(LEGACY,JSON.stringify(state.careerData));
      return true;
    }catch(_){return false}
  };

  function f(id,label,val,help,type){
    var attrs=type==='text'?'type="text" maxlength="200"':'type="number" inputmode="decimal" step="any"';
    return '<div class="n30-field"><label for="'+id+'">'+e(label)+'</label><input class="input" '+attrs+' id="'+id+'" value="'+e(val==null?'':val)+'"><p class="fine">'+e(help||'Leave blank if you do not know it yet. Enter 0 only when it is truly zero.')+'</p></div>';
  }
  var EMP=['service','gross','tips','bonus','benefits','taxes','other','net','days'];
  var SELF=['payments','refunds','direct','rent','processing','software','insurance','payroll','marketing','other','reserve','days'];

  function employeeFields(v,p){
    p=p||'mmm-emp-';
    return f(p+'service','Service sales you produced this month',v.service,'Optional context. This is not automatically your pay.')
      +f(p+'gross','Gross wages / commission before taxes',v.gross,'Use the amount you were paid before personal taxes and deductions.')
      +f(p+'tips','Additional tips',v.tips,'Only include tips not already included in gross pay. Enter 0 if none.')+f(p+'bonus','Additional bonuses / incentives',v.bonus,'Only include bonuses not already included in gross pay. Enter 0 if none.')
      +f(p+'benefits','Payroll deductions / benefits',v.benefits)+f(p+'taxes','Taxes withheld',v.taxes)
      +f(p+'other','Other payroll deductions',v.other)+f(p+'net','Net paycheck / take-home deposited',v.net,'Recommended if available.')
      +f(p+'days','Days worked this month',v.days,'Optional. Used only for a per-workday view.');
  }
  function selfFields(v,p){
    p=p||'mmm-self-';
    return f(p+'payments','Client payments collected',v.payments,'Use money actually collected for the month.')
      +f(p+'refunds','Refunds / chargebacks',v.refunds)+f(p+'direct','Direct service costs',v.direct,'Color, product, extension hair, and other direct costs you paid.')
      +f(p+'rent','Rent / suite / chair rent',v.rent)+f(p+'processing','Processing fees',v.processing)
      +f(p+'software','Booking / software',v.software)+f(p+'insurance','Insurance / licensing',v.insurance)
      +f(p+'payroll','Assistant / payroll',v.payroll)+f(p+'marketing','Marketing',v.marketing)
      +f(p+'other','Other operating expenses',v.other)+f(p+'reserve','Tax reserve you chose to set aside',v.reserve,'BOOKED AF does not assume a tax rate.')
      +f(p+'days','Days worked this month',v.days,'Optional. Used only for a per-workday view.');
  }
  function capture(prefix,keys){
    var o={};keys.forEach(function(k){var x=document.getElementById(prefix+k);if(x)o[k]=x.value.trim()});return o;
  }
  function empResult(v){
    var required={gross:'Gross wages / commission before taxes',tips:'Additional tips',bonus:'Additional bonuses / incentives'};
    var missing=Object.keys(required).filter(function(k){return num(v,k)===null}).map(function(k){return required[k]});
    if(missing.length)return {complete:false,missing:missing};
    var gross=num(v,'gross'),tips=num(v,'tips'),bonus=num(v,'bonus'),base=gross+tips+bonus;
    var net=num(v,'net'),benefits=num(v,'benefits'),taxes=num(v,'taxes'),other=num(v,'other'),estimate=false;
    var take=net;
    if(take===null&&benefits!==null&&taxes!==null&&other!==null){take=base-benefits-taxes-other;estimate=true}
    var service=num(v,'service'),days=num(v,'days'),warn=[];
    if(net!==null&&net>base)warn.push('Your net pay is higher than the gross pay entered. These numbers may be right, but please confirm them.');
    if(service!==null&&gross>0&&(service/gross>5||gross/service>1.5))warn.push('Your service-sales and pay numbers are far enough apart that it is worth confirming your entries.');
    return {complete:true,type:'employee',generated:service,baseline:base,takeHome:take,estimated:estimate,days:days,perDay:days&&days>0?base/days:null,warnings:warn};
  }
  function selfResult(v){
    var payments=num(v,'payments');if(payments===null)return {complete:false,missing:['Client payments collected']};
    var costKeys=['refunds','direct','rent','processing','software','insurance','payroll','marketing','other'];
    var missing=costKeys.filter(function(k){return num(v,k)===null});
    if(missing.length)return {complete:false,missing:missing};
    var refunds=num(v,'refunds'),rev=payments-refunds;
    var expenses=['direct','rent','processing','software','insurance','payroll','marketing','other'].reduce(function(s,k){return s+num(v,k)},0);
    var base=rev-expenses,reserve=num(v,'reserve'),days=num(v,'days');
    return {complete:true,type:'self',generated:rev,expenses:expenses,baseline:base,reserve:reserve,available:reserve===null?null:base-reserve,days:days,perDay:days&&days>0?base/days:null,warnings:[]};
  }
  function resultCard(r){
    if(!r||!r.complete){
      return '<div class="card"><div class="number">NOT DONE YET</div><h3>WE FOUND THE MISSING NUMBER.</h3><p>Check: '+e((r&&r.missing||[]).join(', '))+'.</p><p>Leave an unknown blank. Enter 0 only when it is truly zero.</p></div>';
    }
    if(r.type==='employee'){
      var generated=r.generated===null?'Service sales were not entered.':'Your chair produced about <strong>'+cash(r.generated)+'</strong> in service sales.';
      var take=r.takeHome===null?'Take-home was not entered or fully calculable.':(r.estimated?'Estimated take-home':'Take-home entered')+': <strong>'+cash(r.takeHome)+'</strong>.';
      return '<div class="card"><div class="number">YOUR MONEY MAP</div><h3>SIX FIGURES OF WHAT? NOW WE KNOW.</h3><p>'+generated+'</p><p>You were paid about <strong>'+cash(r.baseline)+'</strong> before personal taxes/deductions, including the tips and bonuses you entered. '+take+'</p>'+(r.perDay!==null?'<p>About <strong>'+cash(r.perDay)+'</strong> in pre-personal-tax career income per workday entered.</p>':'')+'<p><strong>'+cash(r.baseline)+'</strong> is the current planning baseline we will carry into YOUR NUMBER.</p>'+r.warnings.map(function(w){return '<p class="baf-note">'+e(w)+'</p>'}).join('')+'</div>';
    }
    if(r.type==='mixed'){
      return '<div class="card"><div class="number">YOUR MONEY MAP</div><h3>YOUR CAREER HAS MORE THAN ONE LANE.</h3><p>'+(r.generated===null?'Total sales are not available because a lane’s service sales were left blank.':'Across the completed lanes, the work generated about <strong>'+cash(r.generated)+'</strong>.')+' Your combined pre-personal-tax career-income baseline is about <strong>'+cash(r.baseline)+'</strong>.</p><p>Each lane stays separate underneath the combined number so revenue is not confused with what the career actually paid you.</p><p><strong>'+cash(r.baseline)+'</strong> is the planning baseline we will carry into YOUR NUMBER.</p>'+r.warnings.map(function(w){return '<p class="baf-note">'+e(w)+'</p>'}).join('')+'</div>';
    }
    return '<div class="card"><div class="number">YOUR MONEY MAP</div><h3>'+(r.baseline<0?'THIS NUMBER NEEDS ATTENTION. NOT PANIC.':'SIX FIGURES OF WHAT? NOW WE KNOW.')+'</h3><p>Clients paid your business about <strong>'+cash(r.generated)+'</strong>. The business costs you entered totaled about <strong>'+cash(r.expenses)+'</strong>.</p><p>That leaves approximately <strong>'+cash(r.baseline)+'</strong> before personal income taxes.</p>'+(r.reserve!==null?'<p>You chose to reserve <strong>'+cash(r.reserve)+'</strong> for taxes, leaving about <strong>'+cash(r.available)+'</strong> after that reserve.</p>':'')+(r.perDay!==null?'<p>About <strong>'+cash(r.perDay)+'</strong> before personal income taxes per workday entered.</p>':'')+'<p><strong>'+cash(r.baseline)+'</strong> is the business-planning baseline we will carry into YOUR NUMBER.</p></div>';
  }
  function laneCard(lane,i){
    lane=lane||{label:'Income lane '+(i+1),type:'self',fields:{}};
    var fields=lane.fields||{};
    return '<section class="card" data-lane="'+i+'"><div class="grid2"><div class="n30-field"><label>Lane name</label><input class="input" id="lane-label-'+i+'" value="'+e(lane.label||'Income lane '+(i+1))+'"></div><div class="n30-field"><label>How this lane pays you</label><select class="input" id="lane-type-'+i+'"><option value="employee" '+(lane.type==='employee'?'selected':'')+'>Salon / employer</option><option value="self" '+(lane.type==='self'?'selected':'')+'>Independent / self-employed</option></select></div></div><div class="grid2">'+(lane.type==='employee'?employeeFields(fields,'lane-'+i+'-emp-'):selfFields(fields,'lane-'+i+'-self-'))+'</div><button type="button" class="secondary" data-remove-lane="'+i+'">REMOVE THIS LANE</button></section>';
  }
  function mapHTML(s){
    var m=s.moneyMap;if(m.payType==='mixed'&&!m.lanes.length)m.lanes=[{label:'Income lane 1',type:'employee',fields:{}},{label:'Income lane 2',type:'self',fields:{}}];
    return '<section class="card" id="money-map"><div class="number">YOUR TOOL</div><h2>MONTHLY MONEY MAP</h2><p>Pick one recent month that’s finished and fairly normal. Pull your pay stubs, deposits, and business expenses. Leave anything you don’t know blank. Only enter zero if it really is zero.</p><div class="n30-field"><label for="mmm-pay-type">How do you get paid?</label><select class="input" id="mmm-pay-type"><option value="">Choose one</option><option value="employee" '+(m.payType==='employee'?'selected':'')+'>I work for a salon / employer</option><option value="self" '+(m.payType==='self'?'selected':'')+'>I rent, have a suite, or work for myself</option><option value="mixed" '+(m.payType==='mixed'?'selected':'')+'>I have more than one income lane</option></select></div>'
      +(m.payType==='employee'?'<div class="grid2">'+employeeFields(m.employee)+'</div>':'')
      +(m.payType==='self'?'<div class="grid2">'+selfFields(m.self)+'</div>':'')
      +(m.payType==='mixed'?'<div id="mmm-lanes">'+m.lanes.map(laneCard).join('')+'</div><button type="button" class="secondary" id="mmm-add-lane">ADD AN INCOME LANE</button>':'')
      +'<div class="actions"><button type="button" class="primary" id="mmm-calc" '+(m.payType?'':'disabled')+'>SHOW ME THE REAL NUMBER →</button></div><p class="fine">Your entries save on this device as you go.</p><div id="mmm-result">'+(m.result?resultCard(m.result):'')+'</div></section>';
  }
  function bind(data,plan){
    var s=data.shell,m=s.moneyMap,p=document.getElementById('mmm-pay-type');
    if(p)p.onchange=function(){m.payType=p.value;m.result=null;next30Save();render()};
    function saveBasic(){
      if(m.payType==='employee')m.employee=capture('mmm-emp-',EMP);
      if(m.payType==='self')m.self=capture('mmm-self-',SELF);
      next30Save();
    }
    if(m.payType==='employee')EMP.forEach(function(k){var x=document.getElementById('mmm-emp-'+k);if(x)x.oninput=saveBasic});
    if(m.payType==='self')SELF.forEach(function(k){var x=document.getElementById('mmm-self-'+k);if(x)x.oninput=saveBasic});
    if(m.payType==='mixed'){
      m.lanes.forEach(function(lane,i){
        var lab=document.getElementById('lane-label-'+i),typ=document.getElementById('lane-type-'+i);
        var keys=lane.type==='employee'?EMP:SELF,prefix=lane.type==='employee'?'lane-'+i+'-emp-':'lane-'+i+'-self-';
        function saveLane(){lane.label=lab.value.trim()||'Income lane '+(i+1);lane.fields=capture(prefix,keys);next30Save()}
        if(lab)lab.oninput=saveLane;
        keys.forEach(function(k){var x=document.getElementById(prefix+k);if(x)x.oninput=saveLane});
        if(typ)typ.onchange=function(){saveLane();lane.type=typ.value;lane.fields={};m.result=null;next30Save();render()};
      });
      document.querySelectorAll('[data-remove-lane]').forEach(function(b){b.onclick=function(){m.lanes.splice(Number(b.dataset.removeLane),1);m.result=null;next30Save();render()}});
      var add=document.getElementById('mmm-add-lane');if(add)add.onclick=function(){if(m.lanes.length<6)m.lanes.push({label:'Income lane '+(m.lanes.length+1),type:'self',fields:{}});m.result=null;next30Save();render()};
    }
    var calc=document.getElementById('mmm-calc');
    if(calc)calc.onclick=function(){
      var r=null;
      if(m.payType==='employee'){saveBasic();r=empResult(m.employee)}
      if(m.payType==='self'){saveBasic();r=selfResult(m.self)}
      if(m.payType==='mixed'){
        m.lanes.forEach(function(lane,i){
          var keys=lane.type==='employee'?EMP:SELF,prefix=lane.type==='employee'?'lane-'+i+'-emp-':'lane-'+i+'-self-';
          lane.fields=capture(prefix,keys);
          var lab=document.getElementById('lane-label-'+i);if(lab)lane.label=lab.value.trim()||'Income lane '+(i+1);
        });
        var rs=m.lanes.map(function(l){return l.type==='employee'?empResult(l.fields):selfResult(l.fields)});
        var bad=rs.findIndex(function(x){return !x.complete});
        r=bad>=0?{complete:false,missing:['Finish '+m.lanes[bad].label+' before combining the lanes.']}:{complete:true,type:'mixed',generated:rs.some(function(x){return x.generated===null})?null:rs.reduce(function(a,x){return a+x.generated},0),baseline:rs.reduce(function(a,x){return a+x.baseline},0),warnings:rs.reduce(function(a,x){return a.concat(x.warnings||[])},[])};
      }
      m.result=r;s.day0Complete=!!(r&&r.complete);if(s.day0Complete)s.phase='week1';next30Save();
      if(s.day0Complete){render();return}
      var out=document.getElementById('mmm-result');if(out)out.innerHTML=resultCard(r);
      var nxt=document.getElementById('next30-whats-next');if(nxt&&s.day0Complete)nxt.innerHTML='<h3>YOUR BASELINE IS SET.</h3><p>Next: YOUR NUMBER. We take the number you just found and put a real income goal, schedule, and life underneath it.</p>';
    };
    var edit=document.getElementById('next30-edit-answers');if(edit)edit.onclick=function(){data.editAll=true;data.currentId='careers';next30Save();state.view='deepintake';render()};
  }

  function numberPlannerHTML(s){
    if(!s.day0Complete)return '';
    var n=s.numberPlanner||{},base=s.moneyMap.result&&s.moneyMap.result.complete?s.moneyMap.result.baseline:null;
    if((n.currentMonthly===undefined||n.currentMonthly==='')&&base!==null)n.currentMonthly=String(base);
    return '<section class="card" id="your-number"><div class="number">NEXT · YOUR NUMBER</div><h2>WHAT DO YOU ACTUALLY WANT THIS CAREER TO PROVIDE?</h2><p>A real number. A real schedule. Time off included.</p><div class="grid2">'
      +f('yn-current-month','What you make in a month, before personal income taxes',n.currentMonthly||'','After work expenses, before personal income taxes. We’ve filled this in from your Money Map when available.')
      +f('yn-current-days','Current days worked per week',n.currentDays||'')
      +f('yn-current-weeks','Current weeks worked per year',n.currentWeeks||'','Do not guess 50. Use the number that is actually true or your best honest estimate.')
      +f('yn-desired-annual','What you want to make in a year, before personal income taxes',n.desiredAnnual||'','There is no default $100K benchmark. Pick the number your life actually needs.')
      +f('yn-desired-days','Desired days worked per week',n.desiredDays||'','1–7 days.')
      +f('yn-desired-weeks','Desired weeks worked per year',n.desiredWeeks||'','1–52 weeks. Time off belongs in the math.')
      +f('yn-max-clients','Optional maximum clients per day',n.maxClients||'','How many clients can you handle in a day without running yourself into the ground?')
      +'</div><div class="actions"><button type="button" class="primary" id="yn-calc">BUILD MY NUMBER →</button></div><div id="yn-result">'+(n.result?numberPlannerResultCard(n.result):'')+'</div>'+(n.result&&n.result.complete&&n.route?routeCard(n.route):'')+'</section>';
  }

  function retentionLeak(a,role){
    var v=a&&a[role+'_return'];
    if(role==='extensions')v=a&&a[role+'_maintenance'];
    var weak=['ask','desk','nothing','wait','plan','chase','new','stylist','unknown'];
    return weak.indexOf(v)>=0;
  }
  function routeAfterNumber(data,plan,r){
    var a=data.answers||{},load=a.load,payType=data.shell&&data.shell.moneyMap&&data.shell.moneyMap.payType;
    var multiple=(Array.isArray(a.careers)&&a.careers.length>1)||payType==='mixed';
    if(r.annualGap<=0&&r.desiredDays<r.currentDays){
      return {id:'p07',title:'THE MONEY WORKS. NOW LET\'S SEE IF THE SCHEDULE CAN.',body:'You are at or above the income target on the numbers entered, and you want fewer workdays. Next we test whether one workday still deserves permanent custody of your week.',cta:'BUY BACK A DAY →'};
    }
    if(multiple&&r.annualGap>0){
      return {id:'p14',title:'YOUR CHAIR DOES NOT HAVE TO DO EVERYTHING.',body:'You have more than one income lane. Before forcing the entire target onto one part of the career, we should decide what each lane can responsibly carry.',cta:'MAP MY INCOME LANES →'};
    }
    if(load==='starting'||load==='open'){
      return {id:'p01',title:'LET’S START WITH THE EMPTY APPOINTMENTS.',body:'You’ve still got room for clients. Let’s work on filling those appointments, then check what that does for your income.',cta:'FILL THE EMPTY TUESDAY →'};
    }
    if(load==='busy'&&retentionLeak(a,plan.role)){
      return {id:'p02',title:'CLIENTS ARE COMING IN. ARE THEY COMING BACK?',body:'You’re getting clients, but too many leave without their next visit sorted. Let’s make coming back easier before you spend more time finding someone new.',cta:'FIX MY REBOOKING →'};
    }
    return {id:'p03',title:'THE GAP IS INSIDE THE WORKDAY.',body:'You’re working. Now let’s look at what clients spend, how long their appointments take, and what the day brings in. That will help us decide what needs to change.',cta:'CHECK MY DAY →'};
  }
  function routeCard(route){
    return '<div class="card" id="yn-route"><div class="number">FIX THIS NEXT</div><h3>'+e(route.title)+'</h3><p>'+e(route.body)+'</p><button type="button" class="primary" id="yn-route-go">'+e(route.cta)+'</button></div>';
  }

  function numberPlannerResultCard(r){
    if(!r||!r.complete)return '<div class="card"><h3>WE NEED THE REAL INPUTS FIRST.</h3><p>'+e((r&&r.message)||'Finish the required fields above.')+'</p></div>';
    var gapText=r.annualGap<=0
      ?'You are already at or above the annual income target on the current numbers. The next question is whether you can protect it while buying back time, reducing physical load, or building security.'
      :'Your current annual baseline is about <strong>'+cash(r.currentAnnual)+'</strong>. The gap to your desired annual income is about <strong>'+cash(r.annualGap)+'</strong>.';
    return '<div class="card"><div class="number">MY NUMBER</div><h3>'+cash(r.desiredAnnual)+' A YEAR. ON PURPOSE.</h3><p>You want this career to provide <strong>'+cash(r.desiredAnnual)+'</strong> per year after work costs, before personal income taxes.</p><p>You want to work <strong>'+r.desiredDays+' days/week for '+r.desiredWeeks+' weeks/year</strong> — about <strong>'+r.desiredWorkdays+' workdays/year</strong>.</p><p>That means the career needs to provide about <strong>'+cash(r.targetPerDay)+'</strong> per workday.</p><p>Current workday value: <strong>'+cash(r.currentPerDay)+'</strong>. Workday gap: <strong>'+cash(r.workdayGap)+'</strong>.</p><p>'+gapText+'</p><div class="grid2"><div class="card"><div class="number">CURRENT REALITY</div><p>'+cash(r.currentAnnual)+' / year</p><p>'+r.currentDays+' days/week · '+r.currentWeeks+' weeks/year</p><p><strong>'+cash(r.currentPerDay)+'/workday</strong></p></div><div class="card"><div class="number">THE SCHEDULE I WANT</div><p>Same current annual income on the desired schedule would require about <strong>'+cash(r.preservePerDay)+'/workday</strong>.</p></div></div><div class="card"><div class="number">MY NUMBER</div><p>'+cash(r.desiredAnnual)+' / year</p><p>'+r.desiredDays+' days/week · '+r.desiredWeeks+' weeks/year</p><p><strong>'+cash(r.targetPerDay)+'/workday</strong></p></div></div><div id="yn-route-slot"></div>';
  }
  function calculateNumberPlanner(n){
    function need(k){var v=num(n,k);return v}
    var currentMonthly=need('currentMonthly'),currentDays=need('currentDays'),currentWeeks=need('currentWeeks'),desiredAnnual=need('desiredAnnual'),desiredDays=need('desiredDays'),desiredWeeks=need('desiredWeeks');
    if([currentMonthly,currentDays,currentWeeks,desiredAnnual,desiredDays,desiredWeeks].some(function(v){return v===null}))return {complete:false,message:'Complete current income, current schedule, desired annual income, and desired schedule.'};
    if(currentDays<=0||currentDays>7||desiredDays<=0||desiredDays>7)return {complete:false,message:'Days worked per week must be between 1 and 7.'};
    if(currentWeeks<=0||currentWeeks>52||desiredWeeks<=0||desiredWeeks>52)return {complete:false,message:'Weeks worked per year must be between 1 and 52.'};
    var currentAnnual=currentMonthly*12,currentWorkdays=currentDays*currentWeeks,desiredWorkdays=desiredDays*desiredWeeks;
    var currentPerDay=currentAnnual/currentWorkdays,targetPerDay=desiredAnnual/desiredWorkdays;
    return {complete:true,currentMonthly:currentMonthly,currentAnnual:currentAnnual,currentDays:currentDays,currentWeeks:currentWeeks,currentPerDay:currentPerDay,desiredAnnual:desiredAnnual,desiredDays:desiredDays,desiredWeeks:desiredWeeks,desiredWorkdays:desiredWorkdays,targetPerDay:targetPerDay,annualGap:desiredAnnual-currentAnnual,workdayGap:targetPerDay-currentPerDay,preservePerDay:currentAnnual/desiredWorkdays};
  }


  function dayValueHTML(s){
    if(s.nextPath!=='p03')return '';
    var d=s.dayValue||{};
    return '<section class="card" id="day-value-audit"><div class="number">NEXT PATH · WHAT YOUR DAY IS ACTUALLY WORTH</div><h2>START WITH A NORMAL DAY. NOT YOUR BEST SATURDAY.</h2><p>What clients spend matters. So does how long you spend with them. Let’s look at both, along with the gaps in your day.</p><div class="grid2">'
      +f('dv-ticket','Average client spend',d.ticket||'')
      +f('dv-clients','Average clients per workday',d.clients||'')
      +f('dv-available','Average hours available to clients each workday',d.available||'','Include the hours you actually make bookable. Intentional breaks are not automatically waste.')
      +f('dv-booked','Hours spent with paying clients on an average day',d.booked||'')
      +f('dv-days','Days worked per week',d.days||'')
      +f('dv-revenue','Average service sales / client revenue per day, if known',d.revenue||'','Optional. If entered, this replaces the ticket × clients estimate for day revenue.')
      +'</div><div class="actions"><button type="button" class="primary" id="dv-calc">CHECK MY DAY →</button></div><div id="dv-result">'+(d.result?dayValueResultCard(d.result):'')+'</div></section>';
  }
  function dayValueCalc(d){
    var ticket=num(d,'ticket'),clients=num(d,'clients'),available=num(d,'available'),booked=num(d,'booked'),days=num(d,'days'),actualRevenue=num(d,'revenue');
    if([ticket,clients,available,booked,days].some(function(v){return v===null}))return {complete:false,message:'Complete average client spend, clients per day, available hours, booked hours, and days worked.'};
    if(ticket<0||clients<0||available<=0||booked<0||days<=0||days>7)return {complete:false,message:'Check the numbers entered. Hours and days must be usable positive values, and booked hours cannot be negative.'};
    if(booked>available)return {complete:false,message:'Booked revenue-producing hours cannot be higher than the hours you make available. Check those two numbers.'};
    var estimate=ticket*clients,day=actualRevenue!==null?actualRevenue:estimate,util=booked/available;
    var perBooked=booked>0?day/booked:null;
    return {complete:true,ticket:ticket,clients:clients,available:available,booked:booked,days:days,estimatedDay:estimate,dayRevenue:day,usedActual:actualRevenue!==null,utilization:util,revenuePerBookedHour:perBooked};
  }

  function interpretDayValue(data,plan,r){
    var a=data.answers||{},n=data.shell&&data.shell.numberPlanner&&data.shell.numberPlanner.result;
    var targetPerDay=n&&n.complete?n.targetPerDay:null,currentTargetMet=targetPerDay!==null?r.dayRevenue>=targetPerDay:false;
    var lowUtil=r.utilization<0.75,highUtil=r.utilization>=0.85;
    var wantsFewer=n&&n.complete&&n.desiredDays<n.currentDays;
    var payType=data.shell&&data.shell.moneyMap&&data.shell.moneyMap.payType;
    var moneyBaseline=data.shell&&data.shell.moneyMap&&data.shell.moneyMap.result&&data.shell.moneyMap.result.baseline;
    var strongDayWeakIncome=moneyBaseline!==undefined&&moneyBaseline!==null&&r.dayRevenue>0&&n&&n.complete&&n.currentAnnual>0&&(r.dayRevenue*r.days*48)>n.currentAnnual*1.35;
    if(lowUtil){
      if(retentionLeak(a,plan.role)&&a.load==='busy'){
        return {id:'p02',title:'YOUR DAY IS NOT UNDERPRICED. FUTURE WEEKS KEEP OPENING BACK UP.',body:'When you are booked, the day can work. The bigger leak is keeping enough future business on the calendar. Fix the return/rebooking system before chasing more attention.',cta:'FIX MY REBOOKING →'};
      }
      return {id:'p01',title:'YOUR DAY ISN\'T UNDERPRICED. IT\'S UNDERFILLED.',body:'Your current utilization is about '+Math.round(r.utilization*100)+'%. Before changing price, we need to fill the right empty space and see what the day does with more paid time.',cta:'FIX MY EMPTY TIME →'};
    }
    if(currentTargetMet&&highUtil&&wantsFewer){
      return {id:'p07',title:'THIS DAY MAY BE STRONG ENOUGH TO BUY BACK ANOTHER ONE.',body:'The day is producing at or above the target workday value, utilization is strong, and you want fewer days. Next we test whether the income can survive a shorter week.',cta:'BUY BACK A DAY →'};
    }
    if(strongDayWeakIncome){
      return {id:'p04',title:'THE CHAIR IS PRODUCING. THE MONEY IS LEAKING SOMEWHERE ELSE.',body:'The day looks stronger than the personal-income baseline. That points back to costs, compensation, or the money structure rather than the client schedule itself.',cta:'REOPEN MY MONEY MAP →'};
    }
    if(highUtil&&targetPerDay!==null&&r.dayRevenue<targetPerDay){
      return {id:'p05',title:'YOU ARE BUSY ENOUGH TO LOOK AT THE DAY ITSELF.',body:'Utilization is strong, but the day is still below the target. Now pricing, service mix, appointment structure, or time design deserves a closer look. We do not pick price alone from this one number.',cta:'CHECK MY SERVICE ECONOMICS →'};
    }
    return {id:'p03-detail',title:'WE NEED A LITTLE MORE RECEIPT.',body:'The fast audit does not point cleanly to one bottleneck yet. Next we compare 10–20 representative appointments so time, ticket, overruns, and direct costs can tell the story.',cta:'RUN THE DETAILED AUDIT →'};
  }
  function dayRouteCard(route){
    return '<div class="card"><div class="number">FIX THIS NEXT</div><h3>'+e(route.title)+'</h3><p>'+e(route.body)+'</p><button type="button" class="primary" id="dv-route-go">'+e(route.cta)+'</button></div>';
  }

  function dayValueResultCard(r){
    if(!r||!r.complete)return '<div class="card"><h3>WE NEED A CLEAN DAY FIRST.</h3><p>'+e((r&&r.message)||'Finish the required fields above.')+'</p></div>';
    return '<div class="card"><div class="number">YOUR DAY</div><h3>NOW WE KNOW WHAT THE DAY IS DOING.</h3><p>Normal day value: <strong>'+cash(r.dayRevenue)+'</strong>'+(r.usedActual?' using the actual day revenue you entered.':' using average client spend × clients per day.')+'</p><p>Booked-hour value: <strong>'+(r.revenuePerBookedHour===null?'Not available yet':cash(r.revenuePerBookedHour)+'/hour')+'</strong>.</p><p>Booked time: <strong>'+Math.round(r.utilization*100)+'%</strong> of the hours you make available.</p><p>Average client spend: <strong>'+cash(r.ticket)+'</strong>.</p><p class="fine">We do not judge price from revenue/hour alone, and we do not treat intentional breaks as wasted capacity.</p><div id="dv-route-slot"></div></div>';
  }


  function chooseDemandLanes(data){
    var a=data.answers||{},role=BookedNext30.primary(a),load=a.load;
    var existing=(role==='restart'||load==='starting')?'small':'some';
    var primary=[],maintenance='targeted local content';
    if(existing==='some'){
      primary=['lapsed-client reactivation','referrals / rebooking'];
      maintenance='targeted local visibility';
    }else{
      primary=['local partnership / outreach','targeted local social / Google'];
      maintenance='portfolio proof that matches the work you want';
    }
    if(role==='session'||role==='education'||role==='bridal'||role==='other'){
      primary=['targeted professional outreach','portfolio / case-study proof'];
      maintenance='industry relationships / inbound buyer content';
    }
    return {primary:primary,maintenance:maintenance};
  }
  function demandSprintHTML(data){
    if(data.shell.nextPath!=='p01')return '';
    var d=data.shell.demandSprint||{},lanes=d.lanes||chooseDemandLanes(data);
    return '<section class="card" id="demand-sprint"><div class="number">NEXT PATH · FILL THE EMPTY TUESDAY</div><h2>WHICH APPOINTMENTS DO YOU NEED TO FILL?</h2><p>Pick the day, time, or service you need more bookings for. For the next 30 days, focus on two ways to bring clients in. Keep one other way ticking along.</p><div class="grid2">'
      +f('ds-block','Consistently weak day / time block',d.block||'','Example: Tuesday afternoon, Thursday morning, or one recurring weekly gap.','text')
      +f('ds-capacity','New-client capacity per week',d.capacity||'','How many new paid appointments could you realistically absorb without wrecking the schedule?')
      +'</div><div class="card"><div class="number">FIRST WAY TO FIND CLIENTS</div><h3>'+e(lanes.primary[0])+'</h3><p>Do 5 real actions this week. Track replies, bookings, service, and source.</p></div><div class="card"><div class="number">SECOND WAY TO FIND CLIENTS</div><h3>'+e(lanes.primary[1])+'</h3><p>Do 5 real actions this week. Write down who replies and who books. Likes don’t pay the rent.</p></div><div class="card"><div class="number">KEEP THIS TICKING ALONG</div><h3>'+e(lanes.maintenance)+'</h3><p>Keep this visible without turning it into a second full-time job.</p></div><div class="actions"><button type="button" class="primary" id="ds-save">START MY 30-DAY SPRINT →</button></div><div id="ds-result">'+(d.started?'<div class="card"><h3>THE SPRINT IS SET.</h3><p>Week 1: pick the appointments you want to fill. Take five actions for each of your two ways to find clients. Week 2: keep going and ask each new inquiry how they found you. Week 3: answer interested clients and help good new clients book their next visit. Week 4: keep what brought bookings, adjust what showed promise, and drop what went nowhere.</p></div>':'')+'</div></section>';
  }


  function monthHTML(data,plan){
    if(!data.shell.numberPlanner.result||!data.shell.numberPlanner.result.complete)return '';
    var key=plan.role+'-money',review=data.shell.review||{};
    var titles=['KNOW WHAT YOU MAKE.','TRY ONE CHANGE.','KEEP GOING. WRITE IT DOWN.','KEEP WHAT WORKED.'];
    return '<section id="next30-month"><div class="eyebrow">FOUR WEEKS. ONE THING TO WORK ON.</div><p>Start with the numbers you just found. Use the steps below for your kind of work. You can open each week when you’re ready.</p><p id="month-progress" role="status"></p>'
      +plan.missions.map(function(week,i){return '<details class="card"'+(i===0?' open':'')+'><summary>WEEK '+week.week+' · '+e(titles[i])+'</summary>'+week.tasks.map(function(task,j){var id=next30TaskKey(key,week.week,j,task);return '<label class="checkline"><input type="checkbox" data-month-task="'+e(id)+'" '+(data.checks[id]?'checked':'')+'><span>'+e(task)+'</span></label>'}).join('')+'<p class="fine">Keep an eye on: '+e(week.watch)+'</p></details>'}).join('')
      +'<details class="card"><summary>WORDS YOU CAN USE</summary>'+plan.scripts.map(function(script){return '<h3>'+e(script[0])+'</h3><p>'+e(script[1])+'</p>'}).join('')+'</details>'
      +'<section class="card" id="month-review"><div class="number">DAY 30</div><h2>DID ANYTHING ACTUALLY CHANGE?</h2><p>Compare the same length of time before and after. Leave a number blank if you don’t know it. Checking every box doesn’t automatically mean you made more money.</p>'
      +plan.metrics.map(function(m){return '<div class="card"><h3>'+e(m.label)+'</h3><div class="grid2">'+f('month-base-'+m.id,'Before ('+m.unit+')',data.metrics[key+'-base-'+m.id])+f('month-now-'+m.id,'After ('+m.unit+')',data.metrics[key+'-now-'+m.id])+'</div><p id="month-delta-'+m.id+'" role="status"></p></div>'}).join('')
      +'<button type="button" class="primary" id="month-compare">SHOW ME WHAT CHANGED →</button><p id="month-status" role="status"></p>'
      +['keep','adjust','stop'].map(function(k){return '<div class="n30-field"><label for="month-'+k+'">'+({keep:'What’s worth keeping?',adjust:'What needs a change?',stop:'What are you done wasting time on?'})[k]+'</label><textarea class="input" id="month-'+k+'" maxlength="2000">'+e(review[k]||'')+'</textarea></div>'}).join('')
      +'<button type="button" class="secondary" id="month-save-review">SAVE MY CHECK-IN</button><p id="month-review-status" role="status">'+(review.saved?'Your check-in is saved on this device.':'')+'</p></section></section>';
  }
  function bindMonth(data,plan){
    var key=plan.role+'-money',all=document.querySelectorAll('[data-month-task]');
    function progress(){var out=document.getElementById('month-progress');if(out)out.textContent=Array.from(all).filter(function(x){return x.checked}).length+' of '+all.length+' steps checked off.'}
    all.forEach(function(x){x.onchange=function(){data.checks[x.dataset.monthTask]=x.checked;next30Save();progress()}});progress();
    plan.metrics.forEach(function(m){['base','now'].forEach(function(phase){var x=document.getElementById('month-'+phase+'-'+m.id);if(x)x.oninput=function(){data.metrics[key+'-'+phase+'-'+m.id]=x.value;next30Save()}})});
    var compare=document.getElementById('month-compare');if(compare)compare.onclick=function(){
      var count=0;
      plan.metrics.forEach(function(m){var before=document.getElementById('month-base-'+m.id).value,after=document.getElementById('month-now-'+m.id).value,out=document.getElementById('month-delta-'+m.id);
        if(before.trim()===''||after.trim()===''){out.textContent='Add both numbers when you have them. A blank isn’t zero.';return}
        var b=Number(before),a=Number(after);if(!Number.isFinite(b)||!Number.isFinite(a)||a<0||b<0){out.textContent='Use zero or a positive number.';return}
        var delta=a-b,value=m.unit==='money'?cash(Math.abs(delta)):String(Number(Math.abs(delta).toFixed(2)));
        out.textContent=delta===0?'No change in the numbers entered.':value+' '+(delta>0?'more':'less')+' '+(m.unit==='money'?'':m.unit)+' than before.';
        if(m.unit==='hours')out.textContent+=' Check what you earned alongside the hours.';count++;
      });document.getElementById('month-status').textContent=count?'These numbers show what changed. They don’t prove what caused it. Use them to decide what to keep doing.':'Add a before and after number when you have them.';
    };
    ['keep','adjust','stop'].forEach(function(k){var x=document.getElementById('month-'+k);if(x)x.oninput=function(){data.shell.review[k]=x.value;data.shell.review.saved=false;next30Save()}});
    var save=document.getElementById('month-save-review');if(save)save.onclick=function(){data.shell.review.saved=true;data.shell.phase='day30';var ok=next30Save();document.getElementById('month-review-status').textContent=ok?'Your check-in is saved on this device.':'This browser couldn’t save your check-in. Copy your notes before closing it.'};
  }

  function renderMoney(data,plan){
    data.shell=shell(data.shell);if(!data.shell.startedAt)data.shell.startedAt=new Date().toISOString();
    if(!data.shell.moneyMap.payType)data.shell.moneyMap.payType=infer(data,plan);
    var done=data.shell.day0Complete,stage=String((state.result&&state.result.stage)||state.stage||'').toUpperCase();
    state.currentCareerPlan=plan;
    app.classList.add('next30-panel');
    app.innerHTML='<div class="eyebrow">YOUR NEXT 30'+(stage?' · '+e(stage):'')+'</div>'
      +'<section class="card"><div class="number">'+(done?'WEEK 1 — KNOW IT':'DAY 0 — WHAT DID YOU ACTUALLY MAKE?')+'</div><h2>FIX THIS FIRST</h2><p class="lead">KNOW WHAT THE WORK ACTUALLY PAYS YOU.</p><p>'+(done?'Your monthly number is saved. Now we have something to work with.':'First, let’s find out what you actually made. Then we can look at your prices, your schedule, and how many clients you need.')+'</p></section>'
      +'<section class="card"><div class="number">TODAY</div><h2>'+(done?'YOUR MONTHLY NUMBER IS SAVED.':'FIND OUT WHAT YOU ACTUALLY MADE.')+'</h2><p>'+(done?'You can update the map if you find a missing number.':'Pick one recent, completed month. Get the actual pay stubs, deposits, and business costs. No guessing.')+'</p><a class="primary button" href="#money-map">'+(done?'REVIEW MY MONEY MAP':'DO THIS NOW')+' →</a></section>'
      +'<section class="card"><div class="number">WHY THIS MATTERS</div><p>A full book looks good. So does a big sales number. Neither tells us what you got to keep. Before you add more clients or another workday, let’s see what the work actually paid you.</p></section>'
      +'<section class="card"><div class="number">QUICK LESSON</div><h2>SIX FIGURES OF WHAT?</h2><p>What clients paid, what the salon paid you, and what landed in your bank account can be three very different numbers. You don’t need to become an accountant. You do need to know which number you’re looking at.</p><p>Don’t know a number? Leave it blank. We’re checking your money, not your ability to guess.</p></section>'
      +mapHTML(data.shell)
      +numberPlannerHTML(data.shell)
      +dayValueHTML(data.shell)
      +demandSprintHTML(data)
      +monthHTML(data,plan)
      +'<section class="card" id="next30-whats-next"><div class="number">WHAT\'S NEXT</div>'+(done?'<h3>YOUR NUMBER OPENS NEXT.</h3><p>Next, choose what you want to earn and how much you want to work. We’ll compare that with what you make now.</p>':'<p>Save your monthly number first. Then we’ll work out what you want this career to pay you—and how much of your week you want it to take.</p>')+'</section>'
      +'<section class="card"><button type="button" class="secondary" id="next30-edit-answers">EDIT MY BREAKDOWN ANSWERS</button><p class="fine">Your progress is saved on this device. Returning to this browser brings you back to your current plan.</p></section>';
    bind(data,plan);
    bindMonth(data,plan);
    var savedRoute=document.getElementById('yn-route-go');
    if(savedRoute)savedRoute.onclick=function(){var route=data.shell.numberPlanner.route;if(route){data.shell.nextPath=route.id;next30Save();render()}};
    if(done){
      var n=data.shell.numberPlanner||{},fields=['currentMonthly','currentDays','currentWeeks','desiredAnnual','desiredDays','desiredWeeks','maxClients'];
      var ids={currentMonthly:'yn-current-month',currentDays:'yn-current-days',currentWeeks:'yn-current-weeks',desiredAnnual:'yn-desired-annual',desiredDays:'yn-desired-days',desiredWeeks:'yn-desired-weeks',maxClients:'yn-max-clients'};
      fields.forEach(function(k){var x=document.getElementById(ids[k]);if(x)x.oninput=function(){n[k]=x.value.trim();data.shell.numberPlanner=n;next30Save()}});
      var calc=document.getElementById('yn-calc');if(calc)calc.onclick=function(){
        fields.forEach(function(k){var x=document.getElementById(ids[k]);if(x)n[k]=x.value.trim()});
        n.result=calculateNumberPlanner(n);
        if(n.result.complete)n.route=routeAfterNumber(data,plan,n.result);
        data.shell.numberPlanner=n;next30Save();
        if(n.result.complete){render();return}
        var out=document.getElementById('yn-result');if(out)out.innerHTML=numberPlannerResultCard(n.result);
        if(n.result.complete){
          var slot=document.getElementById('yn-route-slot');if(slot)slot.innerHTML=routeCard(n.route);
          var nxt=document.getElementById('next30-whats-next');if(nxt)nxt.innerHTML='<div class="number">WHAT\'S NEXT</div><h3>ONE NEXT MOVE.</h3><p>We’ll use your numbers and answers to pick the next thing to work on. Raising prices isn’t automatically the answer.</p>';
          var go=document.getElementById('yn-route-go');if(go)go.onclick=function(){
            data.shell.nextPath=n.route.id;next30Save();
            var messages={p01:'FILL THE EMPTY TUESDAY is next.',p02:'REBOOKING WITHOUT BEGGING is next.',p03:'WHAT YOUR DAY IS ACTUALLY WORTH is next.',p07:'BUY BACK A DAY is next.',p14:'ONE CAREER, MORE THAN ONE LANE is next.'};
            if(n.route.id==='p03'){render();return}
            go.disabled=true;go.textContent=messages[n.route.id]||'NEXT PATH SAVED.';
          };
        }
      };
    }
    if(data.shell.nextPath==='p03'){
      var d=data.shell.dayValue||{},dFields=['ticket','clients','available','booked','days','revenue'];
      var dIds={ticket:'dv-ticket',clients:'dv-clients',available:'dv-available',booked:'dv-booked',days:'dv-days',revenue:'dv-revenue'};
      dFields.forEach(function(k){var x=document.getElementById(dIds[k]);if(x)x.oninput=function(){d[k]=x.value.trim();data.shell.dayValue=d;next30Save()}});
      var dCalc=document.getElementById('dv-calc');if(dCalc)dCalc.onclick=function(){
        dFields.forEach(function(k){var x=document.getElementById(dIds[k]);if(x)d[k]=x.value.trim()});
        d.result=dayValueCalc(d);
        if(d.result.complete)d.route=interpretDayValue(data,plan,d.result);
        data.shell.dayValue=d;next30Save();
        var out=document.getElementById('dv-result');if(out)out.innerHTML=dayValueResultCard(d.result);
        if(d.result.complete){
          var slot=document.getElementById('dv-route-slot');if(slot)slot.innerHTML=dayRouteCard(d.route);
          var go=document.getElementById('dv-route-go');if(go)go.onclick=function(){
            data.shell.nextPath=d.route.id;next30Save();
            if(d.route.id==='p01'||d.route.id==='p02'||d.route.id==='p04'){render();return}
            go.disabled=true;
            go.textContent=(d.route.id==='p01'?'FILL THE EMPTY TUESDAY':d.route.id==='p02'?'REBOOKING WITHOUT BEGGING':d.route.id==='p04'?'MONEY MAP':d.route.id==='p05'?'SERVICE ECONOMICS':d.route.id==='p07'?'BUY BACK A DAY':'DETAILED AUDIT')+' SAVED';
          };
        }
      };
    }
    if(data.shell.nextPath==='p01'){
      var ds=data.shell.demandSprint||{};
      if(!ds.lanes)ds.lanes=chooseDemandLanes(data);
      var block=document.getElementById('ds-block'),capacity=document.getElementById('ds-capacity');
      function saveDemand(){if(block)ds.block=block.value.trim();if(capacity)ds.capacity=capacity.value.trim();data.shell.demandSprint=ds;next30Save()}
      if(block)block.oninput=saveDemand;if(capacity)capacity.oninput=saveDemand;
      var save=document.getElementById('ds-save');if(save)save.onclick=function(){
        saveDemand();
        if(!ds.block){var out=document.getElementById('ds-result');if(out)out.innerHTML='<div class="card"><h3>NAME THE HOLE FIRST.</h3><p>Pick the day, time block, or recurring service gap you are actually trying to fill.</p></div>';return}
        ds.started=true;data.shell.demandSprint=ds;next30Save();
        var out=document.getElementById('ds-result');if(out)out.innerHTML='<div class="card"><h3>THE SPRINT IS SET.</h3><p>Week 1: pick the appointments you want to fill. Take five actions for each of your two ways to find clients. Week 2: keep going and ask each new inquiry how they found you. Week 3: answer interested clients and help good new clients book their next visit. Week 4: keep what brought bookings, adjust what showed promise, and drop what went nowhere.</p></div>';
      };
    }
    next30Save();
  }

  window.renderCareerPlan=function(){
    var data=next30Ensure();
    if(!BookedNext30.complete(data.answers)){state.view='deepintake';render();return}
    var plan=BookedNext30.build(data.answers);
    data.shell=shell(data.shell);
    var goal=BookedNext30.goalFor(data.answers);
    if(window.BookedRebooking&&((goal==='return'&&['color','cut','extensions','owner','manager','restart'].indexOf(plan.role)>=0)||(goal==='money'&&data.shell.nextPath==='p02'))){
      state.currentCareerPlan=plan;app.classList.add('next30-panel');
      app.innerHTML='<div class="eyebrow">YOUR NEXT 30 · REBOOKING</div>'+BookedRebooking.html(data)+(goal==='money'?'<button type="button" class="secondary" id="p02-back">REVIEW MY MONEY MAP & NUMBER</button>':'')+'<button type="button" class="secondary" id="next30-edit-answers">EDIT MY BREAKDOWN ANSWERS</button>';
      BookedRebooking.bind(data,render);
      var back=document.getElementById('p02-back');if(back)back.onclick=function(){data.shell.nextPath='';next30Save();render()};
      document.getElementById('next30-edit-answers').onclick=function(){data.editAll=true;data.currentId='careers';next30Save();state.view='deepintake';render()};
      next30Save();return;
    }
    if(BookedNext30.goalFor(data.answers)==='money'){renderMoney(data,plan);return}
    if(typeof oldPlan==='function')oldPlan();
  };
})();
