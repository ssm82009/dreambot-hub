
// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js');

// تعريف متغيرات عامة ليتم استخدامها لاحقًا
const CACHE_NAME = 'fcm-cache-v1';

// تهيئة تطبيق Firebase (ستتم إضافة التكوين عند تنفيذ الكود)
firebase.initializeApp({
  // سيتم الحصول على هذه القيم من localStorage عند بدء التشغيل
  // تُستخدم قيم افتراضية هنا لتجنب الأخطاء وسيتم تحديثها لاحقًا
  apiKey: "AIzaSyBzL5x6Cu9fkaynW0keptNdB26OAE5d694",
  authDomain: "taweelapp-105b3.firebaseapp.com",
  projectId: "taweelapp-105b3",
  storageBucket: "taweelapp-105b3.appspot.com",
  messagingSenderId: "469199706159",
  appId: "1:469199706159:web:a8673ea99574c71c104eda"
});

// تهيئة مكون المراسلة
const messaging = firebase.messaging();

// استقبال الرسائل عندما يكون التطبيق في الخلفية
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] تم استلام رسالة في الخلفية:', payload);
  
  // يمكنك تخصيص الإشعار هنا
  const notificationTitle = payload.notification?.title || 'تأويل';
  const notificationOptions = {
    body: payload.notification?.body || 'تم استلام إشعار جديد',
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    dir: 'rtl',
    lang: 'ar',
    data: payload.data || {},
    vibrate: [100, 50, 100]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// عند النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] تم النقر على الإشعار', event);
  event.notification.close();
  
  // التعامل مع النقرة على الإشعار
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      const url = event.notification.data?.url || '/';
      
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// استقبال رسائل من التطبيق
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    console.log('[firebase-messaging-sw.js] تم استلام تكوين Firebase جديد');
    // تحديث تكوين Firebase
    try {
      firebase.app().delete().then(() => {
        firebase.initializeApp(event.data.config);
      });
    } catch (error) {
      console.error('[firebase-messaging-sw.js] خطأ في تحديث التكوين:', error);
    }
  }
});

// تثبيت خدمة العامل
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] تم تثبيت Firebase Cloud Messaging SW');
  self.skipWaiting();
});

// تنشيط خدمة العامل
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] تم تنشيط Firebase Cloud Messaging SW');
  event.waitUntil(clients.claim());
});
