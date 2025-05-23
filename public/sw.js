const CACHE_NAME = 'taweel-cache-v1';
const SW_VERSION = '1.0.1'; // زيادة هذا الرقم عند تحديث خدمة العامل
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  // نستبعد المصادر التي قد تكون مشكلة
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png'
  // يتم تحميل الصورة فقط عند الحاجة
];

// تثبيت خدمة العامل وتخزين الموارد الأساسية
self.addEventListener('install', (event) => {
  console.log('Service Worker: تم تثبيت خدمة العامل');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: تم فتح ذاكرة التخزين المؤقت');
        
        // استخدام طريقة أكثر مرونة للتخزين المؤقت، مع تخزين كل مورد على حدة
        // بدلاً من استخدام addAll الذي يفشل كله إذا فشل أي مورد فردي
        const cachePromises = urlsToCache.map(url => {
          return fetch(url)
            .then(response => {
              // إذا كان الرد ناجحاً نقوم بتخزينه
              if (response.ok) {
                return cache.put(url, response);
              }
              console.error(`خطأ في تخزين المورد: ${url}، حالة: ${response.status}`);
              return Promise.resolve(); // نستمر حتى مع وجود خطأ
            })
            .catch(error => {
              console.error(`فشل في طلب المورد: ${url}`, error);
              return Promise.resolve(); // نستمر حتى مع وجود خطأ
            });
        });
        
        return Promise.all(cachePromises);
      })
      .then(() => {
        // تخزين الإصدار الحالي لخدمة العامل
        return self.skipWaiting();
      })
  );
});

// معالجة الطلبات وتقديم الصفحة المناسبة
self.addEventListener('fetch', (event) => {
  // التحقق من أن URL الطلب صالح للتخزين المؤقت
  // نتخطى مخططات URL غير المدعومة مثل chrome-extension و blob
  const url = new URL(event.request.url);
  const isValidScheme = url.protocol.startsWith('http');
  
  if (!isValidScheme) {
    return; // تخطي الطلبات ذات المخططات غير المدعومة
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // إذا كان الطلب ناجحا، قم بنسخه وتخزينه في الكاش
        if (event.request.method === 'GET') {
          // تخزين مؤقت للاستجابات الناجحة فقط
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              try {
                cache.put(event.request, responseToCache);
              } catch (error) {
                console.error('خطأ في تخزين الاستجابة في الكاش:', error);
              }
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
  console.log('Service Worker: تم تنشيط خدمة العامل', SW_VERSION);
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: حذف كاش قديم', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
    // مباشرة المطالبة بالسيطرة على العميل دون انتظار إعادة تحميل
    .then(() => self.clients.claim())
  );
});

// معالجة الإشعارات Push والتفاعل مع النقرات على الإشعارات
self.addEventListener('push', (event) => {
  console.log('Service Worker: تم استلام إشعار Push', event);
  
  if (!event.data) {
    console.log('Service Worker: لا توجد بيانات في الإشعار');
    return;
  }
  
  try {
    // محاولة تحليل بيانات الإشعار
    let data = {};
    try {
      data = event.data.json();
      console.log('Service Worker: بيانات الإشعار', data);
    } catch (e) {
      // إذا فشل التحليل، استخدم النص البسيط
      data = {
        title: 'تأويل',
        body: event.data.text(),
      };
      console.log('Service Worker: نص الإشعار البسيط', event.data.text());
    }
    
    // تكوين خيارات الإشعار
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
    console.log('Service Worker: عرض الإشعار', data.title, options);
    event.waitUntil(
      self.registration.showNotification(data.title || 'تأويل', options)
    );
    
  } catch (error) {
    console.error('Service Worker: خطأ في معالجة إشعار Push', error);
    
    // محاولة إظهار إشعار بسيط في حالة وجود خطأ
    event.waitUntil(
      self.registration.showNotification('تأويل', {
        body: 'تم استلام إشعار جديد',
        icon: '/android-chrome-192x192.png'
      })
    );
  }
});

// استقبال رسائل Firebase Cloud Messaging
self.addEventListener('firebase-messaging-sw-message', (event) => {
  console.log('Service Worker: تم استلام رسالة FCM', event.data);
  
  const { notification } = event.data;
  if (!notification) {
    return;
  }
  
  // عرض الإشعار باستخدام واجهة برمجة التطبيقات showNotification
  const options = {
    body: notification.body || 'تم استلام إشعار جديد',
    icon: notification.icon || '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    dir: 'rtl',
    lang: 'ar',
    vibrate: [100, 50, 100],
    data: {
      url: notification.click_action || '/',
      type: notification.type || 'general'
    }
  };
  
  self.registration.showNotification(notification.title || 'تأويل', options);
});

// عند النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: تم النقر على الإشعار', event);
  event.notification.close();
  
  try {
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
  } catch (error) {
    console.error('Service Worker: خطأ في معالجة النقر على الإشعار', error);
    
    // في حالة وجود خطأ، فتح الصفحة الرئيسية
    event.waitUntil(clients.openWindow('/'));
  }
});

// استقبال الرسائل من صفحات التطبيق
self.addEventListener('message', (event) => {
  console.log('Service Worker: تم استلام رسالة', event.data);
  
  // إضافة معالج لرسائل استعلام الإصدار
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: SW_VERSION
    });
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// دعم Firebase Cloud Messaging
// يجب إضافة هذا التعليق البرمجي لتفعيل دعم FCM في خدمة العامل
importScripts('https://www.gstatic.com/firebasejs/9.19.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.19.1/firebase-messaging-compat.js');

// سيتم تهيئة Firebase من قبل FCM تلقائيًا
// لا نحتاج إلى تعيين التكوين هنا
