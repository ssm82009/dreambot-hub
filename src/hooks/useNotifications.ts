
import { useState, useEffect, useCallback } from 'react';
import { useNotificationPermission } from './notifications/useNotificationPermission';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { OneSignalService } from '@/services/oneSignalService';

/**
 * هوك إدارة الإشعارات الرئيسي باستخدام OneSignal
 */
export function useNotifications() {
  const { supported } = useNotificationPermission();
  const [granted, setGranted] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<boolean>(false);
  const [subscribing, setSubscribing] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // التحقق من حالة تسجيل الدخول
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
      }
    };
    
    checkAuth();
    
    // الاستماع لتغييرات حالة المصادقة
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUserId(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // تهيئة OneSignal
  useEffect(() => {
    const initOneSignal = async () => {
      try {
        if (typeof window !== 'undefined' && window.OneSignal) {
          // انتظار تحميل OneSignal
          const checkOneSignalReady = async (): Promise<void> => {
            if (OneSignalService.isReady) {
              console.log('OneSignal جاهز للاستخدام');
              
              // تهيئة OneSignal بمعرف المستخدم إذا كان متاحاً
              if (userId) {
                await OneSignalService.initialize(userId);
              }
              
              // التحقق من حالة الإشعارات
              const isSubscribed = await OneSignalService.getSubscriptionStatus();
              setSubscription(isSubscribed);
              setGranted(isSubscribed);
            } else {
              // إعادة المحاولة بعد مهلة زمنية
              setTimeout(checkOneSignalReady, 500);
            }
          };
          
          checkOneSignalReady();
        }
      } catch (error) {
        console.error('خطأ في تهيئة OneSignal:', error);
      }
    };
    
    initOneSignal();
  }, [userId]);

  // طلب إذن الإشعارات
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const result = await OneSignalService.requestNotificationPermission();
      setGranted(result);
      return result;
    } catch (error) {
      console.error('خطأ في طلب الإذن:', error);
      return false;
    }
  }, []);
  
  // الاشتراك في الإشعارات
  const subscribeToNotifications = useCallback(async (): Promise<boolean> => {
    try {
      setSubscribing(true);
      
      const result = await OneSignalService.subscribeToNotifications();
      
      if (result) {
        setSubscription(true);
        setGranted(true);
        toast.success('تم الاشتراك في الإشعارات بنجاح');
      } else {
        toast.error('فشل الاشتراك في الإشعارات');
      }
      
      return result;
    } catch (error) {
      console.error('خطأ في الاشتراك في الإشعارات:', error);
      toast.error('حدث خطأ أثناء الاشتراك في الإشعارات');
      return false;
    } finally {
      setSubscribing(false);
    }
  }, []);
  
  // إلغاء الاشتراك في الإشعارات
  const unsubscribeFromNotifications = useCallback(async (): Promise<boolean> => {
    try {
      setSubscribing(true);
      
      const result = await OneSignalService.unsubscribeFromNotifications();
      
      if (result) {
        setSubscription(false);
        toast.success('تم إلغاء الاشتراك من الإشعارات بنجاح');
      } else {
        toast.error('فشل إلغاء الاشتراك من الإشعارات');
      }
      
      return result;
    } catch (error) {
      console.error('خطأ في إلغاء الاشتراك من الإشعارات:', error);
      toast.error('حدث خطأ أثناء إلغاء الاشتراك من الإشعارات');
      return false;
    } finally {
      setSubscribing(false);
    }
  }, []);
  
  return {
    supported,
    granted,
    subscription,
    subscribing,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications
  };
}
