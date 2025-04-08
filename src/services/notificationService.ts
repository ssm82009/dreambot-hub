
import { supabase } from '@/integrations/supabase/client';

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  type?: 'general' | 'ticket' | 'payment' | 'subscription';
}

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
