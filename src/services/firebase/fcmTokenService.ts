
import { supabase } from '@/integrations/supabase/client';
import { getFCMToken, deleteFCMToken } from './firebaseClient';
import { toast } from 'sonner';

type FcmToken = {
  id: string;
  user_id: string;
  token: string;
  created_at: string;
};

// تسجيل توكن FCM في قاعدة بيانات Supabase
export const registerFCMToken = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) {
      console.error('لم يتم توفير معرف المستخدم');
      return false;
    }

    console.log('جاري الحصول على توكن FCM للمستخدم:', userId);
    const token = await getFCMToken();
    
    if (!token) {
      console.error('فشل الحصول على توكن FCM');
      return false;
    }

    // التحقق من وجود التوكن في قاعدة البيانات
    // استخدام rpc لتجنب مشاكل TypeScript مع الجداول الديناميكية
    const { data: existingTokens, error: checkError } = await supabase.rpc(
      'check_fcm_token_exists',
      { 
        p_token: token,
        p_user_id: userId
      }
    );

    if (checkError) {
      console.error('خطأ في التحقق من وجود التوكن:', checkError);
      return false;
    }

    // إذا كان التوكن موجودًا بالفعل، نخرج
    if (existingTokens && existingTokens > 0) {
      console.log('التوكن مسجل بالفعل');
      return true;
    }

    // إضافة التوكن الجديد
    // استخدام rpc لتجنب مشاكل TypeScript مع الجداول الديناميكية
    const { error: insertError } = await supabase.rpc(
      'insert_fcm_token',
      {
        p_user_id: userId,
        p_token: token
      }
    );

    if (insertError) {
      console.error('خطأ في تسجيل توكن FCM:', insertError);
      return false;
    }

    console.log('تم تسجيل توكن FCM بنجاح');
    return true;
  } catch (error) {
    console.error('خطأ في تسجيل توكن FCM:', error);
    return false;
  }
};

// إلغاء تسجيل توكن FCM
export const unregisterFCMToken = async (userId: string): Promise<boolean> => {
  try {
    const token = await getFCMToken();
    
    if (!token) {
      // إذا لم نستطع الحصول على التوكن الحالي، نحاول حذف جميع توكنات المستخدم
      const { error: deleteError } = await supabase.rpc(
        'delete_all_user_fcm_tokens',
        { p_user_id: userId }
      );

      if (deleteError) {
        console.error('خطأ في حذف كل توكنات المستخدم:', deleteError);
        return false;
      }
    } else {
      // حذف توكن معين
      const { error: deleteError } = await supabase.rpc(
        'delete_fcm_token',
        { 
          p_token: token,
          p_user_id: userId
        }
      );

      if (deleteError) {
        console.error('خطأ في حذف توكن معين:', deleteError);
        return false;
      }

      // حذف التوكن من Firebase
      await deleteFCMToken();
    }

    console.log('تم إلغاء تسجيل توكن FCM بنجاح');
    return true;
  } catch (error) {
    console.error('خطأ في إلغاء تسجيل توكن FCM:', error);
    return false;
  }
};
