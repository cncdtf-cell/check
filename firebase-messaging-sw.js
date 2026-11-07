// Firebase Cloud Messaging - Service Worker (Sardar Haat)
// 🔧 [v2] নোটিফিকেশনে ক্লিক করলে 404 আসার সমাধান: আগে লিংক ডোমেইনের মূলে ("/") খুলত — সাইট সাব-ফোল্ডারে/ভিন্ন ফাইল-নামে থাকলে 404।
// এখন: (১) অ্যাপ আগে থেকে খোলা থাকলে সেই ট্যাবেই ফোকাস + ঠিক ট্যাবে যাওয়ার বার্তা (নতুন পেজ খোলে না, তাই 404 অসম্ভব);
// (২) খোলা না থাকলে — অ্যাপ নিজে যে পেজ-ঠিকানা (pagePath) জমা রেখেছে সেটাই খোলে; না থাকলে এই ফাইলের ফোল্ডার (scope)।
// এই হ্যান্ডলার Firebase-এর নিজস্ব হ্যান্ডলারের আগে বসে ওটাকে থামায় (FCM আর ভুল লিংক খুলতে পারে না)।
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
