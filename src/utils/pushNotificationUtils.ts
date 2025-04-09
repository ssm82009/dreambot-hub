
/**
 * مفتاح الويب Firebase Cloud Messaging
 */
export const FCM_VAPID_KEY = 'BBy5W3xt8ZH4MIpLelj9GvzKu6Cc5DYdQRFrNsYL4m_p9lEO-K1GHL4ZnvcWe89MzB_U9CJ8Xm9QtbtC0lOG0LA';

// معرفة ما إذا كانت هناك عملية استرداد توكن جارية
let tokenRetrievalInProgress = false;
const tokenPromises: Array<{
  resolve: (value: string | null) => void;
  reject: (reason: any) => void;
}> = [];

/**
 * تحويل المفتاح العام من Base64 إلى صفيف Uint8Array
 * @param base64String المفتاح بصيغة Base64
 * @returns صفيف Uint8Array
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * الحصول على توكن Firebase Messaging وتخزينه
 * @param messaging كائن Firebase Messaging
 * @param getTokenFn وظيفة الحصول على التوكن من Firebase
 */
export async function getOrCreateFirebaseToken(messaging: any, getTokenFn: (messaging: any, options: any) => Promise<string>): Promise<string | null> {
  // منع العمليات المتزامنة المتعددة
  if (tokenRetrievalInProgress) {
    console.log("عملية استرداد التوكن جارية بالفعل، انتظار النتيجة...");
    return new Promise<string | null>((resolve, reject) => {
      tokenPromises.push({ resolve, reject });
    });
  }
  
  tokenRetrievalInProgress = true;
  let currentToken = null;
  
  try {
    console.log("جاري طلب إذن الإشعارات...");
    
    // طلب إذن الإشعارات
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log("تم رفض إذن الإشعارات");
      return null;
    }
    
    console.log("تم منح إذن الإشعارات، جاري الحصول على التوكن...");
    
    // محاولة استخدام تسجيلات Service Worker الموجودة
    try {
      const swRegistrations = await navigator.serviceWorker.getRegistrations();
      const fmRegistration = swRegistrations.find(reg => 
        reg.scope.includes('firebase-cloud-messaging-push-scope') ||
        reg.active?.scriptURL.includes('firebase-messaging-sw.js')
      );
      
      if (fmRegistration) {
        console.log("تم العثور على تسجيل Firebase Service Worker:", fmRegistration.scope);
        
        // استخدام وظيفة getToken المستقلة من Firebase v9+
        currentToken = await getTokenFn(messaging, { 
          vapidKey: FCM_VAPID_KEY,
          serviceWorkerRegistration: fmRegistration
        });
      } else {
        console.log("لم يتم العثور على تسجيل Firebase Service Worker، محاولة الحصول على التوكن بدون تمرير التسجيل");
        
        // محاولة باستخدام getToken بدون تمرير تسجيل محدد
        currentToken = await getTokenFn(messaging, { 
          vapidKey: FCM_VAPID_KEY
        });
      }
    } catch (error) {
      console.error("خطأ في استدعاء getToken مع تسجيل:", error);
      
      // محاولة مرة أخرى بدون تمرير التسجيل
      console.log("محاولة الحصول على التوكن بدون تمرير التسجيل...");
      currentToken = await getTokenFn(messaging, { 
        vapidKey: FCM_VAPID_KEY
      });
    }
    
    if (currentToken) {
      console.log("تم الحصول على التوكن:", currentToken);
      // تخزين التوكن في localStorage بدلاً من قاعدة البيانات
      localStorage.setItem('fcm_token', currentToken);
    } else {
      console.log("لم يتم الحصول على إذن للإشعارات");
    }
  } catch (error) {
    console.error("حدث خطأ أثناء استرداد التوكن:", error);
    
    // حل الوعود المعلقة مع الخطأ
    while (tokenPromises.length > 0) {
      const promise = tokenPromises.shift();
      promise?.reject(error);
    }
    
    throw error;
  } finally {
    tokenRetrievalInProgress = false;
    
    // حل جميع الوعود المعلقة مع نفس النتيجة
    while (tokenPromises.length > 0) {
      const promise = tokenPromises.shift();
      promise?.resolve(currentToken);
    }
  }
  
  return currentToken;
}

/**
 * تسجيل مستمع لتغييرات التوكن
 * @param messaging كائن Firebase Messaging
 */
export function onFirebaseTokenRefresh(messaging: any): void {
  // تسجيل مستمع للتوكن المتجدد باستخدام Firebase v9+
  try {
    import('firebase/messaging').then(({ onMessage }) => {
      // استخدام onMessage للاستماع للرسائل القادمة
      onMessage(messaging, (payload: any) => {
        console.log('تم استلام رسالة:', payload);
      });
      
      console.log("تم تسجيل مستمع للرسائل بنجاح");
    }).catch(error => {
      console.error("فشل في استيراد وحدة المراسلة:", error);
    });
  } catch (error) {
    console.error("فشل في تسجيل مستمع للرسائل:", error);
  }
}
