// Firebase Cloud Messaging - Service Worker (Sardar Haat)
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

// ব্যাকগ্রাউন্ডে নোটিফিকেশন এলে (অ্যাপ বন্ধ থাকলে) দেখানো হবে
messaging.onBackgroundMessage((payload) => {
  const n = payload.notification || {};
  const d = payload.data || {};
  const title = n.title || d.title || 'সরদার হাট মাহফিল';
  self.registration.showNotification(title, {
    body: n.body || d.body || '',
    icon: n.icon || d.icon || undefined,
    data: { link: d.link || '/' }
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || './';
  event.waitUntil(clients.openWindow(new URL(link, self.registration.scope).href));
});
