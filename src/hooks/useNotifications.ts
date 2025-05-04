
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import oneSignalService from '@/services/oneSignalService';

export const useNotifications = () => {
  const { user } = useAuth();
  const [supported, setSupported] = useState<boolean>(false);
  const [granted, setGranted] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<boolean>(false);
  const [subscribing, setSubscribing] = useState<boolean>(false);

  // تحقق من دعم المتصفح للإشعارات وحالة الإذن
  useEffect(() => {
    const checkSupport = async () => {
      // التحقق من دعم الإشعارات بشكل عام
      const isSupported = 'Notification' in window;
      setSupported(isSupported);

      if (isSupported) {
        // التحقق من حالة الإذن
        const permission = Notification.permission;
        setGranted(permission === 'granted');

        // التحقق من وجود اشتراك في OneSignal
        if (window.OneSignal) {
          try {
            const isPushSupported = await window.OneSignal.Notifications.isPushSupported();
            if (isPushSupported) {
              const isEnabled = window.OneSignal.Notifications.permission;
              setSubscription(isEnabled);
            }
          } catch (error) {
            console.error('خطأ في التحقق من حالة اشتراك OneSignal:', error);
          }
        }
      }
    };

    checkSupport();
  }, []);

  // ربط المستخدم بمعرف خارجي في OneSignal عند تسجيل الدخول
  useEffect(() => {
    if (user && user.id && subscription) {
      oneSignalService.setExternalUserId(user.id);
    }
    return () => {
      if (user && user.id && subscription) {
        // لا داعي لإزالة المعرف عند إلغاء تحميل المكون
        // oneSignalService.removeExternalUserId();
      }
    };
  }, [user, subscription]);

  // طلب إذن للإشعارات
  const requestPermission = async (): Promise<boolean> => {
    if (!supported) {
      toast.error('متصفحك لا يدعم الإشعارات');
      return false;
    }

    try {
      const result = await oneSignalService.requestNotificationPermission();
      setGranted(result);
      return result;
    } catch (error) {
      console.error('خطأ في طلب إذن الإشعارات:', error);
      toast.error('حدث خطأ أثناء طلب إذن الإشعارات');
      return false;
    }
  };

  // الاشتراك في الإشعارات
  const subscribeToNotifications = async (): Promise<boolean> => {
    try {
      setSubscribing(true);

      // التأكد من وجود إذن للإشعارات
      if (!granted) {
        const permissionGranted = await requestPermission();
        if (!permissionGranted) {
          setSubscribing(false);
          return false;
        }
      }

      // تفعيل إشعارات OneSignal
      if (window.OneSignal) {
        try {
          // طلب الاشتراك من خلال واجهة برمجة OneSignal
          await window.OneSignal.Notifications.setEnabled(true);
          
          // التحقق من نجاح الاشتراك
          const isSubscribed = window.OneSignal.Notifications.permission;
          setSubscription(isSubscribed);
          
          if (isSubscribed) {
            toast.success('تم تفعيل الإشعارات بنجاح');
            
            // ربط معرف المستخدم إذا كان مسجل الدخول
            if (user && user.id) {
              await oneSignalService.setExternalUserId(user.id);
            }
            
            return true;
          } else {
            toast.error('فشل تفعيل الإشعارات');
            return false;
          }
        } catch (error) {
          console.error('خطأ في الاشتراك بإشعارات OneSignal:', error);
          toast.error('حدث خطأ أثناء تفعيل الإشعارات');
          return false;
        }
      } else {
        toast.error('خدمة الإشعارات غير متاحة حاليًا');
        return false;
      }
    } catch (error) {
      console.error('خطأ في عملية الاشتراك بالإشعارات:', error);
      toast.error('حدث خطأ أثناء عملية الاشتراك');
      return false;
    } finally {
      setSubscribing(false);
    }
  };

  // إلغاء الاشتراك في الإشعارات
  const unsubscribeFromNotifications = async (): Promise<boolean> => {
    try {
      setSubscribing(true);

      if (window.OneSignal) {
        try {
          // إلغاء ربط معرف المستخدم إذا كان مسجل الدخول
          if (user && user.id) {
            await oneSignalService.removeExternalUserId();
          }
          
          // إلغاء الاشتراك من خلال واجهة برمجة OneSignal
          await window.OneSignal.Notifications.setEnabled(false);
          
          setSubscription(false);
          toast.success('تم إيقاف الإشعارات بنجاح');
          return true;
        } catch (error) {
          console.error('خطأ في إلغاء الاشتراك من إشعارات OneSignal:', error);
          toast.error('حدث خطأ أثناء إيقاف الإشعارات');
          return false;
        }
      } else {
        toast.error('خدمة الإشعارات غير متاحة حاليًا');
        return false;
      }
    } catch (error) {
      console.error('خطأ في عملية إلغاء الاشتراك من الإشعارات:', error);
      toast.error('حدث خطأ أثناء عملية إلغاء الاشتراك');
      return false;
    } finally {
      setSubscribing(false);
    }
  };

  return {
    supported,
    granted,
    subscription,
    subscribing,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications
  };
};
