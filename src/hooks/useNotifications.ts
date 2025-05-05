
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import OneSignalServiceInstance from '@/services/oneSignalService';

/**
 * هوك إدارة الإشعارات الرئيسي باستخدام OneSignal
 */
export function useNotifications() {
  const { user } = useAuth();
  const [supported, setSupported] = useState<boolean>(false);
  const [granted, setGranted] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<boolean>(false);
  const [subscribing, setSubscribing] = useState<boolean>(false);
  
  // التحقق من دعم المتصفح للإشعارات وحالة الإذن
  useEffect(() => {
    const checkSupport = async () => {
      try {
        // التحقق من دعم الإشعارات بشكل عام
        const isSupported = 'Notification' in window;
        setSupported(isSupported);
        
        if (isSupported) {
          // التحقق من حالة الإذن
          const permission = Notification.permission;
          setGranted(permission === 'granted');
          
          // التحقق من حالة الاشتراك في OneSignal
          if (OneSignalServiceInstance.isReady) {
            const isSubscribed = await OneSignalServiceInstance.getSubscriptionStatus();
            setSubscription(isSubscribed);
          }
        }
      } catch (error) {
        console.error('خطأ في التحقق من دعم الإشعارات:', error);
      }
    };
    
    checkSupport();
  }, []);
  
  // ربط المستخدم بمعرف خارجي في OneSignal عند تسجيل الدخول
  useEffect(() => {
    if (user && user.id && subscription) {
      OneSignalServiceInstance.setExternalUserId(user.id);
    }
    
    return () => {
      // لا داعي لإزالة المعرف عند إلغاء تحميل المكون
    };
  }, [user, subscription]);
  
  // طلب إذن للإشعارات
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!supported) {
      toast.error('متصفحك لا يدعم الإشعارات');
      return false;
    }
    
    try {
      const result = await OneSignalServiceInstance.requestNotificationPermission();
      setGranted(result);
      return result;
    } catch (error) {
      console.error('خطأ في طلب إذن الإشعارات:', error);
      toast.error('حدث خطأ أثناء طلب إذن الإشعارات');
      return false;
    }
  }, [supported]);
  
  // الاشتراك في الإشعارات
  const subscribeToNotifications = useCallback(async (): Promise<boolean> => {
    try {
      setSubscribing(true);
      
      // طلب الإذن إذا لم يكن لدينا إذن بالفعل
      if (!granted) {
        const permissionGranted = await requestPermission();
        if (!permissionGranted) {
          setSubscribing(false);
          return false;
        }
      }
      
      // تفعيل إشعارات OneSignal
      const result = await OneSignalServiceInstance.subscribeToNotifications();
      setSubscription(result);
      
      if (result) {
        toast.success('تم الاشتراك في الإشعارات بنجاح');
        
        // ربط معرف المستخدم إذا كان مسجل الدخول
        if (user && user.id) {
          await OneSignalServiceInstance.setExternalUserId(user.id);
        }
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
  }, [supported, granted, requestPermission, user]);
  
  // إلغاء الاشتراك في الإشعارات
  const unsubscribeFromNotifications = useCallback(async (): Promise<boolean> => {
    try {
      setSubscribing(true);
      
      // إلغاء ربط معرف المستخدم إذا كان مسجل الدخول
      if (user && user.id) {
        await OneSignalServiceInstance.removeExternalUserId();
      }
      
      // إلغاء الاشتراك من OneSignal
      const result = await OneSignalServiceInstance.unsubscribeFromNotifications();
      setSubscription(false);
      
      toast.success('تم إلغاء الاشتراك من الإشعارات');
      return true;
    } catch (error) {
      console.error('خطأ في إلغاء الاشتراك من الإشعارات:', error);
      toast.error('حدث خطأ أثناء إلغاء الاشتراك من الإشعارات');
      return false;
    } finally {
      setSubscribing(false);
    }
  }, [user]);
  
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
