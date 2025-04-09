
import { supabase } from '@/integrations/supabase/client';
import { 
  initializeServiceAccountKey, 
  setServiceAccountKey,
  sendNotificationToUser as firebaseSendToUser, 
  sendNotificationToAdmin as firebaseSendToAdmin,
  sendNotificationToAllUsers as firebaseSendToAll,
  type NotificationPayload,
  type ServiceAccountKey
} from './firebaseNotificationService';

// استدعاء وظيفة تهيئة مفتاح Firebase مباشرة
initializeServiceAccountKey().catch(err => console.error('فشل تهيئة مفتاح الحساب الخدمي:', err));

interface PushSubscriptionData {
  endpoint: string;
  auth: string; // JSON string of subscription
}

// تعيين مفتاح الحساب الخدمي يدويًا (مفيد للتطوير أو الاختبار)
export function setFirebaseServiceAccountKey(serviceAccountJson: string) {
  if (!serviceAccountJson) return false;
  return setServiceAccountKey(serviceAccountJson);
}

// إرسال إشعار لمستخدم محدد
export async function sendNotification(userId: string, payload: NotificationPayload) {
  try {
    // استخدام خدمة Firebase مباشرة
    return await firebaseSendToUser(userId, payload);
  } catch (error) {
    console.error('خطأ في إرسال الإشعار:', error);
    throw error;
  }
}

// إرسال إشعار لجميع المشرفين
export async function sendNotificationToAdmin(payload: NotificationPayload) {
  try {
    // استخدام خدمة Firebase مباشرة
    return await firebaseSendToAdmin(payload);
  } catch (error) {
    console.error('خطأ في إرسال الإشعار للمشرفين:', error);
    throw error;
  }
}

// تخزين اشتراك الإشعارات الجديد
export async function storeSubscription(subscription: PushSubscription) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('المستخدم غير مسجل دخول');

    // تخزين الاشتراك مباشرة في قاعدة البيانات
    const { data, error } = await supabase
      .from('push_subscriptions')
      .insert({
        user_id: session.user.id,
        endpoint: subscription.endpoint,
        auth: JSON.stringify(subscription)
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('خطأ في تخزين اشتراك الإشعارات:', error);
    throw error;
  }
}

// حذف اشتراك الإشعارات
export async function removeSubscription(endpoint: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('المستخدم غير مسجل دخول');

    // حذف الاشتراك مباشرة من قاعدة البيانات
    const { data, error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', session.user.id)
      .eq('endpoint', endpoint);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('خطأ في حذف اشتراك الإشعارات:', error);
    throw error;
  }
}

// إرسال إشعار لجميع المستخدمين
export async function sendNotificationToAllUsers(payload: NotificationPayload) {
  try {
    // استخدام خدمة Firebase مباشرة
    return await firebaseSendToAll(payload);
  } catch (error) {
    console.error('خطأ في إرسال الإشعار لجميع المستخدمين:', error);
    throw error;
  }
}
