(() => {
  'use strict';
  let attempts = 0;
  const load = () => {
    attempts += 1;
    if (document.querySelector('.hero')) {
      if (document.querySelector('script[data-future-ui]')) return;
      const script = document.createElement('script');
      script.src = '/future-ui.js?v=6';
      script.defer = true;
      script.dataset.futureUi = '';
      document.body.appendChild(script);
      return;
    }
    if (attempts < 600) requestAnimationFrame(load);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, { once: true });
  else load();
})();
