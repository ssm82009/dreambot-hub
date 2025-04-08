
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
        
        // إذا كان التصريح ممنوحًا، تحقق من وجود اشتراك
        let subscription = null;
        if (granted) {
          const sw = await navigator.serviceWorker.ready;
          subscription = await sw.pushManager.getSubscription();
        }
        
        setPermission({
          granted,
          supported,
          subscription,
          subscribing: false
        });
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
      const result = await Notification.requestPermission();
      const granted = result === 'granted';
      
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
    if (!permission.supported) return null;
    
    // طلب الإذن إذا لم يكن ممنوحًا بالفعل
    if (!permission.granted) {
      const granted = await requestPermission();
      if (!granted) return null;
    }
    
    try {
      setPermission(prev => ({ ...prev, subscribing: true }));
      
      const sw = await navigator.serviceWorker.ready;
      
      // التحقق من وجود اشتراك حالي
      let subscription = await sw.pushManager.getSubscription();
      
      // إذا كان المتصفح مشتركًا بالفعل، ارجع الاشتراك الحالي
      if (subscription) {
        setPermission(prev => ({
          ...prev,
          subscription,
          subscribing: false
        }));
        return subscription;
      }
      
      // إنشاء اشتراك جديد - في بيئة الإنتاج يجب توفير مفتاح VAPID من الخادم
      // هنا نستخدم مفتاح عام افتراضي لأغراض العرض فقط
      const publicVapidKey = 'BLBz5HW9GU26px7aSGgqZR9xoA7Sj5Q8q0c7_KMgPgTcgccR9EkTuZAs5TmGpJ9liMPHvw4-l7-Ftm1Qz-5qvEs';
      
      const options = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      };
      
      subscription = await sw.pushManager.subscribe(options);
      
      // تخزين اشتراك المستخدم في قاعدة البيانات
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // معالجة تخزين الاشتراك دون الوصول مباشرة إلى push_subscriptions
        // في حالة التنفيذ الفعلي، سنستخدم edge function لهذا
        try {
          // سنستخدم edge function بدلاً من محاولة الكتابة المباشرة للجدول
          console.log('تم إنشاء اشتراك للإشعارات:', subscription.endpoint);
        } catch (error) {
          console.error('خطأ في تخزين اشتراك الإشعارات:', error);
        }
      }
      
      setPermission(prev => ({
        ...prev,
        subscription,
        subscribing: false
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
    if (!permission.subscription) return false;
    
    try {
      await permission.subscription.unsubscribe();
      
      // حذف الاشتراك من قاعدة البيانات
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // في حالة التنفيذ الفعلي، سنستخدم edge function لهذا
        // بدلاً من محاولة الحذف المباشر من الجدول
        console.log('تم إلغاء اشتراك الإشعارات:', permission.subscription.endpoint);
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
