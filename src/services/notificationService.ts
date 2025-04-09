
import { supabase } from '@/integrations/supabase/client';
import { 
  sendNotification as sendFirebaseNotification, 
  sendNotificationToAdmin as sendFirebaseNotificationToAdmin
} from './firebaseService';

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  type?: 'general' | 'ticket' | 'payment' | 'subscription';
}

// استدعاء وظيفة Edge Function لإرسال الإشعار
export async function sendNotification(userId: string, payload: NotificationPayload) {
  try {
    return await sendFirebaseNotification(userId, payload);
  } catch (error) {
    console.error('خطأ في إرسال الإشعار:', error);
    throw error;
  }
}

// إرسال إشعار لجميع المشرفين
export async function sendNotificationToAdmin(payload: NotificationPayload) {
  try {
    return await sendFirebaseNotificationToAdmin(payload);
  } catch (error) {
    console.error('خطأ في إرسال الإشعار للمشرفين:', error);
    throw error;
  }
}
