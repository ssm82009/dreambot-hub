
import { useEffect, useState, useRef } from 'react';
import { useNotificationPermission } from './notifications/useNotificationPermission';
import { initializeFirebase, registerForPushNotifications } from '@/services/firebaseService';
import { toast } from 'sonner';

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
  
  // استخدام مراجع لتتبع حالة عرض رسائل التوست لمنع التكرار
  const hasShownSuccessToast = useRef<boolean>(false);
  const hasShownErrorToast = useRef<boolean>(false);
  const initializationAttempts = useRef<number>(0);
  const maxInitAttempts = 3;

  // تهيئة Firebase عند تحميل المكون
  useEffect(() => {
    async function init() {
      try {
        // تجنب إعادة التهيئة إذا كانت قد تمت بالفعل أو تجاوزت عدد المحاولات
        if (initialized || initializationAttempts.current >= maxInitAttempts) {
          setInitializing(false);
          return;
        }
        
        initializationAttempts.current += 1;
        console.log(`محاولة تهيئة Firebase (${initializationAttempts.current}/${maxInitAttempts})...`);
        
        const firebaseInitialized = await initializeFirebase();
        
        if (!firebaseInitialized) {
          console.error("فشل في تهيئة Firebase");
          
          // إعادة المحاولة بعد فترة إذا لم نصل للحد الأقصى
          if (initializationAttempts.current < maxInitAttempts) {
            setTimeout(() => {
              setInitialized(false); // إعادة تعيين الحالة لإعادة المحاولة
            }, 2000);
          }
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
  
  // إعادة تعيين حالة التوست عند تغير التوكن
  useEffect(() => {
    if (token !== null) {
      hasShownSuccessToast.current = false;
      hasShownErrorToast.current = false;
    }
  }, [token]);
  
  // وظيفة الاشتراك في الإشعارات
  const subscribeToNotifications = async () => {
    if (!supported) {
      console.error("الإشعارات غير مدعومة");
      if (!hasShownErrorToast.current) {
        toast.error("متصفحك لا يدعم الإشعارات");
        hasShownErrorToast.current = true;
      }
      return null;
    }

    if (Notification.permission === 'denied') {
      console.error("تم رفض إذن الإشعارات");
      if (!hasShownErrorToast.current) {
        toast.error("تم رفض الإشعارات من قبل المتصفح. يرجى تمكينها من الإعدادات");
        hasShownErrorToast.current = true;
      }
      return null;
    }
    
    // التحقق من تهيئة Firebase
    if (!initialized && !initializing) {
      console.log("جاري محاولة إعادة تهيئة Firebase...");
      const firebaseInitialized = await initializeFirebase();
      if (!firebaseInitialized) {
        console.error("فشل في تهيئة Firebase");
        if (!hasShownErrorToast.current) {
          toast.error("فشل في الاتصال بخدمة الإشعارات");
          hasShownErrorToast.current = true;
        }
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
          if (!hasShownErrorToast.current) {
            toast.error("تم رفض الإشعارات من قبل المتصفح");
            hasShownErrorToast.current = true;
          }
          setSubscribing(false);
          return null;
        }
      }

      // تسجيل الإشعارات
      console.log("جاري تسجيل الجهاز للإشعارات...");
      const newToken = await registerForPushNotifications();
      
      if (newToken) {
        console.log("تم الحصول على رمز Firebase:", newToken);
        setToken(newToken);
        
        if (!hasShownSuccessToast.current) {
          toast.success("تم تفعيل الإشعارات بنجاح");
          hasShownSuccessToast.current = true;
        }
        
        return newToken;
      } else {
        console.error("فشل في الحصول على رمز Firebase");
        
        if (!hasShownErrorToast.current) {
          toast.error("فشل في تفعيل الإشعارات");
          hasShownErrorToast.current = true;
        }
        
        return null;
      }
    } catch (error) {
      console.error("خطأ في الاشتراك في الإشعارات:", error);
      
      if (!hasShownErrorToast.current) {
        toast.error("حدث خطأ أثناء تفعيل الإشعارات");
        hasShownErrorToast.current = true;
      }
      
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
      hasShownSuccessToast.current = false;
      hasShownErrorToast.current = false;
      
      toast.success("تم إلغاء تفعيل الإشعارات بنجاح");
      
      return true;
    } catch (error) {
      console.error("خطأ في إلغاء الاشتراك من الإشعارات:", error);
      toast.error("فشل في إلغاء تفعيل الإشعارات");
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
