
const CACHE_NAME = 'taweel-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/main.tsx',
  '/src/index.css',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/lovable-uploads/476e1743-22bf-49a8-8049-3cc6796c563d.png'
];

// تثبيت خدمة العامل وتخزين الموارد الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('تم فتح ذاكرة التخزين المؤقت');
        return cache.addAll(urlsToCache);
      })
  );
});

// معالجة الطلبات وتقديم الصفحة المناسبة
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // إذا كان الطلب ناجحا، قم بنسخه وتخزينه في الكاش
        if (event.request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // إذا فشل الطلب وكان طلب صفحة، أرجع صفحة عدم الاتصال
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        
        // محاولة استرداد من الكاش للموارد الأخرى
        return caches.match(event.request);
      })
  );
});

// تحديث الكاش عند تحديث خدمة العامل
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// معالجة الإشعارات Push
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'تأويل',
      body: event.data.text(),
    };
  }
  
  const options = {
    body: data.body || 'تم استلام إشعار جديد',
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    dir: 'rtl',
    lang: 'ar',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      type: data.type || 'general'
    },
    actions: []
  };
  
  // إضافة أزرار تفاعلية بناءً على نوع الإشعار
  if (data.type === 'ticket') {
    options.actions = [
      {
        action: 'view',
        title: 'عرض التذكرة'
      },
      {
        action: 'close',
        title: 'إغلاق'
      }
    ];
  } else if (data.type === 'payment') {
    options.actions = [
      {
        action: 'view',
        title: 'عرض التفاصيل'
      }
    ];
  } else if (data.type === 'subscription') {
    options.actions = [
      {
        action: 'renew',
        title: 'تجديد الاشتراك'
      }
    ];
  }
  
  // إظهار الإشعار
  event.waitUntil(
    self.registration.showNotification(data.title || 'تأويل', options)
  );
});

// عند النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // التعامل مع أزرار الإشعار
  if (event.action === 'view') {
    const url = event.notification.data.url;
    event.waitUntil(clients.openWindow(url));
    return;
  }
  
  if (event.action === 'renew') {
    event.waitUntil(clients.openWindow('/pricing'));
    return;
  }
  
  // التعامل مع النقرة العادية على الإشعار
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      const url = event.notification.data.url || '/';
      
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

// استقبال الرسائل من صفحات التطبيق
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
