
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

// المفتاح العام VAPID
export const PUBLIC_VAPID_KEY = 'BLBz5HW9GU26px7aSGgqZR9xoA7Sj5Q8q0c7_KMgPgTcgccR9EkTuZAs5TmGpJ9liMPHvw4-l7-Ftm1Qz-5qvEs';

// تسجيل خدمة العامل
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('خدمة العامل غير مدعومة في هذا المتصفح');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('تم تسجيل خدمة العامل بنجاح:', registration.scope);
    return registration;
  } catch (error) {
    console.error('خطأ في تسجيل خدمة العامل:', error);
    return null;
  }
}

// التحقق من وجود اشتراك حالي
export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) return null;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
  } catch (error) {
    console.error('خطأ في الحصول على الاشتراك الحالي:', error);
    return null;
  }
}

// الاشتراك في إشعارات الدفع
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) return null;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
    });
    
    console.log('تم الاشتراك بنجاح:', subscription);
    return subscription;
  } catch (error) {
    console.error('خطأ في الاشتراك:', error);
    return null;
  }
}

// إلغاء الاشتراك من إشعارات الدفع
export async function unsubscribeFromPush(subscription: PushSubscription): Promise<boolean> {
  try {
    const result = await subscription.unsubscribe();
    console.log('تم إلغاء الاشتراك بنجاح');
    return result;
  } catch (error) {
    console.error('خطأ في إلغاء الاشتراك:', error);
    return false;
  }
}
