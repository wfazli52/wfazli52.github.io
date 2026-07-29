'use strict';

const CACHE_VERSION = 'dcnet-specimen-v3.0.0-cinematic';
const OFFLINE_URL = './offline.html';
const CORE_ASSETS = [
  './',
  './index.html',
  './resume.html',
  './offline.html',
  './specimen.css',
  './specimen-3d.css?v=3',
  './site-content.js',
  './specimen.js?v=3',
  './specimen-3d.js?v=3',
  './specimen-runtime/part-1.txt?v=1',
  './specimen-runtime/part-2.txt?v=1',
  './specimen-runtime/part-3.txt?v=1',
  './specimen-runtime/part-4.txt?v=1',
  './manifest.webmanifest',
  './assets/icon.svg',
  './assets/icon-32.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png',
  './assets/maskable-icon-512.png',
  './projects/enterprise-network.html',
  './projects/linux-monitoring.html',
  './projects/incident-response.html',
  './projects/rack-inventory.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await Promise.allSettled(CORE_ASSETS.map(async (asset) => {
      const request = new Request(asset, { cache: 'reload' });
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith('dcnet-') || key.startsWith('specimen-portfolio-'))
        .filter((key) => key !== CACHE_VERSION)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    await Promise.all(windows.map(async (client) => {
      try {
        const url = new URL(client.url);
        if (url.origin === self.location.origin && !url.searchParams.has('sw-refreshed')) {
          url.searchParams.set('sw-refreshed', '1');
          await client.navigate(url.href);
        }
      } catch {}
    }));
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || (await cache.match(OFFLINE_URL));
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  const network = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || (await network) || new Response('', { status: 504, statusText: 'Offline' });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (/\.(?:css|js|svg|png|jpg|jpeg|webp|woff2?|json|webmanifest|txt)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(networkFirst(request));
});
