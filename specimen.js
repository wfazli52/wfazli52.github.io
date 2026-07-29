(() => {
  'use strict';

  try {
    const url = new URL(location.href);
    if (url.searchParams.has('sw-refreshed')) {
      url.searchParams.delete('sw-refreshed');
      history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }

    const requestedTheme = url.searchParams.get('theme');
    const storedTheme = localStorage.getItem('specimen-theme');
    if (requestedTheme !== 'paper' && requestedTheme !== 'carbon' && !storedTheme) {
      document.documentElement.dataset.theme = 'carbon';
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.content = '#080a0f';
    }
  } catch {}

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'specimen-3d.css?v=3';
  style.dataset.specimen3dStyle = '';
  document.head.appendChild(style);

  const moduleScript = document.createElement('script');
  moduleScript.type = 'module';
  moduleScript.src = 'specimen-3d.js?v=3';
  moduleScript.dataset.specimen3d = '';
  moduleScript.addEventListener('error', () => {
    console.warn('The cinematic WebGL showcase could not load; the lightweight canvas fallback remains active.');
  });
  document.head.appendChild(moduleScript);

  const parts = [1, 2, 3, 4].map((number) => `specimen-runtime/part-${number}.txt?v=1`);

  Promise.all(parts.map(async (url) => {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load ${url}: ${response.status}`);
    return response.text();
  }))
    .then((sourceParts) => {
      const source = `${sourceParts.join('\n')}\n//# sourceURL=specimen-runtime.js`;
      (0, eval)(source);
      if (document.readyState !== 'loading') {
        document.dispatchEvent(new Event('DOMContentLoaded'));
      }
    })
    .catch((error) => {
      console.error(error);
      document.querySelector('[data-startup]')?.remove();
      const notice = document.querySelector('[data-template-notice]');
      if (notice) {
        notice.hidden = false;
        const copy = notice.querySelector('p');
        if (copy) copy.textContent = 'The interactive layer could not load. Refresh the page or inspect the browser console.';
      }
    });
})();
