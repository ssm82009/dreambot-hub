
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email: string;
}

export interface NotificationDataState {
  subscribersCount: number;
  users: User[];
  loading: boolean;
  error: string | null;
}

export const useNotificationData = () => {
  const [state, setState] = useState<NotificationDataState>({
    subscribersCount: 0,
    users: [],
    loading: false,
    error: null
  });

  // جلب عدد المشتركين وقائمة المستخدمين عند تحميل المكون
  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        // استدعاء وظيفة Supabase للحصول على عدد المشتركين
        let subscribersCount = 0;
        
        try {
          // محاولة استدعاء وظيفة العد من قاعدة البيانات مباشرة
          const { data, error } = await supabase
            .from('push_subscriptions')
            .select('id', { count: 'exact', head: true });

          if (error) throw error;
          subscribersCount = data?.length || 0;
        } catch (countError) {
          console.error('خطأ في جلب عدد المشتركين:', countError);
          // نستمر بدون رفع استثناء حتى نتمكن من عرض بقية البيانات
        }

        // جلب قائمة المستخدمين
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email');

        if (userError) {
          throw userError;
        }

        setState(prev => ({
          ...prev,
          subscribersCount,
          users: userData || [],
          loading: false,
          error: null
        }));
      } catch (error: any) {
        console.error('خطأ غير متوقع:', error);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message || 'حدث خطأ غير متوقع' 
        }));
        toast.error('حدث خطأ أثناء جلب البيانات');
      }
    };

    fetchData();
  }, []);

  return state;
};
