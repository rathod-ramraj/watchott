self.addEventListener('install', () => {
  // Skip over the "waiting" lifecycle state, to ensure that our
  // new service worker is activated immediately, even if there's
  // another tab open controlled by our older service worker code.
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  // Optional: Get a list of all the current open windows/tabs under
  // our service worker's control, and force them to reload.
  // This can be useful if the older service worker was doing something
  // that breaks the new app version.
  self.registration.unregister().then(() => {
    self.clients.matchAll().then((clients) => {
      clients.forEach(client => client.navigate(client.url))
    });
  });
});
