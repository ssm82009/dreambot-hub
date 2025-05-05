
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import OneSignalServiceInstance from '@/services/oneSignalService';

export function useNotificationData() {
  const [subscribersCount, setSubscribersCount] = useState<number>(0);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // جلب عدد المشتركين من OneSignal API مباشرة عبر Edge Function
        try {
          console.log('جاري جلب عدد المشتركين من OneSignal...');
          
          // محاولة ثلاث مرات مع فترة انتظار بسيطة بين كل محاولة
          let statsData: any = null;
          let statsError: any = null;
          let attempts = 0;
          const maxAttempts = 3;
          
          while (!statsData && attempts < maxAttempts) {
            attempts++;
            try {
              console.log(`محاولة ${attempts} من ${maxAttempts} لجلب إحصائيات OneSignal`);
              
              const response = await supabase.functions.invoke('get-onesignal-stats', {
                body: { action: 'getSubscriberCount' }
              });
              
              statsData = response.data;
              statsError = response.error;
              
              if (statsError) {
                console.error(`خطأ في المحاولة ${attempts}:`, statsError);
                // انتظر قبل المحاولة التالية
                if (attempts < maxAttempts) {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }
            } catch (attemptError) {
              console.error(`خطأ في المحاولة ${attempts}:`, attemptError);
              // انتظر قبل المحاولة التالية
              if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }
          
          // إذا استمر الخطأ بعد كل المحاولات
          if (statsError) {
            console.error('خطأ مستمر في استدعاء دالة جلب إحصائيات OneSignal:', statsError);
            if (isMounted) {
              setError('تعذر الاتصال بخدمة الإشعارات، يرجى المحاولة لاحقًا');
            }
          }
          
          if (isMounted) {
            // استخدم القيمة المُرجعة حتى لو كانت صفرًا بسبب خطأ
            const count = typeof statsData?.count === 'number' ? statsData.count : 0;
            console.log('تم جلب عدد المشتركين:', count, statsData);
            setSubscribersCount(count);
            
            // حفظ معلومات التصحيح إن وجدت
            if (statsData?.debug) {
              setDebugInfo(statsData.debug);
            }
            
            // إذا كان هناك خطأ أو تحذير، يمكننا عرضه للمستخدم كملاحظة
            if (statsData?.error) {
              setError(statsData.error);
            } else if (statsData?.warning) {
              setError(statsData.warning);
            }
          }
        } catch (oneSignalError) {
          console.error('خطأ في جلب عدد المشتركين من OneSignal:', oneSignalError);
          if (isMounted) {
            setError('تعذر الاتصال بخدمة الإشعارات، يرجى المحاولة لاحقًا');
          }
        }

        // جلب قائمة المستخدمين لإرسال الإشعارات لهم
        try {
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, email, full_name, role');

          if (usersError) {
            throw usersError;
          }

          if (isMounted) {
            setUsers(usersData || []);
          }
        } catch (usersError) {
          console.error('خطأ في جلب بيانات المستخدمين:', usersError);
          if (isMounted) {
            toast.error('تعذر جلب بيانات المستخدمين');
          }
        }
        
        if (isMounted) {
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

  return { subscribersCount, users, loading, error, refreshData, debugInfo };
}
