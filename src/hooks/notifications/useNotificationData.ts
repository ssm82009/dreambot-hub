
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useNotificationData() {
  const [subscribersCount, setSubscribersCount] = useState<number>(0);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let realtimeChannel: any = null;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // جلب عدد المشتركين في الإشعارات
        const { count: subscribersCount, error: subscribersError } = await supabase
          .from('push_subscriptions')
          .select('*', { count: 'exact', head: true });

        if (subscribersError) {
          throw subscribersError;
        }

        // جلب قائمة المستخدمين لإرسال الإشعارات لهم
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email, full_name, role');

        if (usersError) {
          throw usersError;
        }

        if (isMounted) {
          setSubscribersCount(subscribersCount || 0);
          setUsers(usersData || []);
          setLoading(false);
        }

        // إعداد قناة الاستماع للتغييرات في الوقت الحقيقي
        setupRealtimeSubscription();

      } catch (err: any) {
        console.error('Error fetching notification data:', err);
        if (isMounted) {
          setError(err.message || 'حدث خطأ في جلب بيانات الإشعارات');
          setLoading(false);
        }
      }
    };

    const setupRealtimeSubscription = () => {
      try {
        // تنظيف أي اشتراك سابق
        if (realtimeChannel) {
          supabase.removeChannel(realtimeChannel);
        }

        // إنشاء اشتراك جديد لمراقبة التغييرات في جدول الاشتراكات
        realtimeChannel = supabase
          .channel('push-subscriptions-changes')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'push_subscriptions' 
            }, 
            () => {
              // تحديث العدد عند حدوث أي تغيير
              refreshSubscribersCount();
            }
          )
          .subscribe((status: string) => {
            // التحقق من حالة الاشتراك
            if (status === 'SUBSCRIBED') {
              console.log('تم الاشتراك بنجاح في قناة التغييرات');
            } else if (status === 'CHANNEL_ERROR') {
              console.error('حدث خطأ في الاتصال بقناة التغييرات');
              handleReconnect();
            }
          });
      } catch (channelError) {
        console.error('Error setting up realtime subscription:', channelError);
        handleReconnect();
      }
    };

    const refreshSubscribersCount = async () => {
      try {
        const { count, error: countError } = await supabase
          .from('push_subscriptions')
          .select('*', { count: 'exact', head: true });
        
        if (countError) throw countError;
        
        if (isMounted) {
          setSubscribersCount(count || 0);
        }
      } catch (err) {
        console.error('Error refreshing subscribers count:', err);
      }
    };

    const handleReconnect = () => {
      // إعادة محاولة الاتصال مع زيادة الفاصل الزمني بعد كل محاولة
      if (retryCount < 5) {
        const timeout = Math.min(1000 * Math.pow(2, retryCount), 30000);
        console.log(`محاولة إعادة الاتصال بعد ${timeout}ms...`);
        
        setTimeout(() => {
          if (isMounted) {
            setRetryCount(prev => prev + 1);
            setupRealtimeSubscription();
          }
        }, timeout);
      } else {
        // بعد 5 محاولات فاشلة، نعرض رسالة خطأ ولكن نستمر في تحديث البيانات عند الضرورة
        setError('تعذر إنشاء اتصال مباشر. سيتم تحديث البيانات يدويًا.');
        toast.error('تعذر إنشاء اتصال مباشر. سيتم تحديث البيانات يدويًا.');
      }
    };

    fetchData();

    // تنظيف عند إلغاء تحميل المكون
    return () => {
      isMounted = false;
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [retryCount]);

  return { subscribersCount, users, loading, error };
}
