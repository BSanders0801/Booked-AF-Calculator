/* Public review copy only. Never include this file on the production purchase flow. */
(() => {
  const originalRender = render;
  render = function () {
    if (state.view === 'email') {
      state.emailSent = true; // Local review access, no delivery request.
      state.view = 'result';
    }
    originalRender();
    if (state.view === 'email') {
      state.emailSent = true;
      state.view = 'result';
      originalRender();
    }
    document.querySelectorAll('a[href*="buy.stripe.com"], .checkout-link').forEach(a => {
      a.setAttribute('href', '#review-plan');
      a.textContent = 'Try the full plan · free during review →';
      a.dataset.reviewPlan = 'true';
    });
  };
  function openReviewPlan() {
    state.next30Verified = true; // This isolated review copy has no payment or server access.
    state.deepPreview = false;
    state.view = 'deepintake';
    render();
  }
  document.addEventListener('click', event => {
    if (event.target.closest('[data-review-plan]')) {
      event.preventDefault(); event.stopImmediatePropagation(); openReviewPlan();
    }
  }, true);
  const bar = document.querySelector('.baf-bar');
  if (bar) {
    const button = document.createElement('button');
    button.textContent = 'Try the full 30-day plan';
    button.style.cssText = 'margin:8px 12px;min-height:44px';
    button.dataset.reviewPlan = 'true';
    bar.append(button);
  }
  render();
})();

