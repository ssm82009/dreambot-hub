import { supabase } from '@/integrations/supabase/client';
import { getOrCreateFirebaseToken } from '@/utils/pushNotificationUtils';
import { FirebaseConfig } from '@/types/database';

let firebaseApp: any;
let firebaseMessaging: any;

/**
 * تهيئة Firebase
 */
export async function initializeFirebase() {
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
    
    console.log("تم تهيئة Firebase بنجاح");
    return true;
  } catch (error) {
    console.error("فشل في تهيئة Firebase:", error);
    return false;
  }
}

/**
 * تسجيل الجهاز للإشعارات
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!firebaseMessaging) {
    console.error("Firebase Messaging غير مهيأ");
    return null;
  }
  
  try {
    // استخدام استدعاء منفصل لوظيفة getToken بدلاً من استدعائها على كائن الرسائل مباشرة
    const { getToken } = await import('firebase/messaging');
    return await getOrCreateFirebaseToken(firebaseMessaging, getToken);
  } catch (error) {
    console.error("فشل في تسجيل الإشعارات:", error);
    return null;
  }
}

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
