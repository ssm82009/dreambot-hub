
import { supabase } from '@/integrations/supabase/client';
import { 
  sendNotification as sendFirebaseNotification, 
  sendNotificationToAdmin as sendFirebaseNotificationToAdmin
} from './firebaseService';
import { toast } from 'sonner';

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  type?: 'general' | 'ticket' | 'payment' | 'subscription';
}

// استدعاء وظيفة Edge Function لإرسال الإشعار
export async function sendNotification(userId: string, payload: NotificationPayload) {
  try {
    // تسجيل الإشعار في قاعدة البيانات محلياً قبل إرساله
    try {
      await supabase.from('notification_logs').insert({
        user_id: userId,
        title: payload.title,
        body: payload.body,
        url: payload.url,
        type: payload.type || 'general',
        sent_at: new Date().toISOString()
      });
    } catch (logError) {
      console.error('خطأ في تسجيل الإشعار في قاعدة البيانات:', logError);
      // نستمر في تنفيذ العملية حتى لو فشل التسجيل
    }
    
    const result = await sendFirebaseNotification(userId, payload);
    
    if (result && result.success) {
      toast.success(`تم إرسال الإشعار بنجاح (${result.sentCount || 0} جهاز)`);
    }
    
    return result;
  } catch (error) {
    console.error('خطأ في إرسال الإشعار:', error);
    toast.error('فشل في إرسال الإشعار');
    throw error;
  }
}

// إرسال إشعار لجميع المشرفين
export async function sendNotificationToAdmin(payload: NotificationPayload) {
  try {
    // تسجيل محاولة إرسال الإشعار
    console.log('محاولة إرسال إشعار للمشرفين:', payload);
    
    const result = await sendFirebaseNotificationToAdmin(payload);
    
    if (result && result.success) {
      toast.success(`تم إرسال الإشعار للمشرفين (${result.sentCount || 0} جهاز)`);
    }
    
    return result;
  } catch (error) {
    console.error('خطأ في إرسال الإشعار للمشرفين:', error);
    toast.error('فشل في إرسال الإشعار للمشرفين');
    throw error;
  }
}

// إرسال إشعار لجميع المستخدمين
export async function sendNotificationToAllUsers(payload: NotificationPayload) {
  try {
    console.log('محاولة إرسال إشعار لجميع المستخدمين:', payload);
    
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        allUsers: true,
        notification: payload
      }
    });

    if (error) {
      console.error('خطأ في استدعاء وظيفة Edge Function:', error);
      toast.error('فشل في إرسال الإشعار لجميع المستخدمين');
      throw error;
    }
    
    console.log('نتيجة إرسال الإشعار لجميع المستخدمين:', data);
    
    if (data && data.success) {
      toast.success(`تم إرسال الإشعار لجميع المستخدمين (${data.sentCount || 0} جهاز)`);
    }
    
    return data;
  } catch (error) {
    console.error('خطأ في إرسال الإشعار لجميع المستخدمين:', error);
    toast.error('فشل في إرسال الإشعار لجميع المستخدمين');
    throw error;
  }
}
