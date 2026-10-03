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

  function f(id,label,val,help){
    return '<div class="n30-field"><label for="'+id+'">'+e(label)+'</label><input class="input" type="number" inputmode="decimal" step="any" id="'+id+'" value="'+e(val||'')+'"><p class="fine">'+e(help||'Leave blank if you do not know it yet. Enter 0 only when it is truly zero.')+'</p></div>';
  }
  var EMP=['service','gross','tips','bonus','benefits','taxes','other','net','days'];
  var SELF=['payments','refunds','direct','rent','processing','software','insurance','payroll','marketing','other','reserve','days'];

  function employeeFields(v,p){
    p=p||'mmm-emp-';
    return f(p+'service','Service sales you produced this month',v.service,'Optional context. This is not automatically your pay.')
      +f(p+'gross','Gross wages / commission before taxes',v.gross,'Use the amount you were paid before personal taxes and deductions.')
      +f(p+'tips','Tips',v.tips)+f(p+'bonus','Bonuses / incentives',v.bonus)
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
    var gross=num(v,'gross');if(gross===null)return {complete:false,missing:['Gross wages / commission before taxes']};
    var tips=num(v,'tips')||0,bonus=num(v,'bonus')||0,base=gross+tips+bonus;
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
      return '<div class="card"><div class="number">YOUR MONEY MAP</div><h3>YOUR CAREER HAS MORE THAN ONE LANE.</h3><p>Across the completed lanes, the work generated about <strong>'+cash(r.generated)+'</strong>. Your combined pre-personal-tax career-income baseline is about <strong>'+cash(r.baseline)+'</strong>.</p><p>Each lane stays separate underneath the combined number so revenue is not confused with what the career actually paid you.</p><p><strong>'+cash(r.baseline)+'</strong> is the planning baseline we will carry into YOUR NUMBER.</p>'+r.warnings.map(function(w){return '<p class="baf-note">'+e(w)+'</p>'}).join('')+'</div>';
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
    return '<section class="card" id="money-map"><div class="number">YOUR TOOL</div><h2>MONTHLY MONEY MAP</h2><p>Use one recent, completed, reasonably normal month. Actual records beat memory. A blank means unknown. Zero means zero.</p><div class="n30-field"><label for="mmm-pay-type">How do you get paid?</label><select class="input" id="mmm-pay-type"><option value="">Choose one</option><option value="employee" '+(m.payType==='employee'?'selected':'')+'>I work for a salon / employer</option><option value="self" '+(m.payType==='self'?'selected':'')+'>I rent, have a suite, or work for myself</option><option value="mixed" '+(m.payType==='mixed'?'selected':'')+'>I have more than one income lane</option></select></div>'
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
        r=bad>=0?{complete:false,missing:['Finish '+m.lanes[bad].label+' before combining the lanes.']}:{complete:true,type:'mixed',generated:rs.reduce(function(a,x){return a+(x.generated||0)},0),baseline:rs.reduce(function(a,x){return a+x.baseline},0),warnings:rs.reduce(function(a,x){return a.concat(x.warnings||[])},[])};
      }
      m.result=r;s.day0Complete=!!(r&&r.complete);if(s.day0Complete)s.phase='week1';next30Save();
      var out=document.getElementById('mmm-result');if(out)out.innerHTML=resultCard(r);
      var nxt=document.getElementById('next30-whats-next');if(nxt&&s.day0Complete)nxt.innerHTML='<h3>YOUR BASELINE IS SET.</h3><p>Next: YOUR NUMBER. We take the number you just found and put a real income goal, schedule, and life underneath it.</p>';
    };
    var edit=document.getElementById('next30-edit-answers');if(edit)edit.onclick=function(){data.editAll=true;data.currentId='careers';next30Save();state.view='deepintake';render()};
  }
  function renderMoney(data,plan){
    data.shell=shell(data.shell);if(!data.shell.startedAt)data.shell.startedAt=new Date().toISOString();
    if(!data.shell.moneyMap.payType)data.shell.moneyMap.payType=infer(data,plan);
    var done=data.shell.day0Complete,stage=String((state.result&&state.result.stage)||state.stage||'').toUpperCase();
    state.currentCareerPlan=plan;
    app.classList.add('next30-panel');
    app.innerHTML='<div class="eyebrow">YOUR NEXT 30'+(stage?' · '+e(stage):'')+'</div>'
      +'<section class="card"><div class="number">'+(done?'WEEK 1 — KNOW IT':'DAY 0 — SET THE BASELINE')+'</div><h2>FIX THIS FIRST</h2><p class="lead">KNOW WHAT THE WORK ACTUALLY PAYS YOU.</p><p>'+(done?'Your baseline is saved. Now we use it instead of guessing.':'Day 0 has one job: get the real monthly number before we try to fix pricing, schedule, or client volume.')+'</p></section>'
      +'<section class="card"><div class="number">TODAY</div><h2>'+(done?'KEEP THE BASELINE.':'COMPLETE ONE REAL MONTHLY MONEY MAP.')+'</h2><p>'+(done?'You can update the map if you find a missing number.':'Pick one recent, completed month. Get the actual pay stubs, deposits, and business costs. No guessing.')+'</p><a class="primary button" href="#money-map">'+(done?'REVIEW MY MONEY MAP':'DO THIS NOW')+' →</a></section>'
      +'<section class="card"><div class="number">WHY THIS MATTERS</div><p>A big service-sales number can look great and still tell you almost nothing about what the career paid you. Before BOOKED AF tells you to work more, charge more, or change your schedule, we need the number that is actually yours to plan from.</p></section>'
      +'<section class="card"><div class="number">QUICK LESSON</div><h2>SIX FIGURES OF WHAT?</h2><p>Revenue, production, gross pay, take-home, and profit are not the same number. Your job here is not to become an accountant. It is to separate what came in from what the work actually left you.</p><p>If you do not know a number, leave it unknown. One honest blank is more useful than a beautiful total we made up.</p></section>'
      +mapHTML(data.shell)
      +'<section class="card" id="next30-whats-next"><div class="number">WHAT\'S NEXT</div>'+(done?'<h3>YOUR BASELINE IS SET.</h3><p>Next: YOUR NUMBER. We take the number you just found and put a real income goal, schedule, and life underneath it.</p>':'<p>Once the baseline is set, we open YOUR NUMBER. We do not dump the whole month on you at once.</p>')+'</section>'
      +'<section class="card"><button type="button" class="secondary" id="next30-edit-answers">EDIT MY BREAKDOWN ANSWERS</button><p class="fine">Your progress is saved on this device. Returning to this browser brings you back to your current plan.</p></section>';
    bind(data,plan);next30Save();
  }

  window.renderCareerPlan=function(){
    var data=next30Ensure();
    if(!BookedNext30.complete(data.answers)){state.view='deepintake';render();return}
    var plan=BookedNext30.build(data.answers);
    data.shell=shell(data.shell);
    if(BookedNext30.goalFor(data.answers)==='money'){renderMoney(data,plan);return}
    if(typeof oldPlan==='function')oldPlan();
  };
})();