
import { supabase } from '@/integrations/supabase/client';

// المتغيرات التي سنحتاجها من تكوين Firebase
let firebaseApp: any = null;
let firebaseMessaging: any = null;
let firebaseConfig: any = null;

// دالة لتحميل مكتبات Firebase
const loadFirebaseScripts = async (): Promise<void> => {
  if (document.getElementById('firebase-app-script') && document.getElementById('firebase-messaging-script')) {
    return;
  }

  return new Promise((resolve, reject) => {
    // تحميل Firebase App
    const appScript = document.createElement('script');
    appScript.id = 'firebase-app-script';
    appScript.src = 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app-compat.js';
    appScript.async = true;
    appScript.onload = () => {
      // تحميل Firebase Messaging بعد تحميل Firebase App
      const messagingScript = document.createElement('script');
      messagingScript.id = 'firebase-messaging-script';
      messagingScript.src = 'https://www.gstatic.com/firebasejs/9.19.1/firebase-messaging-compat.js';
      messagingScript.async = true;
      messagingScript.onload = () => {
        resolve();
      };
      messagingScript.onerror = (error) => {
        console.error('Error loading Firebase Messaging:', error);
        reject(error);
      };
      document.head.appendChild(messagingScript);
    };
    appScript.onerror = (error) => {
      console.error('Error loading Firebase App:', error);
      reject(error);
    };
    document.head.appendChild(appScript);
  });
};

// دالة لجلب إعدادات Firebase من Supabase
export const fetchFirebaseConfig = async (): Promise<any> => {
  try {
    if (firebaseConfig) return firebaseConfig;
    
    const { data, error } = await supabase
      .from('firebase_config')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('لا توجد إعدادات Firebase في قاعدة البيانات');
    }

    firebaseConfig = {
      apiKey: data.api_key,
      authDomain: data.auth_domain,
      projectId: data.project_id,
      storageBucket: data.storage_bucket,
      messagingSenderId: data.messaging_sender_id,
      appId: data.app_id,
      measurementId: data.measurement_id
    };

    return firebaseConfig;
  } catch (error) {
    console.error('خطأ في جلب إعدادات Firebase:', error);
    return null;
  }
};

// تهيئة تطبيق Firebase
export const initializeFirebase = async (): Promise<boolean> => {
  try {
    // جلب إعدادات Firebase
    const config = await fetchFirebaseConfig();
    if (!config) {
      console.error('لم يتم العثور على إعدادات Firebase صالحة');
      return false;
    }

    // تحميل مكتبات Firebase
    await loadFirebaseScripts();

    // تهيئة تطبيق Firebase
    if (!window.firebase) {
      console.error('لم يتم تحميل مكتبات Firebase بشكل صحيح');
      return false;
    }

    // إذا كان التطبيق مُهيأ بالفعل، نعيد true
    if (firebaseApp) {
      return true;
    }

    // تهيئة Firebase
    firebaseApp = window.firebase.initializeApp(config);
    console.log('تم تهيئة Firebase بنجاح');
    return true;
  } catch (error) {
    console.error('خطأ في تهيئة Firebase:', error);
    return false;
  }
};

// الحصول على مثيل Messaging
export const getFirebaseMessaging = async (): Promise<any> => {
  try {
    if (firebaseMessaging) {
      return firebaseMessaging;
    }

    const isInitialized = await initializeFirebase();
    if (!isInitialized || !firebaseApp) {
      throw new Error('لم يتم تهيئة Firebase بشكل صحيح');
    }

    if (!window.firebase.messaging || typeof window.firebase.messaging !== 'function') {
      throw new Error('Firebase Messaging غير متاح');
    }

    firebaseMessaging = firebaseApp.messaging();
    return firebaseMessaging;
  } catch (error) {
    console.error('خطأ في الحصول على Firebase Messaging:', error);
    return null;
  }
};

// طلب إذن واستخراج توكن FCM
export const getFCMToken = async (vapidKey?: string): Promise<string | null> => {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      throw new Error('لم يتم تهيئة Firebase Messaging بشكل صحيح');
    }

    // طلب إذن الإشعارات إذا لم يكن ممنوحًا بالفعل
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('لم يتم منح إذن الإشعارات');
    }

    // تكوين Service Worker
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration('/sw.js');
        if (registration) {
          messaging.useServiceWorker(registration);
        }
      }
    } catch (swError) {
      console.warn('خطأ في إعداد Service Worker لـ FCM:', swError);
    }

    // الحصول على توكن FCM
    const options: any = {};
    if (vapidKey) {
      options.vapidKey = vapidKey;
    }

    const token = await messaging.getToken(options);
    console.log('تم الحصول على توكن FCM بنجاح:', token);
    return token;
  } catch (error) {
    console.error('خطأ في الحصول على توكن FCM:', error);
    return null;
  }
};

// حذف توكن FCM
export const deleteFCMToken = async (): Promise<boolean> => {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return false;

    await messaging.deleteToken();
    console.log('تم حذف توكن FCM بنجاح');
    return true;
  } catch (error) {
    console.error('خطأ في حذف توكن FCM:', error);
    return false;
  }
};

// الاستماع لرسائل FCM في الواجهة الأمامية
export const onFCMMessage = async (callback: (payload: any) => void): Promise<() => void> => {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      throw new Error('لم يتم تهيئة Firebase Messaging بشكل صحيح');
    }

    const unsubscribe = messaging.onMessage(callback);
    return unsubscribe;
  } catch (error) {
    console.error('خطأ في الاستماع لرسائل FCM:', error);
    return () => {};
  }
};

// استدعاء هذه الدالة لتهيئة Firebase عند بداية التطبيق
export const setupFirebase = async (): Promise<boolean> => {
  try {
    const isInitialized = await initializeFirebase();
    if (!isInitialized) return false;

    // تحقق من إعدادات مكتبة Messaging
    const messaging = await getFirebaseMessaging();
    if (!messaging) return false;

    console.log('تم إعداد Firebase بنجاح');
    return true;
  } catch (error) {
    console.error('خطأ في إعداد Firebase:', error);
    return false;
  }
};

// إضافة أنواع للإشارة إلى window
declare global {
  interface Window {
    firebase: any;
  }
}
