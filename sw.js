// sw.js - Background Service Worker for FreeChat
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

// Listen for background Web Push calls
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'Incoming Call', body: 'Someone is calling you on FreeChat' };
  }

  const title = data.title || 'Incoming Call';
  const options = {
    body: data.body || 'Tap to answer',
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    vibrate: [500, 250, 500, 250, 500, 250, 500],
    tag: 'incoming-call',
    renotify: true,
    requireInteraction: true,
    data: {
      url: self.registration.scope,
      callId: data.callId,
      from: data.from,
      video: data.video
    },
    actions: [
      { action: 'answer', title: '📞 Answer' },
      { action: 'decline', title: '✕ Decline' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Click notification to open app directly into the call
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
