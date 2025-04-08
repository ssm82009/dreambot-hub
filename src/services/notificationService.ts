
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
    console.log(`محاولة إرسال إشعار للمستخدم ${userId}:`, payload);
    
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        userId,
        notification: payload
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

// إرسال إشعار لجميع المشرفين
export async function sendNotificationToAdmin(payload: NotificationPayload) {
  try {
    console.log('محاولة إرسال إشعار للمشرفين:', payload);
    
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        adminOnly: true,
        notification: payload
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

// تخزين اشتراك الإشعارات الجديد
export async function storeSubscription(subscription: PushSubscription) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('المستخدم غير مسجل دخول');

    console.log('محاولة تخزين اشتراك جديد للإشعارات:', subscription.endpoint);
    
    // تعديل طريقة تخزين الاشتراك لضمان تخزين البيانات بصيغة صحيحة
    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: (subscription as any).keys,
      expirationTime: (subscription as any).expirationTime
    };
    
    const { data, error } = await supabase.functions.invoke('store-subscription', {
      body: {
        userId: session.user.id,
        endpoint: subscription.endpoint,
        auth: JSON.stringify(subscriptionData)
      }
    });

    if (error) {
      console.error('خطأ في استدعاء وظيفة Edge Function لتخزين الاشتراك:', error);
      throw error;
    }
    
    console.log('نتيجة تخزين اشتراك الإشعارات:', data);
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

    console.log('محاولة حذف اشتراك الإشعارات:', endpoint);
    const { data, error } = await supabase.functions.invoke('remove-subscription', {
      body: {
        userId: session.user.id,
        endpoint
      }
    });

    if (error) {
      console.error('خطأ في استدعاء وظيفة Edge Function لحذف الاشتراك:', error);
      throw error;
    }
    
    console.log('نتيجة حذف اشتراك الإشعارات:', data);
    return data;
  } catch (error) {
    console.error('خطأ في حذف اشتراك الإشعارات:', error);
    throw error;
  }
}
