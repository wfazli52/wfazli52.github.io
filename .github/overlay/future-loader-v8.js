(() => {
  'use strict';
  let attempts = 0;
  let originalStarted = false;

  const ensureStylesheet = (href, marker) => {
    if (document.querySelector(`link[${marker}]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute(marker, '');
    document.head.appendChild(link);
  };

  const loadScript = (src, marker, onload) => {
    if (document.querySelector(`script[${marker}]`)) {
      onload?.();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.setAttribute(marker, '');
    if (onload) script.addEventListener('load', onload, { once: true });
    document.body.appendChild(script);
  };

  const loadFocusApp = () => {
    ensureStylesheet('/focus-themes.css?build=focus-active', 'data-focus-themes-css');
    ensureStylesheet('/focus-v60.css?build=focus-active', 'data-focus-app-css');
    ensureStylesheet('/focus-amazon.css?build=focus-active', 'data-focus-amazon-css');
    ensureStylesheet('/focus-performance.css?build=focus-active', 'data-focus-performance-css');
    ensureStylesheet('/focus-active-effects.css?build=focus-active', 'data-focus-active-effects-css');
    ensureStylesheet('/focus-signatures.css?build=focus-active', 'data-focus-signatures-css');
    ensureStylesheet('/focus-scroll.css?build=focus-active', 'data-focus-scroll-css');

    loadScript('/focus-themes.js?build=focus-active', 'data-focus-themes');
    loadScript('/focus-v60.js?build=focus-active', 'data-focus-app');
    loadScript('/focus-performance.js?build=focus-active', 'data-focus-performance');
    loadScript('/focus-active-effects.js?build=focus-active', 'data-focus-active-effects');
    loadScript('/focus-functional.js?build=focus-active', 'data-focus-functional');
    loadScript('/focus-amazon.js?build=focus-active', 'data-focus-amazon');
    loadScript('/focus-signatures.js?build=focus-active', 'data-focus-signatures');
    loadScript('/focus-scroll.js?build=focus-active', 'data-focus-scroll');
  };

  const loadQuality = () => {
    if (document.querySelector('script[data-future-quality]')) return;
    loadScript('/future-quality.js?v=7', 'data-future-quality');
  };

  const loadPolish = () => {
    if (document.querySelector('script[data-future-polish]')) {
      loadQuality();
      return;
    }
    loadScript('/future-polish.js?v=7', 'data-future-polish', loadQuality);
  };

  const loadOriginal = () => {
    if (originalStarted) return;
    originalStarted = true;
    if (document.querySelector('script[data-future-ui]')) {
      loadPolish();
      return;
    }
    loadScript('/future-ui.js?v=7', 'data-future-ui', loadPolish);
  };
  window.__loadOriginalPortfolioEffects = loadOriginal;

  const savedFocus = () => {
    try {
      const value = localStorage.getItem('af_focus_identity_v1');
      return ['google', 'amazon', 'microsoft'].includes(value) ? value : 'original';
    } catch {
      return 'original';
    }
  };

  const boot = () => {
    attempts += 1;
    if (!document.querySelector('.hero')) {
      if (attempts < 600) requestAnimationFrame(boot);
      return;
    }
    loadFocusApp();
    if (savedFocus() === 'original') loadOriginal();
  };

  window.addEventListener('future:focus-theme', (event) => {
    if ((event.detail?.name || 'original') === 'original') loadOriginal();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();