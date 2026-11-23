// Firebase Cloud Messaging - Service Worker (Sardar Haat)
self.addEventListener('notificationclick', (event) => {
  event.stopImmediatePropagation();
  event.notification.close();
  const raw = event.notification.data || {};
  const fcm = raw.FCM_MSG || {};
  const data = Object.assign({}, raw, fcm.data || {});
  const link = String(data.link || '');
  let search = '';
  const qi = link.indexOf('?');
  if (qi >= 0) search = link.slice(qi);
  else if (data.type) search = '?openTarget=' + encodeURIComponent(data.type + (data.id ? ':' + data.id : ''));
  const payload = { type: 'notification-click', data: { type: data.type, id: data.id } };
  event.waitUntil((async () => {
    const wins = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const app = wins.find(w => w.url.indexOf(self.registration.scope) === 0) || wins[0];
    if (app) { try { await app.focus(); } catch (e) { } app.postMessage(payload); return; }
    let base = '';
    try { const c = await caches.open('mf-app'); const r = await c.match('pagePath'); if (r) base = await r.text(); } catch (e) { }
    if (!/^https?:\/\//.test(base)) base = self.registration.scope;
    await clients.openWindow(base.split('?')[0].split('#')[0] + search);
  })());
});

self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', () => { /* pass-through */ });

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAV8Qxf4QRwQoS3Tm88SwL7UfOKxVfAABs",
  authDomain: "fund-sarder.firebaseapp.com",
  projectId: "fund-sarder",
  storageBucket: "fund-sarder.firebasestorage.app",
  messagingSenderId: "293320057381",
  appId: "1:293320057381:web:76e6656c727c1517e155cc"
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const n = payload.notification || {};
  const d = payload.data || {};
  self.registration.showNotification(n.title || d.title || 'সরদার হাট মাহফিল', {
    body: n.body || d.body || '',
    icon: n.icon || d.icon || undefined,
    data: { link: d.link || '/' }
  });
});
