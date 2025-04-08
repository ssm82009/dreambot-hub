
import { supabase } from '@/integrations/supabase/client';

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  type?: 'general' | 'ticket' | 'payment' | 'subscription';
}

interface PushSubscriptionData {
  endpoint: string;
  auth: string; // JSON string of subscription
}

// استدعاء وظيفة Edge Function لإرسال الإشعار
export async function sendNotification(userId: string, payload: NotificationPayload) {
  try {
    // استدعاء وظيفة Edge Function لإرسال الإشعار
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        userId,
        notification: payload
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('خطأ في إرسال الإشعار:', error);
    throw error;
  }
}

// إرسال إشعار لجميع المشرفين
export async function sendNotificationToAdmin(payload: NotificationPayload) {
  try {
    // استدعاء وظيفة Edge Function لإرسال الإشعار لجميع المشرفين
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        adminOnly: true,
        notification: payload
      }
    });

    if (error) throw error;
    return data;
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

    const { data, error } = await supabase.functions.invoke('store-subscription', {
      body: {
        userId: session.user.id,
        endpoint: subscription.endpoint,
        auth: JSON.stringify(subscription)
      }
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

    const { data, error } = await supabase.functions.invoke('remove-subscription', {
      body: {
        userId: session.user.id,
        endpoint
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('خطأ في حذف اشتراك الإشعارات:', error);
    throw error;
  }
}
