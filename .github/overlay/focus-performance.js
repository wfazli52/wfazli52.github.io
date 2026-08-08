(() => {
  'use strict';
  if (window.__AF_FOCUS_PERFORMANCE__) return;
  window.__AF_FOCUS_PERFORMANCE__ = true;

  const html = document.documentElement;
  const body = document.body;
  const root = document.getElementById('root');
  const altModes = new Set(['google', 'amazon', 'microsoft']);

  function setMode(name) {
    const alternate = altModes.has(name);
    body.classList.toggle('focus-alt-active', alternate);

    if (root) {
      if (alternate) {
        root.dataset.focusPrevDisplay = root.style.display || '';
        root.style.display = 'none';
        root.setAttribute('aria-hidden', 'true');
      } else {
        root.style.display = root.dataset.focusPrevDisplay || '';
        root.removeAttribute('aria-hidden');
      }
    }

    window.dispatchEvent(new CustomEvent('future:hero-pause', { detail: { paused: alternate } }));

    if (!alternate && typeof window.__loadOriginalPortfolioEffects === 'function') {
      window.__loadOriginalPortfolioEffects();
    }
  }

  window.addEventListener('future:focus-theme', (event) => setMode(event.detail?.name || html.dataset.focus || 'original'));
  new MutationObserver(() => setMode(html.dataset.focus || 'original'))
    .observe(html, { attributes: true, attributeFilter: ['data-focus'] });

  setMode(html.dataset.focus || 'original');
})();