
// إصدار ذاكرة التخزين المؤقت - قم بتغييره عند تحديث ملفات التطبيق الرئيسية
const CACHE_NAME = 'taweel-cache-v2';

// قائمة الموارد التي سيتم تخزينها مؤقتًا
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.ico'
];

// متغير عام لتتبع ما إذا تم بالفعل عرض توست التحديث
let updateNotificationShown = false;

// تثبيت خدمة العامل وتخزين الموارد الأساسية
self.addEventListener('install', (event) => {
  console.log('Service Worker: تم تثبيت خدمة العامل');
  
  // تخطي مرحلة الانتظار للتنشيط الفوري
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: تم فتح ذاكرة التخزين المؤقت');
        return cache.addAll(urlsToCache);
      })
  );
});

// تنشيط خدمة العامل وتحديث الكاش
self.addEventListener('activate', (event) => {
  console.log('Service Worker: تم تنشيط خدمة العامل');
  
  // المطالبة بالسيطرة على العملاء دون انتظار إعادة التحميل
  event.waitUntil(self.clients.claim());
  
  // حذف الكاش القديم
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: حذف كاش قديم', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});

// معالجة الطلبات وتقديم الصفحة المناسبة
self.addEventListener('fetch', (event) => {
  // تخطي طلبات غير HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // تخزين الاستجابات الناجحة للطلبات GET فقط
        if (event.request.method === 'GET' && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch(err => console.error('خطأ في تخزين الاستجابة:', err));
        }
        return response;
      })
      .catch(() => {
        // محاولة استرداد من الكاش
        return caches.match(event.request)
          .then((cachedResponse) => {
            // إذا كان الطلب لصفحة رئيسية وليس موجودًا في الكاش
            if (event.request.mode === 'navigate' && !cachedResponse) {
              return caches.match('/offline.html');
            }
            return cachedResponse;
          });
      })
  );
});

// معالجة الإشعارات Push
self.addEventListener('push', (event) => {
  console.log('Service Worker: تم استلام إشعار Push');
  
  if (!event.data) {
    console.log('Service Worker: لا توجد بيانات في الإشعار');
    return;
  }
  
  try {
    let data;
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
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'تأويل', options)
    );
    
  } catch (error) {
    console.error('Service Worker: خطأ في معالجة إشعار Push', error);
  }
});

// عند النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: تم النقر على الإشعار');
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // محاولة إيجاد نافذة مفتوحة بالفعل للتطبيق
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // إذا لم يتم العثور على نافذة مفتوحة، افتح نافذة جديدة
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
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
