(() => {
  'use strict';
  if (window.__AF_FOCUS_PERFORMANCE__) return;
  window.__AF_FOCUS_PERFORMANCE__ = true;

  const html = document.documentElement;
  const body = document.body;
  const root = document.getElementById('root');
  const altModes = new Set(['google', 'amazon', 'microsoft']);

  function apply(name) {
    const alternate = altModes.has(name);
    body.classList.toggle('focus-alt-active', alternate);

    if (root) {
      root.style.display = alternate ? 'none' : '';
      root.toggleAttribute('aria-hidden', alternate);
    }

    window.dispatchEvent(new CustomEvent('future:hero-pause', { detail: { paused: alternate } }));
  }

  window.addEventListener('future:focus-theme', (event) => apply(event.detail?.name || html.dataset.focus || 'original'));
  new MutationObserver(() => apply(html.dataset.focus || 'original'))
    .observe(html, { attributes: true, attributeFilter: ['data-focus'] });

  apply(html.dataset.focus || 'original');
})();