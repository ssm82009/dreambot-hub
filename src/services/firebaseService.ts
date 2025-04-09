
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
    // Use explicit type casting to avoid TypeScript errors
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
  
  return await getOrCreateFirebaseToken(firebaseMessaging, saveTokenToDatabase);
}

/**
 * حفظ رمز FCM في قاعدة البيانات
 */
async function saveTokenToDatabase(token: string): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.log("المستخدم غير مسجل دخول، لن يتم حفظ الرمز");
      return;
    }
    
    console.log("حفظ رمز FCM في قاعدة البيانات...");
    
    const { error } = await supabase.functions.invoke('store-fcm-token', {
      body: {
        userId: session.user.id,
        token: token
      }
    });
    
    if (error) {
      throw error;
    }
    
    console.log("تم حفظ رمز FCM بنجاح");
  } catch (error) {
    console.error("فشل في حفظ رمز FCM:", error);
    throw error;
  }
}

/**
 * حذف رمز FCM من قاعدة البيانات
 */
export async function deleteFcmToken(token: string): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.log("المستخدم غير مسجل دخول، لن يتم حذف الرمز");
      return;
    }
    
    console.log("حذف رمز FCM من قاعدة البيانات...");
    
    const { error } = await supabase.functions.invoke('remove-fcm-token', {
      body: {
        userId: session.user.id,
        token: token
      }
    });
    
    if (error) {
      throw error;
    }
    
    console.log("تم حذف رمز FCM بنجاح");
  } catch (error) {
    console.error("فشل في حذف رمز FCM:", error);
    throw error;
  }
}

/**
 * إرسال إشعار إلى مستخدم
 */
export async function sendNotification(userId: string, notification: {
  title: string;
  body: string;
  url?: string;
  type?: 'general' | 'ticket' | 'payment' | 'subscription';
}) {
  try {
    console.log(`محاولة إرسال إشعار للمستخدم ${userId}:`, notification);
    
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        userId,
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
}) {
  try {
    console.log('محاولة إرسال إشعار للمشرفين:', notification);
    
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        adminOnly: true,
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
