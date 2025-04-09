
import { useEffect, useState, useCallback } from 'react';
import { useNotificationPermission } from './notifications/useNotificationPermission';
import { usePushSubscription } from './notifications/usePushSubscription';

/**
 * هوك إدارة الإشعارات الرئيسي
 * يجمع بين التحقق من الأذونات وإدارة الاشتراكات
 */
export function useNotifications() {
  const { supported, granted, requestPermission } = useNotificationPermission();
  const { 
    subscription, 
    subscribing,
    checkExistingSubscription,
    subscribeToNotifications, 
    unsubscribeFromNotifications 
  } = usePushSubscription(supported, granted);
  
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  
  // التحقق من وجود اشتراك عند تحميل المكون وعند تغيير حالة الإذن
  useEffect(() => {
    if (supported && granted && !subscribing && !isCheckingSubscription) {
      const checkSubscription = async () => {
        setIsCheckingSubscription(true);
        try {
          console.log("التحقق من وجود اشتراك للإشعارات...");
          const existingSubscription = await checkExistingSubscription();
          console.log("نتيجة التحقق من الاشتراك:", existingSubscription ? "موجود" : "غير موجود");
        } catch (error) {
          console.error("خطأ في التحقق من وجود اشتراك:", error);
        } finally {
          setIsCheckingSubscription(false);
        }
      };
      
      checkSubscription();
    }
  }, [supported, granted, checkExistingSubscription, subscribing, isCheckingSubscription]);
  
  // دالة اشتراك مبسطة تتعامل مع الإذن والاشتراك معًا
  const subscribeWithPermission = useCallback(async () => {
    try {
      if (!supported) {
        console.log("الإشعارات غير مدعومة");
        return null;
      }
      
      // طلب الإذن إذا لم يكن ممنوحًا بالفعل
      if (!granted) {
        const permissionGranted = await requestPermission();
        if (!permissionGranted) {
          console.log("لم يتم منح إذن الإشعارات");
          return null;
        }
      }
      
      // محاولة الاشتراك بعد منح الإذن
      return await subscribeToNotifications();
    } catch (error) {
      console.error("خطأ في عملية الاشتراك:", error);
      return null;
    }
  }, [supported, granted, requestPermission, subscribeToNotifications]);
  
  return {
    supported,
    granted,
    subscription,
    subscribing,
    isCheckingSubscription,
    requestPermission,
    subscribeToNotifications: subscribeWithPermission, // استخدام الدالة المحسّنة
    unsubscribeFromNotifications
  };
}
