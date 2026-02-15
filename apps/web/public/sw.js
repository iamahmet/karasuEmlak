// Minimal service worker placeholder for development and local testing.
// In production builds, next-pwa generates and overwrites `public/sw.js`.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

