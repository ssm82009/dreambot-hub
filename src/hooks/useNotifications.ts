
import { useEffect, useState } from 'react';
import { useNotificationPermission } from './notifications/useNotificationPermission';
import { initializeFirebase, registerForPushNotifications, deleteFcmToken } from '@/services/firebaseService';

/**
 * هوك إدارة الإشعارات الرئيسي
 * يجمع بين التحقق من الأذونات وإدارة الاشتراكات
 */
export function useNotifications() {
  const { supported, granted, requestPermission } = useNotificationPermission();
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  // تهيئة Firebase عند تحميل المكون
  useEffect(() => {
    async function init() {
      try {
        const initialized = await initializeFirebase();
        if (!initialized) {
          console.error("فشل في تهيئة Firebase");
        }
      } catch (error) {
        console.error("خطأ أثناء تهيئة Firebase:", error);
      } finally {
        setInitializing(false);
      }
    }

    init();
  }, []);

  // التحقق من وجود اشتراك عند تحميل المكون
  useEffect(() => {
    if (supported && granted && !initializing) {
      const checkToken = async () => {
        try {
          setSubscribing(true);
          const newToken = await registerForPushNotifications();
          console.log("التحقق من الرمز:", newToken ? "موجود" : "غير موجود");
          setToken(newToken);
        } catch (error) {
          console.error("خطأ في التحقق من رمز الإشعارات:", error);
        } finally {
          setSubscribing(false);
        }
      };
      
      checkToken();
    }
  }, [supported, granted, initializing]);
  
  // وظيفة الاشتراك في الإشعارات
  const subscribeToNotifications = async () => {
    if (!supported) {
      console.error("الإشعارات غير مدعومة");
      return null;
    }

    if (Notification.permission === 'denied') {
      console.error("تم رفض إذن الإشعارات");
      return null;
    }

    try {
      setSubscribing(true);

      // إذا لم يكن هناك إذن، اطلب إذن الإشعارات
      if (Notification.permission !== 'granted') {
        const permissionGranted = await requestPermission();
        if (!permissionGranted) {
          return null;
        }
      }

      // تسجيل الإشعارات
      const newToken = await registerForPushNotifications();
      setToken(newToken);
      
      return newToken;
    } catch (error) {
      console.error("خطأ في الاشتراك في الإشعارات:", error);
      return null;
    } finally {
      setSubscribing(false);
    }
  };

  // وظيفة إلغاء الاشتراك من الإشعارات
  const unsubscribeFromNotifications = async () => {
    if (!token) {
      console.error("لا يوجد رمز لإلغاء الاشتراك منه");
      return false;
    }

    try {
      setSubscribing(true);
      
      // حذف الرمز من قاعدة البيانات
      await deleteFcmToken(token);
      
      setToken(null);
      
      return true;
    } catch (error) {
      console.error("خطأ في إلغاء الاشتراك من الإشعارات:", error);
      return false;
    } finally {
      setSubscribing(false);
    }
  };
  
  return {
    supported,
    granted,
    subscription: token !== null,
    subscribing: initializing || subscribing,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications
  };
}
