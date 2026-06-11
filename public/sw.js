/* Service worker для web-push уведомлений TajFix. */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// Пустой fetch-обработчик — нужен для критериев «устанавливаемого» PWA.
self.addEventListener('fetch', () => {});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'TajFix', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'TajFix';
  const options = {
    body: data.body || '',
    icon: '/icon.svg',
    badge: '/icon.svg',
    data: { url: data.link || '/notifications' },
    tag: data.tag || undefined,
    renotify: Boolean(data.tag)
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/notifications';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Если вкладка уже открыта — переводим её на нужный адрес и фокусируем.
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url).catch(() => {});
          return client.focus();
        }
      }
      // Иначе открываем новое окно.
      if (self.clients.openWindow) return self.clients.openWindow(url);
      return undefined;
    })
  );
});
