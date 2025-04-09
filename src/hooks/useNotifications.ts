
import { useEffect, useState } from 'react';
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
  
  // التحقق من وجود اشتراك عند تحميل المكون
  useEffect(() => {
    if (supported && granted && !isCheckingSubscription) {
      const checkSubscription = async () => {
        setIsCheckingSubscription(true);
        try {
          const existingSubscription = await checkExistingSubscription();
          console.log("التحقق من الاشتراك:", existingSubscription ? "موجود" : "غير موجود");
        } finally {
          setIsCheckingSubscription(false);
        }
      };
      
      checkSubscription();
    }
  }, [supported, granted, checkExistingSubscription, isCheckingSubscription]);
  
  return {
    supported,
    granted,
    subscription,
    subscribing,
    isCheckingSubscription,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications
  };
}
