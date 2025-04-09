
import { supabase } from '@/integrations/supabase/client';
import { 
  sendNotification as sendFirebaseNotification
} from './firebaseService';
import { toast } from 'sonner';

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  type?: 'general' | 'ticket' | 'payment' | 'subscription';
}

// جمع رموز FCM المخزنة محليًا للمستخدم الحالي
function getUserTokens(): string[] {
  const token = localStorage.getItem('fcm_token');
  return token ? [token] : [];
}

// استدعاء وظيفة Edge Function لإرسال الإشعار
export async function sendNotification(userId: string, payload: NotificationPayload) {
  try {
    // تخزين رموز FCM للمستخدم
    const tokens = getUserTokens();
    
    if (tokens.length === 0) {
      toast.error('لا توجد أجهزة مسجلة لاستلام الإشعارات');
      return { success: false, message: 'لا توجد أجهزة مسجلة' };
    }
    
    const result = await sendFirebaseNotification(tokens, payload);
    
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
    
    // في بيئة حقيقية، يجب جمع رموز المشرفين
    // لأغراض الاختبار، سنستخدم الرموز المحلية
    const tokens = getUserTokens();
    
    // في بيئة حقيقية، يمكن تخزين رموز المشرفين في تخزين محلي أو في الذاكرة
    const result = await sendFirebaseNotification(tokens, payload);
    
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
    
    // في بيئة الاختبار، نستخدم الرموز المحلية
    const tokens = getUserTokens();
    
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        tokens,
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
