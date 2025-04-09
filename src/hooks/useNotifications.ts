
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
  
  // التحقق من وجود اشتراك عند تحميل المكون
  useEffect(() => {
    if (supported && granted) {
      const checkSubscription = async () => {
        const existingSubscription = await checkExistingSubscription();
        console.log("التحقق من الاشتراك:", existingSubscription ? "موجود" : "غير موجود");
      };
      
      checkSubscription();
    }
  }, [supported, granted, checkExistingSubscription]);
  
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
