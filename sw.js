'use strict';

const CACHE_VERSION = 'dcnet-portfolio-v4.0.0';
const OFFLINE_URL = './offline.html';
const CORE_ASSETS = [
  './',
  './index.html',
  './resume.html',
  './recruiter.html',
  './offline.html',
  './styles.css',
  './fx.css',
  './fx.js',
  './config.js',
  './script.js',
  './command-center.js',
  './proof-data.js',
  './proof-mode.css',
  './proof-mode.js',
  './portfolio-data.js',
  './portfolio-suite.css',
  './portfolio-suite.js',
  './case-study.css',
  './case-study.js',
  './manifest.webmanifest',
  './assets/brand-mark.svg',
  './assets/icon.svg',
  './assets/maskable-icon.svg',
  './assets/social-card.svg',
  './assets/portfolio-qr.svg',
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
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('dcnet-portfolio-') && key !== CACHE_VERSION).map((key) => caches.delete(key)));
    await self.clients.claim();
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

  if (/\.(?:css|js|svg|png|jpg|jpeg|webp|woff2?|json|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(networkFirst(request));
});
