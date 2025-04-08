
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationPermission {
  granted: boolean;
  supported: boolean;
  subscription: PushSubscription | null;
  subscribing: boolean;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    supported: false,
    subscription: null,
    subscribing: false
  });
  
  // تحقق من دعم الإشعارات
  useEffect(() => {
    const checkNotificationSupport = async () => {
      const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
      
      if (supported) {
        const permission = Notification.permission;
        const granted = permission === 'granted';
        
        try {
          // إذا كان التصريح ممنوحًا، تحقق من وجود اشتراك
          let subscription = null;
          if (granted) {
            const swRegistration = await navigator.serviceWorker.ready;
            subscription = await swRegistration.pushManager.getSubscription();
            console.log("تم العثور على اشتراك الإشعارات:", subscription);
          }
          
          setPermission({
            granted,
            supported,
            subscription,
            subscribing: false
          });
        } catch (error) {
          console.error("خطأ في التحقق من اشتراك الإشعارات:", error);
          setPermission({
            granted,
            supported,
            subscription: null,
            subscribing: false
          });
        }
      } else {
        setPermission({
          granted: false,
          supported,
          subscription: null,
          subscribing: false
        });
      }
    };
    
    checkNotificationSupport();
  }, []);
  
  // طلب إذن الإشعارات
  const requestPermission = async () => {
    if (!permission.supported) {
      toast.error('متصفحك لا يدعم الإشعارات');
      return false;
    }
    
    try {
      console.log("طلب إذن الإشعارات...");
      const result = await Notification.requestPermission();
      const granted = result === 'granted';
      
      console.log("نتيجة طلب إذن الإشعارات:", result);
      
      setPermission(prev => ({
        ...prev,
        granted
      }));
      
      if (granted) {
        toast.success('تم السماح بالإشعارات');
        return true;
      } else {
        toast.error('لم يتم السماح بالإشعارات');
        return false;
      }
    } catch (error) {
      console.error('خطأ في طلب إذن الإشعارات:', error);
      toast.error('حدث خطأ أثناء طلب إذن الإشعارات');
      return false;
    }
  };
  
  // الاشتراك في الإشعارات
  const subscribeToNotifications = async () => {
    if (!permission.supported) {
      toast.error('متصفحك لا يدعم الإشعارات');
      return null;
    }
    
    try {
      setPermission(prev => ({ ...prev, subscribing: true }));
      
      // طلب الإذن إذا لم يكن ممنوحًا بالفعل
      if (Notification.permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          setPermission(prev => ({ ...prev, subscribing: false }));
          return null;
        }
      }
      
      console.log("بدء عملية الاشتراك في الإشعارات...");
      
      // انتظار جاهزية service worker
      const swRegistration = await navigator.serviceWorker.ready;
      console.log("Service Worker جاهز:", swRegistration);
      
      // التحقق من وجود اشتراك حالي
      let subscription = await swRegistration.pushManager.getSubscription();
      
      // إذا كان المتصفح مشتركًا بالفعل، ارجع الاشتراك الحالي
      if (subscription) {
        console.log("تم العثور على اشتراك موجود:", subscription);
        setPermission(prev => ({
          ...prev,
          subscription,
          subscribing: false,
          granted: true
        }));
        return subscription;
      }
      
      // إنشاء مفتاح VAPID (استخدم مفتاح عام افتراضي للعرض فقط)
      const publicVapidKey = 'BLBz5HW9GU26px7aSGgqZR9xoA7Sj5Q8q0c7_KMgPgTcgccR9EkTuZAs5TmGpJ9liMPHvw4-l7-Ftm1Qz-5qvEs';
      
      const options = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      };
      
      console.log("محاولة الاشتراك في Push Manager...");
      subscription = await swRegistration.pushManager.subscribe(options);
      console.log("تم الاشتراك بنجاح:", subscription);
      
      // تخزين اشتراك المستخدم في قاعدة البيانات عبر edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          console.log("تخزين الاشتراك في قاعدة البيانات...");
          // استخدام Edge Function لتخزين الاشتراك
          const { error } = await supabase.functions.invoke('store-subscription', {
            body: {
              userId: session.user.id,
              endpoint: subscription.endpoint,
              auth: JSON.stringify(subscription.toJSON())
            }
          });
          
          if (error) {
            console.error("خطأ في تخزين الاشتراك:", error);
            throw error;
          }
          
          console.log("تم تخزين الاشتراك بنجاح");
          
        } catch (error) {
          console.error('خطأ في تخزين اشتراك الإشعارات:', error);
        }
      }
      
      setPermission(prev => ({
        ...prev,
        subscription,
        subscribing: false,
        granted: true
      }));
      
      toast.success('تم الاشتراك في الإشعارات بنجاح');
      return subscription;
    } catch (error) {
      console.error('خطأ في الاشتراك في الإشعارات:', error);
      toast.error('حدث خطأ أثناء الاشتراك في الإشعارات');
      setPermission(prev => ({ ...prev, subscribing: false }));
      return null;
    }
  };
  
  // إلغاء الاشتراك في الإشعارات
  const unsubscribeFromNotifications = async () => {
    if (!permission.subscription) {
      toast.error('لا يوجد اشتراك نشط للإشعارات');
      return false;
    }
    
    try {
      console.log("إلغاء الاشتراك من الإشعارات...");
      await permission.subscription.unsubscribe();
      console.log("تم إلغاء الاشتراك بنجاح");
      
      // حذف الاشتراك من قاعدة البيانات عبر edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          console.log("حذف الاشتراك من قاعدة البيانات...");
          // استخدام Edge Function لحذف الاشتراك
          const { error } = await supabase.functions.invoke('remove-subscription', {
            body: {
              userId: session.user.id,
              endpoint: permission.subscription.endpoint
            }
          });
          
          if (error) {
            console.error("خطأ في حذف الاشتراك:", error);
            throw error;
          }
          console.log("تم حذف الاشتراك من قاعدة البيانات بنجاح");
          
        } catch (error) {
          console.error('خطأ في حذف اشتراك الإشعارات:', error);
        }
      }
      
      setPermission(prev => ({
        ...prev,
        subscription: null
      }));
      
      toast.success('تم إلغاء الاشتراك من الإشعارات');
      return true;
    } catch (error) {
      console.error('خطأ في إلغاء الاشتراك من الإشعارات:', error);
      toast.error('حدث خطأ أثناء إلغاء الاشتراك من الإشعارات');
      return false;
    }
  };
  
  return {
    ...permission,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications
  };
}

// تحويل المفتاح العام من Base64 إلى صفيف Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}
