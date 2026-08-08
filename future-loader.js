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
    ensureStylesheet('/cinematic-reel.css?build=original-cinematic', 'data-cinematic-reel-css');
    loadScript('/cinematic-reel.js?build=original-cinematic', 'data-cinematic-reel');
    if (document.querySelector('script[data-future-ui]')) {
      loadPolish();
      return;
    }
    loadScript('/future-ui.js?v=7', 'data-future-ui', loadPolish);
  };

  const boot = () => {
    attempts += 1;
    if (!document.querySelector('.hero')) {
      if (attempts < 600) requestAnimationFrame(boot);
      return;
    }
    try { localStorage.removeItem('af_focus_identity_v1'); } catch {}
    document.documentElement.removeAttribute('data-focus');
    document.body.classList.remove('focus-alt-active','focus-mode-google','focus-mode-amazon','focus-mode-microsoft','focus-native-scroll');
    loadOriginal();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
