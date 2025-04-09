
import { supabase } from '@/integrations/supabase/client';
import { getOrCreateFirebaseToken } from '@/utils/pushNotificationUtils';
import { FirebaseConfig } from '@/types/database';
import { toast } from 'sonner';

let firebaseApp: any;
let firebaseMessaging: any;
let initializationAttempted = false;
let swRegistrationAttempted = false;

/**
 * تهيئة Firebase
 */
export async function initializeFirebase() {
  // منع محاولات التهيئة المتكررة
  if (initializationAttempted) {
    console.log("تم محاولة تهيئة Firebase من قبل، استخدام النسخة المخزنة مؤقتًا");
    return !!firebaseApp;
  }
  
  initializationAttempted = true;
  
  try {
    // استيراد ديناميكي لحزم Firebase
    const { initializeApp } = await import('firebase/app');
    const { getMessaging } = await import('firebase/messaging');
    
    // استعلام عن تكوين Firebase من قاعدة البيانات
    const { data, error } = await supabase
      .from('firebase_config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single() as { data: FirebaseConfig | null, error: any };
    
    if (error) {
      console.error("فشل في الحصول على تكوين Firebase:", error);
      return false;
    }
    
    if (!data) {
      console.error("لم يتم العثور على تكوين Firebase");
      return false;
    }
    
    // تكوين Firebase
    const firebaseConfig = {
      apiKey: data.api_key,
      authDomain: data.auth_domain,
      projectId: data.project_id,
      storageBucket: data.storage_bucket,
      messagingSenderId: data.messaging_sender_id,
      appId: data.app_id,
      measurementId: data.measurement_id
    };
    
    // تهيئة التطبيق
    firebaseApp = initializeApp(firebaseConfig);
    
    // الحصول على كائن الرسائل
    firebaseMessaging = getMessaging(firebaseApp);
    
    // إرسال تكوين Firebase إلى خدمة العامل
    await sendConfigToServiceWorker(firebaseConfig);
    
    console.log("تم تهيئة Firebase بنجاح");
    return true;
  } catch (error) {
    console.error("فشل في تهيئة Firebase:", error);
    return false;
  }
}

/**
 * إرسال تكوين Firebase إلى خدمة العامل
 */
async function sendConfigToServiceWorker(config: any) {
  try {
    // التحقق من وجود تسجيل سابق أو محاولة تسجيل جديدة
    const registrations = await navigator.serviceWorker.getRegistrations();
    let fmRegistration = registrations.find(reg => 
      reg.scope.includes('firebase-cloud-messaging-push-scope') || 
      reg.active?.scriptURL.includes('firebase-messaging-sw.js')
    );
    
    // إذا لم يتم العثور على تسجيل، حاول تسجيل خدمة العامل
    if (!fmRegistration && !swRegistrationAttempted) {
      swRegistrationAttempted = true;
      try {
        console.log("تسجيل Firebase Service Worker...");
        fmRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log("تم تسجيل Firebase Service Worker بنجاح");
      } catch (regError) {
        console.warn("لا يمكن تسجيل Firebase Service Worker:", regError);
      }
    }
    
    // إذا كان هناك تسجيل نشط، أرسل التكوين
    if (fmRegistration?.active) {
      console.log("إرسال تكوين Firebase إلى خدمة العامل النشطة");
      fmRegistration.active.postMessage({
        type: 'FIREBASE_CONFIG',
        config: config
      });
    } else if (navigator.serviceWorker.controller) {
      // محاولة إرسال التكوين إلى أي خدمة عامل متحكمة
      console.log("إرسال تكوين Firebase إلى خدمة العامل المتحكمة");
      navigator.serviceWorker.controller.postMessage({
        type: 'FIREBASE_CONFIG',
        config: config
      });
    } else {
      console.warn("لا يمكن إرسال التكوين: خدمة العامل غير مسجلة أو غير نشطة");
      
      // الاستماع لأحداث تغيير حالة خدمة العامل
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (navigator.serviceWorker.controller) {
          console.log("تم اكتشاف خدمة عامل متحكمة جديدة، إرسال التكوين");
          navigator.serviceWorker.controller.postMessage({
            type: 'FIREBASE_CONFIG',
            config: config
          });
        }
      });
    }
  } catch (error) {
    console.error("خطأ في إرسال التكوين إلى خدمة العامل:", error);
  }
}

/**
 * تسجيل الجهاز للإشعارات
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!firebaseMessaging) {
    console.log("Firebase Messaging غير مهيأ، محاولة التهيئة...");
    const initialized = await initializeFirebase();
    if (!initialized) {
      console.error("فشل في تهيئة Firebase");
      return null;
    }
  }
  
  try {
    // استخدام استدعاء منفصل لوظيفة getToken
    const { getToken } = await import('firebase/messaging');
    
    // التحقق من وجود إذن الإشعارات
    if (Notification.permission !== 'granted') {
      console.log("إذن الإشعارات غير ممنوح، طلب الإذن...");
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log("تم رفض إذن الإشعارات");
        toast.error('تم رفض إذن الإشعارات. يرجى تمكين الإشعارات من إعدادات المتصفح.');
        return null;
      }
    }
    
    // التحقق من تسجيل Service Worker
    const registrations = await navigator.serviceWorker.getRegistrations();
    let swRegistration = registrations.find(reg => 
      reg.active?.scriptURL.includes('firebase-messaging-sw.js')
    );
    
    if (!swRegistration) {
      console.log("Service Worker للإشعارات غير مسجل، محاولة التسجيل يدويًا...");
      try {
        swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log("تم تسجيل Service Worker بنجاح");
      } catch (err) {
        console.error("فشل في تسجيل Service Worker:", err);
      }
    }
    
    // استخدام getOrCreateFirebaseToken للحصول على التوكن
    console.log("محاولة استخراج توكن FCM...");
    return await getOrCreateFirebaseToken(firebaseMessaging, getToken);
  } catch (error) {
    console.error("فشل في تسجيل الإشعارات:", error);
    return null;
  }
}

// استيراد الوظائف الأخرى

/**
 * إرسال إشعار إلى مستخدم
 */
export async function sendNotification(tokens: string[], notification: {
  title: string;
  body: string;
  url?: string;
  type?: 'general' | 'ticket' | 'payment' | 'subscription';
}) {
  try {
    console.log(`محاولة إرسال إشعار إلى الأجهزة:`, tokens);
    
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        tokens,
        notification
      }
    });

    if (error) {
      console.error('خطأ في استدعاء وظيفة Edge Function:', error);
      throw error;
    }
    
    console.log('نتيجة إرسال الإشعار:', data);
    return data;
  } catch (error) {
    console.error('خطأ في إرسال الإشعار:', error);
    throw error;
  }
}

/**
 * إرسال إشعار للمشرفين
 */
export async function sendNotificationToAdmin(notification: {
  title: string;
  body: string;
  url?: string;
  type?: 'general' | 'ticket' | 'payment' | 'subscription';
}, adminTokens: string[]) {
  try {
    console.log('محاولة إرسال إشعار للمشرفين:', notification);
    
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        tokens: adminTokens,
        notification
      }
    });

    if (error) {
      console.error('خطأ في استدعاء وظيفة Edge Function للمشرفين:', error);
      throw error;
    }
    
    console.log('نتيجة إرسال الإشعار للمشرفين:', data);
    return data;
  } catch (error) {
    console.error('خطأ في إرسال الإشعار للمشرفين:', error);
    throw error;
  }
}
