(() => {
  'use strict';
  if (window.__AF_FOCUS_PERFORMANCE__) return;
  window.__AF_FOCUS_PERFORMANCE__ = true;

  const html = document.documentElement;
  const body = document.body;
  const root = document.getElementById('root');
  const altModes = new Set(['google', 'amazon', 'microsoft']);
  let current = 'original';

  function setClasses(name) {
    body.classList.remove('focus-mode-google', 'focus-mode-amazon', 'focus-mode-microsoft');
    if (altModes.has(name)) body.classList.add(`focus-mode-${name}`);
  }

  function stopOutgoing(name) {
    if (name === 'amazon') window.dispatchEvent(new CustomEvent('amazon-focus:stop'));
    if (name === 'google') window.dispatchEvent(new CustomEvent('google-focus:stop'));
    if (name === 'microsoft') window.dispatchEvent(new CustomEvent('microsoft-focus:stop'));
  }

  function startIncoming(name) {
    if (name === 'amazon') window.dispatchEvent(new CustomEvent('amazon-focus:start'));
    if (name === 'google') window.dispatchEvent(new CustomEvent('google-focus:start'));
    if (name === 'microsoft') window.dispatchEvent(new CustomEvent('microsoft-focus:start'));
  }

  function apply(name) {
    const next = altModes.has(name) ? name : 'original';
    if (next === current && body.classList.contains(next === 'original' ? 'focus-original-active' : `focus-mode-${next}`)) return;

    stopOutgoing(current);
    body.classList.add('focus-switching');
    setClasses(next);

    const alternate = next !== 'original';
    body.classList.toggle('focus-alt-active', alternate);
    body.classList.toggle('focus-original-active', !alternate);

    if (root) {
      root.style.display = alternate ? 'none' : '';
      root.toggleAttribute('aria-hidden', alternate);
    }

    window.dispatchEvent(new CustomEvent('future:hero-pause', { detail: { paused: alternate } }));
    current = next;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        body.classList.remove('focus-switching');
        startIncoming(next);
      });
    });

    if (!alternate && typeof window.__loadOriginalPortfolioEffects === 'function') {
      window.__loadOriginalPortfolioEffects();
    }
  }

  window.addEventListener('future:focus-theme', (event) => apply(event.detail?.name || html.dataset.focus || 'original'));
  new MutationObserver(() => apply(html.dataset.focus || 'original'))
    .observe(html, { attributes: true, attributeFilter: ['data-focus'] });

  document.addEventListener('visibilitychange', () => {
    body.classList.toggle('focus-page-hidden', document.hidden);
  });

  apply(html.dataset.focus || 'original');
})();