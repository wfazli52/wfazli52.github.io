(() => {
  'use strict';

  let attempts = 0;

  const ensureStylesheet = (href, marker) => {
    if (document.querySelector(`link[${marker}]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute(marker, '');
    document.head.appendChild(link);
  };

  const loadFocusIdentity = () => {
    ensureStylesheet('/focus-themes.css?v=8', 'data-focus-themes-css');
    ensureStylesheet('/focus-3d.css?v=8', 'data-focus-3d-css');
    if (document.querySelector('script[data-focus-themes]')) return;
    const focus = document.createElement('script');
    focus.src = '/focus-themes.js?v=8';
    focus.defer = true;
    focus.dataset.focusThemes = '';
    document.body.appendChild(focus);
  };

  const loadQuality = () => {
    loadFocusIdentity();
    if (document.querySelector('script[data-future-quality]')) return;
    const quality = document.createElement('script');
    quality.src = '/future-quality.js?v=7';
    quality.defer = true;
    quality.dataset.futureQuality = '';
    document.body.appendChild(quality);
  };

  const loadPolish = () => {
    loadFocusIdentity();
    if (document.querySelector('script[data-future-polish]')) {
      loadQuality();
      return;
    }
    const polish = document.createElement('script');
    polish.src = '/future-polish.js?v=7';
    polish.defer = true;
    polish.dataset.futurePolish = '';
    polish.addEventListener('load', loadQuality, { once: true });
    document.body.appendChild(polish);
  };

  const load = () => {
    attempts += 1;
    if (document.querySelector('.hero')) {
      loadFocusIdentity();
      if (document.querySelector('script[data-future-ui]')) {
        loadPolish();
        return;
      }
      const script = document.createElement('script');
      script.src = '/future-ui.js?v=7';
      script.defer = true;
      script.dataset.futureUi = '';
      script.addEventListener('load', loadPolish, { once: true });
      document.body.appendChild(script);
      return;
    }
    if (attempts < 600) requestAnimationFrame(load);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load, { once: true });
  } else {
    load();
  }
})();
