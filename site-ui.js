/* Brand shell and free-plan recovery. Paid access remains server-verified in app.js. */
(() => {
  'use strict';
  const key = 'booked-af-free-progress-v1';
  const maxAge = 30 * 24 * 60 * 60 * 1000;
  const publicRoutes = {intro:'home', paid:'deep-dive', about:'about', contact:'contact', privacy:'privacy', sample:'sample', survey:'survey'};
  const freeViews = ['question','teaser','result','plan','daymath','email'];
  const preview = window.BOOKED_AF_REVIEW === true || !['bookedandfabulous.com','www.bookedandfabulous.com'].includes(location.hostname);
  let lastFreeView = 'question';
  let lastScreen = '';
  let restoringHistory = false;
  const originalRender = render;
  const storageError = document.getElementById('storage-error');

  function validAnswers(answers, schema) {
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return {};
    const list = schema === SHORT_SCHEMA ? shortQuestions : legacyQuestions;
    return Object.fromEntries(list.filter(q => q.choices.some(c => c[0] === answers[q.id])).map(q => [q.id, answers[q.id]]));
  }
  function hasCompleteResult() {
    if (!Object.keys(state.answers).length) return false;
    return questions.filter(q => !q.when || q.when(state.answers)).every(q => state.answers[q.id] !== undefined);
  }
  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (!saved || saved.version !== 1 || !Number.isFinite(saved.savedAt) || Date.now() - saved.savedAt > maxAge) return;
      if (deepEntry === 'paid') return;
      restoreSchema(saved.schema);
      state.answers = validAnswers(saved.answers, state.schema);
      state.done = Object.fromEntries(Object.entries(saved.done || {}).filter(([k,v]) => /^[a-zA-Z0-9_-]{1,50}$/.test(k) && typeof v === 'boolean'));
      state.index = Number.isInteger(saved.index) ? Math.max(0, Math.min(saved.index, questions.length - 1)) : 0;
      lastFreeView = freeViews.includes(saved.resume) && saved.resume !== 'email' ? saved.resume : 'question';
    } catch (_) { /* Bad or unavailable storage never prevents use. */ }
  }
  function save() {
    if (freeViews.includes(state.view)) lastFreeView = state.view === 'email' ? 'result' : state.view;
    try {
      if (!Object.keys(state.answers).length) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify({version:1, savedAt:Date.now(), schema:state.schema, answers:state.answers, done:state.done, index:state.index, resume:lastFreeView}));
      storageError.hidden = true;
    } catch (_) {
      storageError.hidden = false;
      storageError.textContent = 'This browser can’t save your progress. Keep this tab open, or save or print your completed plan.';
    }
  }
  function routeFor() {
    if (publicRoutes[state.view]) return publicRoutes[state.view];
    if (state.view === 'question') return 'breakdown/' + (state.index + 1);
    return ({teaser:'your-priority', result:'my-breakdown', plan:'my-plan', daymath:'chair-math', email:'email-my-plan'})[state.view] || null;
  }
  function applyRoute(hash) {
    const value = hash.replace(/^#/, '');
    const page = Object.entries(publicRoutes).find(([,path]) => path === value);
    if (page) state.view = page[0];
    else if (/^breakdown(?:\/\d+)?$/.test(value)) {
      if (!Object.keys(state.answers).length) restoreSchema(SHORT_SCHEMA);
      const requested = Number(value.split('/')[1] || 1) - 1;
      const firstMissing = questions.findIndex(q => (!q.when || q.when(state.answers)) && state.answers[q.id] === undefined);
      state.index = Math.max(0, Math.min(requested, firstMissing < 0 ? questions.length - 1 : firstMissing));
      state.view = 'question';
    } else if (['my-plan','my-breakdown','your-priority','email-my-plan'].includes(value)) {
      state.view = hasCompleteResult() ? ({'my-plan':'plan','my-breakdown':'result','your-priority':'teaser','email-my-plan':'email'})[value] : 'question';
      if (state.view === 'question' && !Object.keys(state.answers).length) { restoreSchema(SHORT_SCHEMA); state.index = 0; }
    } else if (value === 'chair-math') state.view = 'daymath';
    else state.view = 'intro';
  }
  function checklistStatus() {
    const checks = [...app.querySelectorAll('[data-task]')];
    if (!checks.length) return;
    const completed = checks.filter(c => c.checked).length;
    let caption = document.getElementById('checklist-status');
    if (!caption) {
      caption = document.createElement('p'); caption.id = 'checklist-status'; caption.className = 'progress-caption'; caption.setAttribute('role','status');
      app.querySelector('h2').after(caption);
    }
    caption.textContent = `${completed} of ${checks.length} moves complete`;
    checks.forEach(c => {
      const title = c.closest('.card').querySelector('h3').textContent;
      c.setAttribute('aria-label', 'Mark “' + title + '” complete');
    });
  }
  function enhance() {
    document.querySelector('.progress').hidden = state.view !== 'question';
    if (['result','plan'].includes(state.view)) {
      const note = document.createElement('p'); note.className = 'storage-note';
      note.innerHTML = 'Your free plan is saved in this browser for up to 30 days. On a shared device? <a href="#privacy" data-nav="privacy">Clear your saved plan here.</a>';
      app.append(note);
    }
    if (state.view === 'result') {
      const plan = document.getElementById('plan');
      if (plan) {
        const quick = document.createElement('div'); quick.className = 'actions';
        const button = document.createElement('button'); button.className = 'primary'; button.textContent = 'Start my 7-day plan →';
        button.onclick = () => go('plan'); quick.append(button); app.querySelector('.lead')?.after(quick);
        plan.className = 'secondary';
      }
      const math = document.getElementById('daymath'); if (math) math.className = 'secondary';
    }
    if (state.view === 'plan') checklistStatus();
    if (state.view === 'daymath') {
      const back = document.getElementById('dayback');
      if (back) { back.textContent = hasCompleteResult() ? '← Back to my Breakdown' : '← Back home'; back.onclick = () => go(hasCompleteResult() ? 'result' : 'intro'); }
    }
    if (state.view === 'survey') {
      const form = document.getElementById('booked-survey');
      if (form) {
        const status = document.getElementById('survey-status');
        const sessionId = new URLSearchParams(location.search).get('session_id') || '';
        if (!/^cs_(?:live|test)_[A-Za-z0-9]+$/.test(sessionId)) {
          form.innerHTML = '<div class="baf-card"><h3>This survey link is missing its purchase information.</h3><p>Please open the survey from the email we sent after your BOOKED AF purchase.</p></div>';
        } else {
          form.addEventListener('submit', async event => {
            event.preventDefault();
            const button = form.querySelector('button[type=submit]');
            const data = new FormData(form);
            const more = data.getAll('more');
            status.hidden = true;
            if (!more.length) {
              status.textContent = 'Pick at least one thing you want more help with.';
              status.hidden = false;
              return;
            }
            button.disabled = true;
            button.textContent = 'SENDING…';
            try {
              const response = await fetch(emailServiceUrl + '/survey', {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                credentials:'omit',
                body:JSON.stringify({
                  session_id:sessionId,
                  rating:Number(data.get('rating')),
                  ease:data.get('ease'),
                  useful:data.get('useful'),
                  more,
                  recommend:data.get('recommend'),
                  comments:String(data.get('comments') || '')
                })
              });
              const result = await response.json().catch(()=>({}));
              if (!response.ok || result.success !== true) throw new Error(result.error || 'Survey could not be sent.');
              form.innerHTML = '<div class="baf-card baf-featured"><p class="baf-kicker">Got it.</p><h2>THANK YOU.</h2><p>The nice answers are lovely. The useful answers are even better.</p><p>Bradley will actually read this.</p><div class="baf-actions"><button type="button" data-nav="intro">Back to BOOKED AF →</button></div></div>';
            } catch (error) {
              status.textContent = error.message || 'Survey could not be sent. Please try again.';
              status.hidden = false;
              button.disabled = false;
              button.textContent = 'SEND IT TO BRADLEY →';
            }
          });
        }
      }
    }
    if (state.view === 'email') {
      const note = app.querySelector('.capture-note');
      if (note) note.innerHTML = 'Your email is required to unlock and send your Breakdown. BOOKED AF receives a copy with your email and answers. This request does not subscribe you to a promotional mailing list. <a href="#privacy" data-nav="privacy">Read our Privacy Policy.</a>';
      const heading = app.querySelector('.capture-wordmark');
      if (heading) heading.innerHTML = '<img src="assets/booked-af-logo.png" alt="BOOKED AF - Booked & Fabulous" width="230" height="109" style="max-width:100%;height:auto">';
    }
    document.querySelectorAll('header [data-nav]').forEach(a => {
      const current = a.dataset.nav === state.view || (a.dataset.nav === 'resume' && ['result','plan'].includes(state.view));
      if (current) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });
    const titles = {intro:'Education & Business Tools for Hairdressers',paid:'Deep Dive - $49',about:'Meet Bradley Sanders',contact:'Contact',plan:'My 7-Day Plan',question:'Free Breakdown',result:'My Breakdown',daymath:'Chair Math',privacy:'Privacy Policy',sample:'Sample Plan',survey:'Client Survey'};
    document.title = 'BOOKED AF | ' + (titles[state.view] || 'My next move');
  }
  render = function () {
    const active = document.activeElement;
    const choice = active?.dataset?.value;
    const screenKey = state.view + ':' + (state.view === 'question' ? state.index : state.view === 'deepintake' ? state.deepIndex : '');
    const changed = lastScreen !== screenKey;
    if (['teaser','result','plan','email'].includes(state.view) && !hasCompleteResult()) { state.view = 'question'; state.index = Math.max(0,state.index); }
    if (['teaser','result','plan'].includes(state.view) && !state.emailSent) state.view = 'email';
    app.classList.remove('intro-screen');
    app.classList.toggle('marketing-screen', !!sitePages[state.view]);
    if (sitePages[state.view]) {
      disposeEmailWidget(); disposeEmailWidget = () => {};
      app.innerHTML = sitePages[state.view];
    } else originalRender();
    enhance(); save();
    const route = routeFor();
    // Payment return URLs and verification are untouched; a hash never grants paid access.
    if (route && !restoringHistory && location.hash !== '#' + route) {
      const action = lastScreen ? 'pushState' : 'replaceState';
      history[action](null,'',location.pathname + location.search + '#' + route);
    }
    if (changed) {
      const heading = app.querySelector('h1,h2');
      if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); }
      window.scrollTo({top:0,behavior:'instant'});
    } else if (choice !== undefined) {
      [...app.querySelectorAll('[data-value]')].find(b => b.dataset.value === choice)?.focus({preventScroll:true});
    }
    lastScreen = state.view + ':' + (state.view === 'question' ? state.index : state.view === 'deepintake' ? state.deepIndex : '');
  };
  function go(view) {
    if (view === 'resume') view = Object.keys(state.answers).length ? lastFreeView : 'question';
    if (view === 'question' && !Object.keys(state.answers).length) { restoreSchema(SHORT_SCHEMA); state.index = 0; }
    if (view === 'question') state.index = Math.max(0,state.index);
    state.view = view; render();
  }
  document.addEventListener('click', e => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { e.preventDefault(); go(nav.dataset.nav); return; }
    if (e.target.closest('[data-clear-progress]')) {
      state.answers = {}; state.done = {}; state.name = ''; state.index = 0; state.emailSent = false;
      try { localStorage.removeItem(key); sessionStorage.removeItem(deliveryKey); sessionStorage.removeItem('booked-af-email-draft'); } catch (_) {}
      go('intro');
    }
    if (preview && e.target.closest('.checkout-link')) {
      e.preventDefault();
      const message = document.createElement('p'); message.className = 'baf-notice'; message.role = 'status'; message.textContent = 'This is the redesign preview. Checkout is kept off here so you can review without making a purchase.';
      const existing = document.getElementById('preview-checkout-note'); if (existing) existing.remove();
      message.id = 'preview-checkout-note'; e.target.closest('.checkout-link').after(message);
    }
  });
  app.addEventListener('change', e => {
    if (e.target.matches('[data-task]')) { save(); checklistStatus(); }
  });
  window.addEventListener('popstate', () => {
    if (deepEntry === 'paid') return;
    restoringHistory = true; applyRoute(location.hash); render(); restoringHistory = false;
  });
  restore();
  if (deepEntry !== 'paid') {
    if (location.hash) applyRoute(location.hash);
    else if (state.view === 'intro') state.view = 'intro';
  }
  if (preview) {
    const badge = document.createElement('div'); badge.className = 'baf-bar'; badge.textContent = 'REDESIGN PREVIEW · Your live site has not changed'; document.body.prepend(badge);
  }
  render();
})();

