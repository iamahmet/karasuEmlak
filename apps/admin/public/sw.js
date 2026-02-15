// Minimal service worker placeholder for development and local testing.
// If you enable PWA in production for admin, replace/overwrite this file at build time.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

