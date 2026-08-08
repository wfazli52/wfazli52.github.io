(() => {
  'use strict';
  if (window.__AF_FOCUS_NATIVE_SCROLL__) return;
  window.__AF_FOCUS_NATIVE_SCROLL__ = true;

  const html = document.documentElement;
  const body = document.body;
  const altModes = new Set(['google', 'amazon', 'microsoft']);
  let originalScrollY = 0;
  let wasAlternate = false;
  let syncing = false;

  function isAlternate() {
    return altModes.has(html.dataset.focus || 'original');
  }

  function unlockNativeScroll() {
    if (syncing) return;
    syncing = true;
    const alternate = isAlternate();

    html.classList.toggle('focus-native-scroll', alternate);

    if (alternate) {
      if (!wasAlternate) originalScrollY = window.scrollY || 0;

      body.style.removeProperty('overflow');
      body.style.setProperty('overflow-x', 'hidden', 'important');
      body.style.setProperty('overflow-y', 'auto', 'important');
      body.style.removeProperty('height');
      body.style.removeProperty('position');

      html.style.setProperty('overflow-x', 'hidden', 'important');
      html.style.setProperty('overflow-y', 'auto', 'important');
      html.style.removeProperty('height');

      const app = document.querySelector('.focus-v60-app');
      if (app) {
        app.style.removeProperty('overflow');
        app.style.removeProperty('height');
        app.style.removeProperty('max-height');
      }
    } else {
      html.classList.remove('focus-native-scroll');
      body.style.removeProperty('overflow-x');
      body.style.removeProperty('overflow-y');
      html.style.removeProperty('overflow-x');
      html.style.removeProperty('overflow-y');

      if (wasAlternate) {
        requestAnimationFrame(() => window.scrollTo({ top: originalScrollY, left: 0, behavior: 'auto' }));
      }
    }

    wasAlternate = alternate;
    syncing = false;
  }

  function settle() {
    unlockNativeScroll();
    requestAnimationFrame(unlockNativeScroll);
    setTimeout(unlockNativeScroll, 220);
    setTimeout(unlockNativeScroll, 420);
  }

  window.addEventListener('future:focus-theme', settle);
  window.addEventListener('google-focus:start', settle);
  window.addEventListener('amazon-focus:start', settle);
  window.addEventListener('microsoft-focus:start', settle);

  new MutationObserver(settle).observe(html, {
    attributes: true,
    attributeFilter: ['data-focus']
  });

  /* focus-v60.js historically writes body.style.overflow='hidden'. Undo only
     that legacy lock while an alternate focus app is active. */
  new MutationObserver(() => {
    if (!isAlternate() || syncing) return;
    const overflow = body.style.overflow;
    const overflowY = body.style.overflowY;
    if (overflow === 'hidden' || overflowY === 'hidden') unlockNativeScroll();
  }).observe(body, { attributes: true, attributeFilter: ['style'] });

  document.addEventListener('keydown', (event) => {
    if (!isAlternate()) return;
    if (event.defaultPrevented) return;
    const target = event.target;
    const typing = target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
    if (typing) return;

    const step = Math.max(260, window.innerHeight * .82);
    if (event.key === 'PageDown') {
      event.preventDefault();
      window.scrollBy({ top: step, behavior: 'smooth' });
    } else if (event.key === 'PageUp') {
      event.preventDefault();
      window.scrollBy({ top: -step, behavior: 'smooth' });
    } else if (event.key === 'Home') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (event.key === 'End') {
      event.preventDefault();
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  });

  settle();
})();
