(() => {
  'use strict';

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
