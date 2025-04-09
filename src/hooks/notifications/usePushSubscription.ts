import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { urlBase64ToUint8Array, FCM_VAPID_KEY } from '@/utils/pushNotificationUtils';

export interface PushSubscriptionState {
  subscription: PushSubscription | null;
  subscribing: boolean;
}

/**
 * هوك لإدارة اشتراكات الإشعارات
 */
export function usePushSubscription(supported: boolean, granted: boolean) {
  const [state, setState] = useState<PushSubscriptionState>({
    subscription: null,
    subscribing: false
  });

  // التحقق من وجود اشتراك حالي
  const checkExistingSubscription = useCallback(async (): Promise<PushSubscription | null> => {
    if (!supported || !granted) {
      return null;
    }

    try {
      const swRegistration = await navigator.serviceWorker.ready;
      const subscription = await swRegistration.pushManager.getSubscription();
      
      if (subscription) {
        setState(prev => ({
          ...prev,
          subscription
        }));
        console.log("تم العثور على اشتراك موجود:", subscription);
      }
      
      return subscription;
    } catch (error) {
      console.error("خطأ في التحقق من الاشتراك الحالي:", error);
      return null;
    }
  }, [supported, granted]);

  // التحقق من الاشتراك عند تحميل المكون
  useEffect(() => {
    if (supported && granted) {
      checkExistingSubscription();
    }
  }, [supported, granted, checkExistingSubscription]);

  // الاشتراك في الإشعارات
  const subscribeToNotifications = async () => {
    if (!supported) {
      toast.error('متصفحك لا يدعم الإشعارات');
      return null;
    }
    
    try {
      setState(prev => ({ ...prev, subscribing: true }));
      
      console.log("بدء عملية الاشتراك في الإشعارات...");
      
      // انتظار جاهزية service worker
      const swRegistration = await navigator.serviceWorker.ready;
      console.log("Service Worker جاهز:", swRegistration);
      
      // التحقق من وجود اشتراك حالي
      let subscription = await swRegistration.pushManager.getSubscription();
      
      // إذا كان المتصفح مشتركًا بالفعل، ارجع الاشتراك الحالي
      if (subscription) {
        console.log("تم العثور على اشتراك موجود:", subscription);
        setState(prev => ({
          ...prev,
          subscription,
          subscribing: false
        }));
        
        toast.success('أنت مشترك بالفعل في الإشعارات');
        return subscription;
      }
      
      // إنشاء اشتراك جديد
      const options = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(FCM_VAPID_KEY)
      };
      
      console.log("محاولة الاشتراك في Push Manager...");
      try {
        subscription = await swRegistration.pushManager.subscribe(options);
        console.log("تم الاشتراك بنجاح:", subscription);
      } catch (error) {
        console.error("خطأ في الاشتراك في Push Manager:", error);
        
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          toast.error('تم رفض الإشعارات من قبل المتصفح. يرجى تمكين الإشعارات من إعدادات المتصفح.');
          setState(prev => ({ ...prev, subscribing: false }));
          return null;
        }
        
        throw error;
      }
      
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
              auth: JSON.stringify(subscription)
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
      
      setState(prev => ({
        ...prev,
        subscription,
        subscribing: false
      }));
      
      toast.success('تم الاشتراك في الإشعارات بنجاح');
      return subscription;
    } catch (error) {
      console.error('خطأ في الاشتراك في الإشعارات:', error);
      toast.error('حدث خطأ أثناء الاشتراك في الإشعارات');
      setState(prev => ({ ...prev, subscribing: false }));
      return null;
    }
  };
  
  // إلغاء الاشتراك في الإشعارات
  const unsubscribeFromNotifications = async () => {
    if (!state.subscription) {
      toast.error('لا يوجد اشتراك نشط للإشعارات');
      return false;
    }
    
    try {
      console.log("إلغاء الاشتراك من الإشعارات...");
      await state.subscription.unsubscribe();
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
              endpoint: state.subscription.endpoint
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
      
      setState(prev => ({
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
    ...state,
    checkExistingSubscription,
    subscribeToNotifications,
    unsubscribeFromNotifications
  };
}
