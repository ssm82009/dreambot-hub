
import { useEffect, useState } from 'react';
import { useNotificationPermission } from './notifications/useNotificationPermission';
import { initializeFirebase, registerForPushNotifications } from '@/services/firebaseService';

/**
 * هوك إدارة الإشعارات الرئيسي
 * يجمع بين التحقق من الأذونات وإدارة الاشتراكات
 */
export function useNotifications() {
  const { supported, granted, requestPermission } = useNotificationPermission();
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // تهيئة Firebase عند تحميل المكون
  useEffect(() => {
    async function init() {
      try {
        // تجنب إعادة التهيئة إذا كانت قد تمت بالفعل
        if (initialized) {
          setInitializing(false);
          return;
        }
        
        console.log("جاري تهيئة Firebase...");
        const firebaseInitialized = await initializeFirebase();
        
        if (!firebaseInitialized) {
          console.error("فشل في تهيئة Firebase");
        } else {
          console.log("تم تهيئة Firebase بنجاح");
          setInitialized(true);
        }
      } catch (error) {
        console.error("خطأ أثناء تهيئة Firebase:", error);
      } finally {
        setInitializing(false);
      }
    }

    init();
  }, [initialized]);

  // التحقق من وجود اشتراك عند تحميل المكون
  useEffect(() => {
    if (supported && granted && !initializing && initialized) {
      const checkToken = async () => {
        try {
          setSubscribing(true);
          console.log("التحقق من وجود رمز اشتراك Firebase...");
          
          // التحقق من وجود التوكن في التخزين المحلي
          const savedToken = localStorage.getItem('fcm_token');
          
          if (savedToken) {
            console.log("تم العثور على رمز محفوظ:", savedToken);
            setToken(savedToken);
          } else {
            console.log("لم يتم العثور على رمز محفوظ، جاري طلب رمز جديد...");
            const newToken = await registerForPushNotifications();
            setToken(newToken);
          }
        } catch (error) {
          console.error("خطأ في التحقق من رمز الإشعارات:", error);
        } finally {
          setSubscribing(false);
        }
      };
      
      checkToken();
    }
  }, [supported, granted, initializing, initialized]);
  
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
    
    // التحقق من تهيئة Firebase
    if (!initialized && !initializing) {
      console.log("جاري محاولة إعادة تهيئة Firebase...");
      const firebaseInitialized = await initializeFirebase();
      if (!firebaseInitialized) {
        console.error("فشل في تهيئة Firebase");
        return null;
      }
      setInitialized(true);
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
      console.log("جاري تسجيل الجهاز للإشعارات...");
      const newToken = await registerForPushNotifications();
      
      if (newToken) {
        console.log("تم الحصول على رمز Firebase:", newToken);
        setToken(newToken);
      } else {
        console.error("فشل في الحصول على رمز Firebase");
      }
      
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
      
      console.log("جاري حذف رمز Firebase:", token);
      // حذف الرمز من التخزين المحلي
      localStorage.removeItem('fcm_token');
      
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
