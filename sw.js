'use strict';

const CACHE_VERSION = 'specimen-portfolio-v1.0.0';
const OFFLINE_URL = './offline.html';
const CORE_ASSETS = [
  './',
  './index.html',
  './specimen.css',
  './site-content.js',
  './specimen.js',
  './specimen-runtime/part-1.txt',
  './specimen-runtime/part-2.txt',
  './specimen-runtime/part-3.txt',
  './specimen-runtime/part-4.txt',
  './resume.html',
  './offline.html',
  './assets/icon.svg',
  './manifest.webmanifest',
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
    await Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || (await cache.match(OFFLINE_URL)) || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  const network = fetch(request).then(async (response) => {
    if (response.ok) await cache.put(request, response.clone());
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

  if (/\.(?:css|js|txt|svg|png|jpg|jpeg|webp|woff2?|json|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(networkFirst(request));
});
