
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

        // جلب عدد المشتركين من OneSignal API مباشرة عبر Edge Function
        try {
          console.log('جاري جلب عدد المشتركين من OneSignal...');
          const { data: statsData, error: statsError } = await supabase.functions.invoke('get-onesignal-stats', {
            body: { action: 'getSubscriberCount' }
          });
          
          if (statsError) {
            console.error('خطأ في جلب إحصائيات OneSignal:', statsError);
            throw new Error(statsError.message || 'حدث خطأ في جلب إحصائيات OneSignal');
          }
          
          if (isMounted) {
            console.log('تم جلب عدد المشتركين بنجاح:', statsData?.count);
            setSubscribersCount(statsData?.count || 0);
          }
        } catch (oneSignalError) {
          console.error('خطأ في جلب عدد المشتركين من OneSignal:', oneSignalError);
          // الاحتفاظ بالخطأ لعرضه للمستخدم
          throw oneSignalError;
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
        console.error('خطأ في جلب بيانات الإشعارات:', err);
        if (isMounted) {
          setError(err.message || 'حدث خطأ في جلب بيانات الإشعارات');
          setLoading(false);
        }
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
