
import { supabase } from '@/integrations/supabase/client';
import { getFCMToken, deleteFCMToken } from './firebaseClient';
import { toast } from 'sonner';

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
    const { data: existingTokens, error: checkError } = await supabase
      .from('fcm_tokens')
      .select('*')
      .eq('token', token)
      .eq('user_id', userId);

    if (checkError) {
      throw checkError;
    }

    // إذا كان التوكن موجودًا بالفعل، نخرج
    if (existingTokens && existingTokens.length > 0) {
      console.log('التوكن مسجل بالفعل');
      return true;
    }

    // إضافة التوكن الجديد
    const { error: insertError } = await supabase
      .from('fcm_tokens')
      .insert({
        user_id: userId,
        token: token
      });

    if (insertError) {
      throw insertError;
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
      const { error: deleteError } = await supabase
        .from('fcm_tokens')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        throw deleteError;
      }
    } else {
      // حذف توكن معين
      const { error: deleteError } = await supabase
        .from('fcm_tokens')
        .delete()
        .eq('token', token)
        .eq('user_id', userId);

      if (deleteError) {
        throw deleteError;
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
