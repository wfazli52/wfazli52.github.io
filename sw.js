'use strict';

// One-time retirement worker for visitors who previously installed an older
// version of the portfolio. It clears legacy caches, releases every tab, and
// unregisters itself so the new Vite build is always served from the network.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
    await self.clients.claim();

    const windows = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    });

    await self.registration.unregister();

    await Promise.all(windows.map(async (client) => {
      try {
        const url = new URL(client.url);
        if (!url.searchParams.has('redesign')) {
          url.searchParams.set('redesign', '1');
          await client.navigate(url.href);
        }
      } catch {
        // A client can disappear while the worker is activating.
      }
    }));
  })());
});
