
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OneSignalService } from '@/services/oneSignalService';

export function useNotificationData() {
  const [subscribersCount, setSubscribersCount] = useState<number>(0);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // جلب عدد المشتركين من OneSignal بدلاً من قاعدة البيانات المحلية
        try {
          const oneSignalCount = await fetchOneSignalSubscriberCount();
          if (isMounted) {
            setSubscribersCount(oneSignalCount || 0);
          }
        } catch (oneSignalError) {
          console.error('Error fetching OneSignal subscribers:', oneSignalError);
          // جلب عدد المشتركين من قاعدة البيانات كبديل احتياطي
          const { count: localCount, error: subscribersError } = await supabase
            .from('push_subscriptions')
            .select('*', { count: 'exact', head: true });

          if (subscribersError) throw subscribersError;
          if (isMounted) {
            setSubscribersCount(localCount || 0);
          }
        }

        // جلب قائمة المستخدمين لإرسال الإشعارات لهم
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email, full_name, role');

        if (usersError) {
          throw usersError;
        }

        if (isMounted) {
          setUsers(usersData || []);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error fetching notification data:', err);
        if (isMounted) {
          setError(err.message || 'حدث خطأ في جلب بيانات الإشعارات');
          setLoading(false);
        }
      }
    };

    const fetchOneSignalSubscriberCount = async (): Promise<number> => {
      // استخدام API الخاص بـ OneSignal للحصول على العدد الدقيق للمشتركين
      if (!OneSignalService.isReady) {
        console.warn('OneSignal غير متاح، لا يمكن جلب عدد المشتركين الحقيقي');
        throw new Error('OneSignal غير متاح');
      }
      
      try {
        // استدعاء دالة على الخادم للحصول على عدد المشتركين من OneSignal
        const { data, error } = await supabase.functions.invoke('get-onesignal-stats', {
          body: { action: 'getSubscriberCount' }
        });
        
        if (error) throw error;
        
        return data?.count || 0;
      } catch (error) {
        console.error('خطأ في جلب عدد مشتركي OneSignal:', error);
        throw error;
      }
    };

    fetchData();

    // تنظيف عند إلغاء تحميل المكون
    return () => {
      isMounted = false;
    };
  }, [retryCount]);

  // دالة لتحديث البيانات يدويًا
  const refreshData = async () => {
    setRetryCount(prev => prev + 1);
  };

  return { subscribersCount, users, loading, error, refreshData };
}
