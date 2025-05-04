
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
  
  // تهيئة OneSignal والتحقق من حالته
  useEffect(() => {
    const initOneSignal = async () => {
      try {
        // التأكد من أن OneSignal متاح في نافذة المتصفح
        if (typeof window === 'undefined' || !window.OneSignal) {
          console.warn('OneSignal غير متاح في نافذة المتصفح');
          return;
        }

        // تهيئة OneSignal وانتظار أن يصبح جاهزاً
        const waitForOneSignalReady = () => {
          return new Promise<void>((resolve) => {
            if (window.OneSignal && window.OneSignal.User) {
              resolve();
              return;
            }

            // إذا كان هناك مصفوفة OneSignalDeferred، أضف دالة الانتظار إليها
            if (!window.OneSignalDeferred) {
              window.OneSignalDeferred = [];
            }
            
            window.OneSignalDeferred.push(() => {
              resolve();
            });
            
            // لضمان عدم انتظار إلى ما لا نهاية
            setTimeout(() => {
              console.warn('تجاوز مهلة انتظار OneSignal');
              resolve();
            }, 5000);
          });
        };

        // انتظار OneSignal حتى يصبح جاهزاً
        await waitForOneSignalReady();
        
        if (!window.OneSignal || !window.OneSignal.User) {
          console.warn('OneSignal لا يزال غير جاهز بعد الانتظار');
          return;
        }
        
        console.log('OneSignal جاهز للاستخدام');
        
        // تهيئة OneSignal بمعرف المستخدم إذا كان متاحاً
        if (userId) {
          try {
            await window.OneSignal.login(userId);
            console.log('تم تسجيل دخول المستخدم في OneSignal:', userId);
          } catch (loginError) {
            console.error('خطأ في تسجيل دخول المستخدم في OneSignal:', loginError);
          }
        }
        
        // التحقق من حالة الإشعارات
        const isPermissionGranted = await window.OneSignal.Notifications.permission;
        setGranted(isPermissionGranted || false);
        
        // التحقق مما إذا كانت الإشعارات مفعّلة
        // تصحيح الخطأ: استخدام خاصية permission بدلاً من دالة getPermission
        const isEnabled = await window.OneSignal.Notifications.permission;
        setSubscription(isEnabled || false);
        
        console.log('حالة الإشعارات:', { 
          granted: isPermissionGranted, 
          subscription: isEnabled 
        });
      } catch (error) {
        console.error('خطأ في تهيئة OneSignal:', error);
      }
    };
    
    initOneSignal();
  }, [userId]);

  // طلب إذن الإشعارات
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!supported || !window.OneSignal || !window.OneSignal.Notifications) {
      toast.error('متصفحك لا يدعم الإشعارات');
      return false;
    }
    
    try {
      console.log('جاري طلب إذن الإشعارات...');
      
      const isPushSupported = await window.OneSignal.Notifications.isPushSupported();
      if (!isPushSupported) {
        toast.error('متصفحك لا يدعم إشعارات الدفع');
        return false;
      }
      
      const result = await window.OneSignal.Notifications.requestPermission();
      setGranted(result);
      
      console.log('نتيجة طلب إذن الإشعارات:', result);
      
      if (result) {
        toast.success('تم منح إذن الإشعارات');
      } else {
        toast.error('تم رفض إذن الإشعارات');
      }
      
      return result;
    } catch (error) {
      console.error('خطأ في طلب الإذن:', error);
      toast.error('حدث خطأ أثناء طلب إذن الإشعارات');
      return false;
    }
  }, [supported]);
  
  // الاشتراك في الإشعارات
  const subscribeToNotifications = useCallback(async (): Promise<boolean> => {
    if (!supported || !window.OneSignal || !window.OneSignal.Notifications) {
      toast.error('متصفحك لا يدعم الإشعارات');
      return false;
    }
    
    try {
      setSubscribing(true);
      
      // طلب الإذن إذا لم يكن لدينا إذن بالفعل
      if (!granted) {
        const permissionResult = await requestPermission();
        if (!permissionResult) {
          setSubscribing(false);
          return false;
        }
      }
      
      console.log('جاري تفعيل الإشعارات...');
      
      // تفعيل الإشعارات
      const result = await window.OneSignal.Notifications.setEnabled(true);
      setSubscription(result);
      
      console.log('نتيجة تفعيل الإشعارات:', result);
      
      if (result) {
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
  }, [supported, granted, requestPermission]);
  
  // إلغاء الاشتراك في الإشعارات
  const unsubscribeFromNotifications = useCallback(async (): Promise<boolean> => {
    if (!supported || !window.OneSignal || !window.OneSignal.Notifications) {
      toast.error('متصفحك لا يدعم الإشعارات');
      return false;
    }
    
    try {
      setSubscribing(true);
      
      console.log('جاري إلغاء تفعيل الإشعارات...');
      
      // إلغاء تفعيل الإشعارات
      const result = await window.OneSignal.Notifications.setEnabled(false);
      setSubscription(false);
      
      console.log('نتيجة إلغاء تفعيل الإشعارات:', result);
      
      toast.success('تم إلغاء الاشتراك من الإشعارات بنجاح');
      
      return true;
    } catch (error) {
      console.error('خطأ في إلغاء الاشتراك من الإشعارات:', error);
      toast.error('حدث خطأ أثناء إلغاء الاشتراك من الإشعارات');
      return false;
    } finally {
      setSubscribing(false);
    }
  }, [supported]);
  
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
